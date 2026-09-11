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

impl VoiceTransformParser {
    /// Parses spoken text to detect conversational voice transformation triggers.
    pub fn parse(raw_text: &str, trigger_phrase: Option<&str>) -> ParsedVoiceTransform {
        let trimmed = raw_text.trim();
        if trimmed.is_empty() {
            return ParsedVoiceTransform {
                base_text: String::new(),
                intent: None,
            };
        }

        let default_trigger = "hey hushwrite";
        let trigger = trigger_phrase.unwrap_or(default_trigger).to_lowercase();

        // 1. Check if trigger occurs as a prefix: "Hey HushWrite, make that formal: <text>"
        let lower = trimmed.to_lowercase();
        if lower.starts_with(&trigger) || lower.starts_with("hey hush write") || lower.starts_with("hushwrite,") {
            let without_wake = if lower.starts_with(&trigger) {
                &trimmed[trigger.len()..]
            } else if lower.starts_with("hey hush write") {
                &trimmed["hey hush write".len()..]
            } else if lower.starts_with("hushwrite,") {
                &trimmed["hushwrite,".len()..]
            } else {
                trimmed
            };

            let clean_start = without_wake.trim_start_matches(|c: char| c == ',' || c == ':' || c == ' ' || c == '-');
            if let Some((intent, remainder)) = Self::extract_intent_from_prefix(clean_start) {
                return ParsedVoiceTransform {
                    base_text: remainder.to_string(),
                    intent: Some(intent),
                };
            }
        }

        // 2. Check if trigger occurs at the end of dictation: "<text> hey hushwrite make that formal"
        if let Some(pos) = Self::find_wake_phrase_index(&lower, &trigger) {
            let (before, after) = trimmed.split_at(pos);
            let after_wake = after.to_lowercase();
            let instruction = if after_wake.starts_with(&trigger) {
                &after[trigger.len()..]
            } else if after_wake.starts_with("hey hush write") {
                &after["hey hush write".len()..]
            } else if after_wake.starts_with("hushwrite") {
                &after["hushwrite".len()..]
            } else {
                after
            };

            let clean_instr = instruction.trim_start_matches(|c: char| c == ',' || c == ':' || c == ' ' || c == '-');
            let intent = Self::classify_instruction(clean_instr);
            let clean_base = before.trim().trim_end_matches(|c: char| c == ',' || c == '.' || c == ';');

            return ParsedVoiceTransform {
                base_text: clean_base.to_string(),
                intent: Some(intent),
            };
        }

        // 3. Fallback: Check trailing "make that formal / bullet points / concise" without explicit wake phrase
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

    fn find_wake_phrase_index(lower: &str, trigger: &str) -> Option<usize> {
        for phrase in [trigger, "hey hush write", "hey hushwrite", "hushwrite"] {
            if let Some(pos) = lower.rfind(phrase) {
                // Ensure it is a word boundary
                if pos == 0 || lower.as_bytes()[pos - 1] == b' ' || lower.as_bytes()[pos - 1] == b',' {
                    return Some(pos);
                }
            }
        }
        None
    }

    fn extract_intent_from_prefix(text: &str) -> Option<(VoiceTransformIntent, &str)> {
        // E.g., "make that formal: Hello team" or "bullet points: 1 2 3" or "translate to Spanish: Good morning"
        let lower = text.to_lowercase();
        
        let split_delimiters = [":", " - ", " that ", " this "];
        for delim in split_delimiters {
            if let Some(pos) = lower.find(delim) {
                let cmd = &lower[..pos];
                let remainder = &text[pos + delim.len()..].trim();
                let intent = Self::classify_instruction(cmd);
                if !remainder.is_empty() {
                    return Some((intent, remainder));
                }
            }
        }

        // Single sentence commands with obvious triggers
        for cmd_pattern in [
            "make that formal", "make this formal", "make it formal",
            "make that casual", "make this casual",
            "make that concise", "make this concise", "bullet points",
            "summarize as bullets", "format as email", "turn this into an email"
        ] {
            if lower.starts_with(cmd_pattern) {
                let remainder = text[cmd_pattern.len()..].trim_start_matches(|c: char| c == ':' || c == ',' || c == ' ');
                let intent = Self::classify_instruction(cmd_pattern);
                return Some((intent, remainder));
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
            ("make that casual", VoiceTransformIntent::Casual),
            ("make this casual", VoiceTransformIntent::Casual),
            ("make that concise", VoiceTransformIntent::Concise),
            ("make this concise", VoiceTransformIntent::Concise),
            ("shorten this", VoiceTransformIntent::Concise),
            ("make that a bulleted list", VoiceTransformIntent::BulletedList),
            ("make that a bullet list", VoiceTransformIntent::BulletedList),
            ("make that bullet points", VoiceTransformIntent::BulletedList),
            ("summarize in bullet points", VoiceTransformIntent::BulletedList),
            ("summarize as bullets", VoiceTransformIntent::BulletedList),
            ("turn this into an email", VoiceTransformIntent::EmailDraft),
            ("format as an email", VoiceTransformIntent::EmailDraft),
            ("fix grammar only", VoiceTransformIntent::FixGrammarOnly),
        ];

        for (pattern, intent) in trailing_patterns {
            if let Some(pos) = lower.rfind(pattern) {
                if pos > 0 && (lower.as_bytes()[pos - 1] == b' ' || lower.as_bytes()[pos - 1] == b',') {
                    let base = text[..pos].trim().trim_end_matches(|c: char| c == ',' || c == '.');
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
        } else if lower.contains("email") {
            VoiceTransformIntent::EmailDraft
        } else if lower.contains("grammar") {
            VoiceTransformIntent::FixGrammarOnly
        } else if lower.contains("translate") {
            let target = lower
                .split_whitespace()
                .skip_while(|&w| w != "to" && w != "into")
                .nth(1)
                .unwrap_or("English")
                .to_string();
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
        assert!(parsed.base_text.contains("We gotta ship this update by Friday"));
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
