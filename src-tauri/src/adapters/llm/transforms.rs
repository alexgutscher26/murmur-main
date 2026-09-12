/*!
 * SOURCE OF TRUTH KEYWORDS: VoiceTransformIntent, VoiceTransformParser,
 *   extract_voice_transform, build_prompt_for_model, ModelPromptFormat
 * WHAT:  Detects conversational voice transformation commands in speech and formats
 *        targeted LLM prompts for Qwen 2.5 and Phi-3.5 GGUF models.
 * WHY:   Allows users to naturally speak meta-commands like "Hey HushWrite, make that formal"
 *        or "Hey HushWrite, bullet points" while dictating. The parser cleanly separates
 *        the dictated payload from the command and configures tone/structure rewriting.
 * WHERE: adapters/llm/transforms.rs; used by LlmTextEnhancer.
 */

use crate::types::DictionaryEntry;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(tag = "kind", content = "payload", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VoiceTransformIntent {
    Formal,
    Casual,
    Concise,
    BulletedList,
    EmailDraft,
    FixGrammarOnly,
    Translate { target_language: String },
    Custom { instruction: String },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedVoiceTransform {
    pub base_text: String,
    pub intent: Option<VoiceTransformIntent>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModelPromptFormat {
    /// ChatML format used by Qwen 2.5 Instruct
    ChatML,
    /// Phi-3 / Phi-3.5 instruction format
    Phi3,
}

impl ModelPromptFormat {
    pub fn for_model_id(model_id: &str) -> Self {
        let lower = model_id.to_lowercase();
        if lower.contains("phi") {
            Self::Phi3
        } else {
            Self::ChatML
        }
    }
}

pub struct VoiceTransformParser;

#[derive(Debug, Clone)]
struct WordToken {
    start: usize,
    end: usize,
    norm: String,
}

impl VoiceTransformParser {
    /// Normalizes a string by converting to lowercase and stripping punctuation into spaces.
    pub fn normalize_phrase(s: &str) -> String {
        s.chars()
            .map(|c| if c.is_alphanumeric() { c.to_ascii_lowercase() } else { ' ' })
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    }

    fn tokenize_words(text: &str) -> Vec<WordToken> {
        let mut tokens = Vec::new();
        let mut current_start = None;

        for (byte_idx, ch) in text.char_indices() {
            if ch.is_alphanumeric() {
                if current_start.is_none() {
                    current_start = Some(byte_idx);
                }
            } else if let Some(start) = current_start {
                let slice = &text[start..byte_idx];
                tokens.push(WordToken {
                    start,
                    end: byte_idx,
                    norm: slice.to_lowercase(),
                });
                current_start = None;
            }
        }

        if let Some(start) = current_start {
            let slice = &text[start..];
            tokens.push(WordToken {
                start,
                end: text.len(),
                norm: slice.to_lowercase(),
            });
        }

        tokens
    }

    fn get_wake_candidates(configured_trigger: &str) -> Vec<Vec<String>> {
        let mut candidates = Vec::new();
        let norm_config = Self::normalize_phrase(configured_trigger);
        let config_words: Vec<String> = norm_config.split_whitespace().map(|s| s.to_string()).collect();

        if !config_words.is_empty() {
            candidates.push(config_words.clone());
            // If configured starts with "hey", also add without "hey"
            if config_words.len() > 1 && config_words[0] == "hey" {
                candidates.push(config_words[1..].to_vec());
            }
        }

        // Always include default HushWrite variations
        candidates.push(vec!["hey".into(), "hushwrite".into()]);
        candidates.push(vec!["hey".into(), "hush".into(), "write".into()]);
        candidates.push(vec!["hushwrite".into()]);
        candidates.push(vec!["hush".into(), "write".into()]);

        // Sort longest candidate sequences first
        candidates.sort_by(|a, b| b.len().cmp(&a.len()));
        candidates.dedup();
        candidates
    }

    fn find_wake_prefix_offset(text: &str, configured_trigger: &str) -> Option<usize> {
        let tokens = Self::tokenize_words(text);
        if tokens.is_empty() {
            return None;
        }

        let candidates = Self::get_wake_candidates(configured_trigger);
        for cand in &candidates {
            if tokens.len() >= cand.len() {
                let matches = cand.iter().enumerate().all(|(i, word)| tokens[i].norm == *word);
                if matches {
                    let last_token_idx = cand.len() - 1;
                    return Some(tokens[last_token_idx].end);
                }
            }
        }

        None
    }

    fn find_wake_suffix_split<'a>(text: &'a str, configured_trigger: &str) -> Option<(&'a str, &'a str)> {
        let tokens = Self::tokenize_words(text);
        if tokens.is_empty() {
            return None;
        }

        let candidates = Self::get_wake_candidates(configured_trigger);

        // Search backwards from the end of the text
        for start_idx in (0..tokens.len()).rev() {
            for cand in &candidates {
                if start_idx + cand.len() <= tokens.len() {
                    let matches = cand.iter().enumerate().all(|(i, word)| tokens[start_idx + i].norm == *word);
                    if matches {
                        let mut wake_start_byte = tokens[start_idx].start;
                        let wake_end_byte = tokens[start_idx + cand.len() - 1].end;

                        // If wake phrase matched without "hey" (e.g. "hushwrite"), check if preceding token is "hey"
                        if start_idx > 0 && tokens[start_idx - 1].norm == "hey" {
                            wake_start_byte = tokens[start_idx - 1].start;
                        }

                        let before_wake = &text[..wake_start_byte];
                        let instruction = &text[wake_end_byte..];
                        return Some((before_wake, instruction));
                    }
                }
            }
        }

        None
    }

    /// Parses spoken text to detect conversational voice transformation triggers.
    pub fn parse(raw_text: &str, trigger_phrase: Option<&str>) -> ParsedVoiceTransform {
        let trimmed = raw_text.trim();
        if trimmed.is_empty() {
            return ParsedVoiceTransform {
                base_text: String::new(),
                intent: None,
            };
        }

        let configured_trigger = trigger_phrase
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("Hey HushWrite");

        // 1. Check if trigger occurs as a prefix: "Hey HushWrite, make that formal: <text>"
        if let Some(after_wake_offset) = Self::find_wake_prefix_offset(trimmed, configured_trigger) {
            let without_wake = &trimmed[after_wake_offset..];
            let clean_start = without_wake.trim_start_matches([',', ':', ' ', '-', '.', '!', '?']);
            if let Some((intent, remainder)) = Self::extract_intent_from_prefix(clean_start) {
                return ParsedVoiceTransform {
                    base_text: remainder.to_string(),
                    intent: Some(intent),
                };
            }
        }

        // 2. Check if trigger occurs near the end of dictation: "<text> hey hushwrite make that formal"
        if let Some((before_wake, instruction)) = Self::find_wake_suffix_split(trimmed, configured_trigger) {
            let clean_instr = instruction.trim_start_matches([',', ':', ' ', '-', '.', '!', '?']);
            let intent = Self::classify_instruction(clean_instr);
            let clean_base = before_wake.trim().trim_end_matches([',', '.', ';', ':', '-', '!', '?']);

            if !clean_base.is_empty() && !clean_instr.is_empty() {
                return ParsedVoiceTransform {
                    base_text: clean_base.to_string(),
                    intent: Some(intent),
                };
            }
        }

        // 3. Fallback: Check trailing commands without explicit wake phrase (e.g. "<dictation> make that formal")
        if let Some((clean_base, intent)) = Self::extract_trailing_command(trimmed) {
            return ParsedVoiceTransform {
                base_text: clean_base,
                intent: Some(intent),
            };
        }

        ParsedVoiceTransform {
            base_text: trimmed.to_string(),
            intent: None,
        }
    }

    fn extract_intent_from_prefix(text: &str) -> Option<(VoiceTransformIntent, &str)> {
        if text.is_empty() {
            return None;
        }

        let lower = text.to_lowercase();

        // Check if there is an explicit colon or dash or newline delimiter
        for delim in [":", " - ", "\n"] {
            if let Some(pos) = lower.find(delim) {
                let cmd = &lower[..pos].trim();
                let remainder = &text[pos + delim.len()..].trim();
                if !remainder.is_empty() && !cmd.is_empty() && cmd.split_whitespace().count() <= 10 {
                    let intent = Self::classify_instruction(cmd);
                    return Some((intent, remainder));
                }
            }
        }

        // Check translation prefixes
        for trans_prefix in [
            "translate this into ",
            "translate this to ",
            "translate into ",
            "translate to ",
        ] {
            if lower.starts_with(trans_prefix) {
                let after = &text[trans_prefix.len()..];
                let parts: Vec<&str> = after
                    .splitn(2, |c: char| c == ':' || c == ',' || c == '.' || c == ' ')
                    .collect();
                if parts.len() == 2 {
                    let lang = parts[0].trim().trim_matches([':', ',', '.']);
                    let remainder = after[parts[0].len()..].trim_start_matches([':', ',', '.', '!', '?', '-', ' ']);
                    if !lang.is_empty() && !remainder.is_empty() {
                        return Some((
                            VoiceTransformIntent::Translate {
                                target_language: lang.to_string(),
                            },
                            remainder,
                        ));
                    }
                }
            }
        }

        // Check known command prefixes (sorted longest first)
        let cmd_patterns: &[(&str, VoiceTransformIntent)] = &[
            ("make that a bulleted list", VoiceTransformIntent::BulletedList),
            ("make this a bulleted list", VoiceTransformIntent::BulletedList),
            ("make a bulleted list", VoiceTransformIntent::BulletedList),
            ("make that a bullet list", VoiceTransformIntent::BulletedList),
            ("make this a bullet list", VoiceTransformIntent::BulletedList),
            ("make a bullet list", VoiceTransformIntent::BulletedList),
            ("make that bullet points", VoiceTransformIntent::BulletedList),
            ("make this bullet points", VoiceTransformIntent::BulletedList),
            ("summarize in bullet points", VoiceTransformIntent::BulletedList),
            ("summarize as bullet points", VoiceTransformIntent::BulletedList),
            ("summarize into bullets", VoiceTransformIntent::BulletedList),
            ("summarize as bullets", VoiceTransformIntent::BulletedList),
            ("convert to bullets", VoiceTransformIntent::BulletedList),
            ("bullet points", VoiceTransformIntent::BulletedList),
            ("bullet list", VoiceTransformIntent::BulletedList),
            ("bullets", VoiceTransformIntent::BulletedList),

            ("turn this into an email", VoiceTransformIntent::EmailDraft),
            ("turn that into an email", VoiceTransformIntent::EmailDraft),
            ("format as an email", VoiceTransformIntent::EmailDraft),
            ("format as email", VoiceTransformIntent::EmailDraft),
            ("make this an email", VoiceTransformIntent::EmailDraft),
            ("make that an email", VoiceTransformIntent::EmailDraft),
            ("draft an email", VoiceTransformIntent::EmailDraft),
            ("email draft", VoiceTransformIntent::EmailDraft),

            ("make that professional", VoiceTransformIntent::Formal),
            ("make this professional", VoiceTransformIntent::Formal),
            ("make it professional", VoiceTransformIntent::Formal),
            ("rewrite professionally", VoiceTransformIntent::Formal),
            ("rewrite professional", VoiceTransformIntent::Formal),
            ("sound professional", VoiceTransformIntent::Formal),
            ("professional tone", VoiceTransformIntent::Formal),
            ("make that formal", VoiceTransformIntent::Formal),
            ("make this formal", VoiceTransformIntent::Formal),
            ("make it formal", VoiceTransformIntent::Formal),
            ("rewrite formal", VoiceTransformIntent::Formal),
            ("sound formal", VoiceTransformIntent::Formal),
            ("formal tone", VoiceTransformIntent::Formal),

            ("make that casual", VoiceTransformIntent::Casual),
            ("make this casual", VoiceTransformIntent::Casual),
            ("make it casual", VoiceTransformIntent::Casual),
            ("make that friendly", VoiceTransformIntent::Casual),
            ("make this friendly", VoiceTransformIntent::Casual),
            ("sound casual", VoiceTransformIntent::Casual),
            ("sound friendly", VoiceTransformIntent::Casual),
            ("casual tone", VoiceTransformIntent::Casual),

            ("make that concise", VoiceTransformIntent::Concise),
            ("make this concise", VoiceTransformIntent::Concise),
            ("make it concise", VoiceTransformIntent::Concise),
            ("make that brief", VoiceTransformIntent::Concise),
            ("make this brief", VoiceTransformIntent::Concise),
            ("make that short", VoiceTransformIntent::Concise),
            ("make this short", VoiceTransformIntent::Concise),
            ("shorten this", VoiceTransformIntent::Concise),
            ("shorten that", VoiceTransformIntent::Concise),
            ("summarize this", VoiceTransformIntent::Concise),
            ("summarize that", VoiceTransformIntent::Concise),

            ("fix grammar only", VoiceTransformIntent::FixGrammarOnly),
            ("fix grammar and spelling", VoiceTransformIntent::FixGrammarOnly),
            ("fix spelling and grammar", VoiceTransformIntent::FixGrammarOnly),
            ("fix grammar", VoiceTransformIntent::FixGrammarOnly),
            ("fix spelling", VoiceTransformIntent::FixGrammarOnly),
            ("correct grammar", VoiceTransformIntent::FixGrammarOnly),
        ];

        for (pat, intent) in cmd_patterns {
            if lower.starts_with(pat) {
                let rest = &text[pat.len()..];
                let remainder = rest.trim_start_matches([':', ',', '.', '!', '?', '-', ' ']);
                if !remainder.is_empty() {
                    return Some((intent.clone(), remainder));
                }
            }
        }

        None
    }

    fn extract_trailing_command(text: &str) -> Option<(String, VoiceTransformIntent)> {
        let lower = text.to_lowercase();
        let trailing_patterns: &[(&str, VoiceTransformIntent)] = &[
            ("make that formal", VoiceTransformIntent::Formal),
            ("make this formal", VoiceTransformIntent::Formal),
            ("make it formal", VoiceTransformIntent::Formal),
            ("make that professional", VoiceTransformIntent::Formal),
            ("make this professional", VoiceTransformIntent::Formal),
            ("make it professional", VoiceTransformIntent::Formal),
            ("sound professional", VoiceTransformIntent::Formal),
            ("sound formal", VoiceTransformIntent::Formal),
            ("make that casual", VoiceTransformIntent::Casual),
            ("make this casual", VoiceTransformIntent::Casual),
            ("make it casual", VoiceTransformIntent::Casual),
            ("make that friendly", VoiceTransformIntent::Casual),
            ("make this friendly", VoiceTransformIntent::Casual),
            ("sound casual", VoiceTransformIntent::Casual),
            ("sound friendly", VoiceTransformIntent::Casual),
            ("make that concise", VoiceTransformIntent::Concise),
            ("make this concise", VoiceTransformIntent::Concise),
            ("make it concise", VoiceTransformIntent::Concise),
            ("make that brief", VoiceTransformIntent::Concise),
            ("make this brief", VoiceTransformIntent::Concise),
            ("shorten this", VoiceTransformIntent::Concise),
            ("shorten that", VoiceTransformIntent::Concise),
            ("make that a bulleted list", VoiceTransformIntent::BulletedList),
            ("make this a bulleted list", VoiceTransformIntent::BulletedList),
            ("make a bulleted list", VoiceTransformIntent::BulletedList),
            ("make that a bullet list", VoiceTransformIntent::BulletedList),
            ("make this a bullet list", VoiceTransformIntent::BulletedList),
            ("make a bullet list", VoiceTransformIntent::BulletedList),
            ("make that bullet points", VoiceTransformIntent::BulletedList),
            ("make this bullet points", VoiceTransformIntent::BulletedList),
            ("summarize in bullet points", VoiceTransformIntent::BulletedList),
            ("summarize as bullet points", VoiceTransformIntent::BulletedList),
            ("summarize as bullets", VoiceTransformIntent::BulletedList),
            ("turn this into an email", VoiceTransformIntent::EmailDraft),
            ("turn that into an email", VoiceTransformIntent::EmailDraft),
            ("format as an email", VoiceTransformIntent::EmailDraft),
            ("format as email", VoiceTransformIntent::EmailDraft),
            ("make this an email", VoiceTransformIntent::EmailDraft),
            ("make that an email", VoiceTransformIntent::EmailDraft),
            ("fix grammar only", VoiceTransformIntent::FixGrammarOnly),
            ("fix grammar", VoiceTransformIntent::FixGrammarOnly),
        ];

        for (pattern, intent) in trailing_patterns {
            if let Some(pos) = lower.rfind(pattern) {
                if pos > 0 && (lower.as_bytes()[pos - 1] == b' ' || lower.as_bytes()[pos - 1] == b',' || lower.as_bytes()[pos - 1] == b'.') {
                    let base = text[..pos].trim().trim_end_matches([',', '.', ';', ':', '-', '!', '?']);
                    if !base.is_empty() {
                        return Some((base.to_string(), intent.clone()));
                    }
                }
            }
        }

        None
    }

    pub fn classify_instruction(instr: &str) -> VoiceTransformIntent {
        let lower = instr.to_lowercase();
        if lower.contains("formal") || lower.contains("professional") || lower.contains("executive") {
            VoiceTransformIntent::Formal
        } else if lower.contains("casual") || lower.contains("friendly") || lower.contains("relaxed") {
            VoiceTransformIntent::Casual
        } else if lower.contains("concise") || lower.contains("brief") || lower.contains("shorten") || lower.contains("tldr") {
            VoiceTransformIntent::Concise
        } else if lower.contains("bullet") || lower.contains("list") {
            VoiceTransformIntent::BulletedList
        } else if lower.contains("email") || lower.contains("mail") {
            VoiceTransformIntent::EmailDraft
        } else if lower.contains("grammar") || lower.contains("spelling") {
            VoiceTransformIntent::FixGrammarOnly
        } else if lower.contains("translate") {
            let raw_target = instr
                .split_whitespace()
                .skip_while(|&w| !w.eq_ignore_ascii_case("to") && !w.eq_ignore_ascii_case("into"))
                .nth(1)
                .unwrap_or("English")
                .trim_matches([':', ',', '.', '!', '?']);
            let mut c = raw_target.chars();
            let target = match c.next() {
                None => "English".to_string(),
                Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
            };
            VoiceTransformIntent::Translate { target_language: target }
        } else {
            VoiceTransformIntent::Custom { instruction: instr.to_string() }
        }
    }

    /// Formats the prompt with system instructions, user dictionary, and transcription content.
    pub fn build_prompt(
        format: ModelPromptFormat,
        dictation: &str,
        intent: Option<&VoiceTransformIntent>,
        dictionary: &[DictionaryEntry],
        custom_system_prompt: Option<&str>,
        target_language: Option<&str>,
    ) -> String {
        let mut system_instructions = String::from(
            "You are HushWrite, an expert high-speed on-device speech-to-text cleanup and transformation assistant. "
        );

        if let Some(custom) = custom_system_prompt {
            if !custom.trim().is_empty() {
                system_instructions.push_str(custom.trim());
                system_instructions.push(' ');
            }
        }

        match intent {
            Some(VoiceTransformIntent::Formal) => {
                system_instructions.push_str(
                    "Rewrite the transcribed text with a refined, professional, and formal executive tone. "
                );
            }
            Some(VoiceTransformIntent::Casual) => {
                system_instructions.push_str(
                    "Rewrite the text in a friendly, conversational, and approachable natural tone. "
                );
            }
            Some(VoiceTransformIntent::Concise) => {
                system_instructions.push_str(
                    "Make the text concise, punchy, and direct, removing redundant fluff without losing key facts. "
                );
            }
            Some(VoiceTransformIntent::BulletedList) => {
                system_instructions.push_str(
                    "Structure the transcribed key points into a clean, markdown bulleted list. "
                );
            }
            Some(VoiceTransformIntent::EmailDraft) => {
                system_instructions.push_str(
                    "Format and polish the dictation as a structured, professional email with a clear subject line and body. "
                );
            }
            Some(VoiceTransformIntent::FixGrammarOnly) => {
                system_instructions.push_str(
                    "Fix grammatical slips and punctuation while strictly retaining the user's exact phrasing and voice. "
                );
            }
            Some(VoiceTransformIntent::Translate { target_language }) => {
                system_instructions.push_str(&format!(
                    "Translate the text accurately and fluently into {target_language}. "
                ));
            }
            Some(VoiceTransformIntent::Custom { instruction }) => {
                system_instructions.push_str(&format!(
                    "Apply the following requested transformation: \"{instruction}\". "
                ));
            }
            None => {
                system_instructions.push_str(
                    "Perform clean smart transcription enhancement: remove conversational filler words ('um', 'uh', 'you know', 'like'), "
                );
                system_instructions.push_str(
                    "fix punctuation, capitalize correctly, and format numbers and paragraphs. Output ONLY the polished text with zero commentary."
                );
            }
        }

        if let Some(lang) = target_language {
            system_instructions.push_str(&format!(" The primary language is {lang}."));
        }

        if !dictionary.is_empty() {
            let terms: Vec<&str> = dictionary.iter().filter(|d| d.enabled).map(|d| d.replacement.as_str()).collect();
            if !terms.is_empty() {
                system_instructions.push_str(&format!(
                    " Maintain precise spelling for domain vocabulary terms: {}.",
                    terms.join(", ")
                ));
            }
        }

        system_instructions.push_str(" Output ONLY the final transformed text without conversational preamble or quotes.");

        match format {
            ModelPromptFormat::ChatML => {
                format!(
                    "<|im_start|>system\n{system_instructions}<|im_end|>\n<|im_start|>user\n{dictation}<|im_end|>\n<|im_start|>assistant\n"
                )
            }
            ModelPromptFormat::Phi3 => {
                format!(
                    "<|system|>\n{system_instructions}<|end|>\n<|user|>\n{dictation}<|end|>\n<|assistant|>\n"
                )
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_wake_word_at_start_with_formal_intent() {
        let raw = "Hey HushWrite, make that formal: We gotta ship this update by Friday or we're in trouble";
        let parsed = VoiceTransformParser::parse(raw, None);
        assert_eq!(parsed.intent, Some(VoiceTransformIntent::Formal));
        assert_eq!(parsed.base_text, "We gotta ship this update by Friday or we're in trouble");
    }

    #[test]
    fn parses_whisper_comma_and_space_variations() {
        // Whisper often inserts "Hey, HushWrite," or "Hey, Hush Write,"
        let raw1 = "Hey, HushWrite, make that formal. We gotta ship this update by Friday";
        let parsed1 = VoiceTransformParser::parse(raw1, Some("Hey HushWrite"));
        assert_eq!(parsed1.intent, Some(VoiceTransformIntent::Formal));
        assert_eq!(parsed1.base_text, "We gotta ship this update by Friday");

        let raw2 = "Hey, Hush Write: make that concise, this is way too long for Slack";
        let parsed2 = VoiceTransformParser::parse(raw2, Some("Hey HushWrite"));
        assert_eq!(parsed2.intent, Some(VoiceTransformIntent::Concise));
        assert_eq!(parsed2.base_text, "this is way too long for Slack");
    }

    #[test]
    fn parses_custom_trigger_phrase() {
        let raw = "Hey Murmur, make that casual: We should probably reschedule our sync";
        let parsed = VoiceTransformParser::parse(raw, Some("Hey Murmur"));
        assert_eq!(parsed.intent, Some(VoiceTransformIntent::Casual));
        assert_eq!(parsed.base_text, "We should probably reschedule our sync");

        let raw_comp = "Computer, summarize as bullets: Review PR. Merge to main. Deploy to staging.";
        let parsed_comp = VoiceTransformParser::parse(raw_comp, Some("Computer"));
        assert_eq!(parsed_comp.intent, Some(VoiceTransformIntent::BulletedList));
        assert_eq!(parsed_comp.base_text, "Review PR. Merge to main. Deploy to staging.");
    }

    #[test]
    fn parses_wake_word_at_end_with_bullet_intent() {
        let raw = "First review the pull request then merge to main then trigger deployment hey HushWrite summarize as bullets";
        let parsed = VoiceTransformParser::parse(raw, None);
        assert_eq!(parsed.intent, Some(VoiceTransformIntent::BulletedList));
        assert_eq!(
            parsed.base_text,
            "First review the pull request then merge to main then trigger deployment"
        );
    }

    #[test]
    fn parses_wake_word_at_end_with_whisper_commas() {
        let raw = "We gotta ship this update by Friday. Hey, HushWrite, make that formal.";
        let parsed = VoiceTransformParser::parse(raw, None);
        assert_eq!(parsed.intent, Some(VoiceTransformIntent::Formal));
        assert_eq!(parsed.base_text, "We gotta ship this update by Friday");
    }

    #[test]
    fn parses_email_and_translation_intents() {
        let raw_email = "Hey HushWrite, turn this into an email: Hey Sarah thanks for the update let me know when we can chat";
        let parsed_email = VoiceTransformParser::parse(raw_email, None);
        assert_eq!(parsed_email.intent, Some(VoiceTransformIntent::EmailDraft));
        assert!(parsed_email.base_text.contains("Hey Sarah thanks for the update"));

        let raw_trans = "Hey HushWrite, translate to Spanish: Good morning everyone have a great week";
        let parsed_trans = VoiceTransformParser::parse(raw_trans, None);
        assert_eq!(
            parsed_trans.intent,
            Some(VoiceTransformIntent::Translate {
                target_language: "Spanish".into()
            })
        );
        assert_eq!(parsed_trans.base_text, "Good morning everyone have a great week");
    }

    #[test]
    fn parses_trailing_concise_without_wake() {
        let raw = "I just wanted to drop a quick note to let you know we finished the task make that concise";
        let parsed = VoiceTransformParser::parse(raw, None);
        assert_eq!(parsed.intent, Some(VoiceTransformIntent::Concise));
        assert_eq!(
            parsed.base_text,
            "I just wanted to drop a quick note to let you know we finished the task"
        );
    }

    #[test]
    fn regular_dictation_has_no_intent() {
        let raw = "This is a normal dictated paragraph about Rust performance.";
        let parsed = VoiceTransformParser::parse(raw, None);
        assert_eq!(parsed.intent, None);
        assert_eq!(parsed.base_text, raw);
    }

    #[test]
    fn builds_chatml_and_phi3_prompts() {
        let dictation = "um like we should schedule a meeting";
        let qwen_prompt = VoiceTransformParser::build_prompt(
            ModelPromptFormat::ChatML,
            dictation,
            Some(&VoiceTransformIntent::Formal),
            &[],
            None,
            Some("en"),
        );
        assert!(qwen_prompt.starts_with("<|im_start|>system"));
        assert!(qwen_prompt.contains("<|im_start|>user\num like we should schedule a meeting<|im_end|>"));

        let phi_prompt = VoiceTransformParser::build_prompt(
            ModelPromptFormat::Phi3,
            dictation,
            Some(&VoiceTransformIntent::Formal),
            &[],
            None,
            Some("en"),
        );
        assert!(phi_prompt.starts_with("<|system|>"));
        assert!(phi_prompt.contains("<|user|>\num like we should schedule a meeting<|end|>"));
    }
}
