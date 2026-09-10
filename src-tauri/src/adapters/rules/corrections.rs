/*!
 * SOURCE OF TRUTH KEYWORDS: apply_spoken_corrections, CORRECTION_CUES,
 *   RESTART_PHRASES, MAX_ALIGN_WORDS
 * WHAT:  Spoken self-corrections resolution and alignment.
 * WHERE: Consumed by adapters/rules/mod.rs and text.rs.
 */

use crate::types::LanguageCode;

pub const BACKTRACK_PHRASES: &[&str] = &[
    "scratch that",
    "delete that",
    "cancel that",
    "never mind",
    "forget it",
    "no wait",
    "undo",
];

const CORRECTION_CUES: &[&str] = &[
    "sorry", "no", "wait", "oh", "oops", "actually", "i mean", "i meant", "make that",
    "scratch that", "my bad",
];

const RESTART_PHRASES: &[&str] = &[
    "let's start again",
    "lets start again",
    "let me start again",
    "let's start over",
    "let me start over",
    "start again",
    "start over",
];

const MAX_ALIGN_WORDS: usize = 4;
const MAX_CORRECTION_PASSES: usize = 4;

#[derive(Debug, Clone, Copy)]
struct Word<'a> {
    text: &'a str,
    start: usize,
}

fn words_with_offsets(text: &str) -> Vec<Word<'_>> {
    let mut out = Vec::new();
    let mut start = None;
    for (i, ch) in text.char_indices() {
        if ch.is_whitespace() {
            if let Some(s) = start.take() {
                out.push(Word { text: &text[s..i], start: s });
            }
        } else if start.is_none() {
            start = Some(i);
        }
    }
    if let Some(s) = start {
        out.push(Word { text: &text[s..], start: s });
    }
    out
}

fn bare(word: &str) -> String {
    word.chars()
        .filter(|c| c.is_alphanumeric() || *c == '\'')
        .collect::<String>()
        .to_lowercase()
}

fn ends_clause(word: &str) -> bool {
    word.ends_with(',')
        || word.ends_with('.')
        || word.ends_with(';')
        || word.ends_with(':')
        || word.ends_with('?')
        || word.ends_with('!')
        || word.ends_with('\u{2014}')
}

fn ends_sentence(word: &str) -> bool {
    word.ends_with('.') || word.ends_with('?') || word.ends_with('!')
}

pub fn apply_spoken_corrections(text: &str, language: Option<&LanguageCode>) -> String {
    let is_en = language.map(|l| l.as_str().starts_with("en")).unwrap_or(false);
    if !is_en {
        return text.to_string();
    }

    let mut current = text.to_string();
    for _ in 0..MAX_CORRECTION_PASSES {
        let next = apply_backtracking_corrections(&current)
            .or_else(|| apply_restart(&current))
            .or_else(|| apply_cued_alignment(&current))
            .unwrap_or_else(|| current.clone());
        if next == current {
            break;
        }
        current = next;
    }
    current
}

pub fn apply_backtracking_corrections(text: &str) -> Option<String> {
    let words = words_with_offsets(text);
    if words.is_empty() {
        return None;
    }
    let bares: Vec<String> = words.iter().map(|w| bare(w.text)).collect();

    for phrase in BACKTRACK_PHRASES {
        let parts: Vec<&str> = phrase.split(' ').collect();
        if parts.len() > bares.len() {
            continue;
        }

        // Look for the cue in reverse so we handle the latest backtrack first
        for start in (0..=(bares.len() - parts.len())).rev() {
            let matches = bares[start..start + parts.len()]
                .iter()
                .zip(parts.iter())
                .all(|(w, p)| w == p);

            if !matches {
                continue;
            }

            let cue_end_word_idx = start + parts.len() - 1;
            let is_at_end = start + parts.len() == words.len();
            let cue_ends_clause = ends_clause(words[cue_end_word_idx].text);
            let prev_ends_clause = start > 0 && ends_clause(words[start - 1].text);

            // Backtrack cues must be delimited by punctuation, clause end, or document edges
            let is_valid_cue = if parts.len() == 1 && parts[0] == "undo" {
                // "undo" must strictly be standalone
                (prev_ends_clause && cue_ends_clause) || (start == 0 && cue_ends_clause) || (prev_ends_clause && is_at_end)
            } else {
                cue_ends_clause || prev_ends_clause || is_at_end || start == 0
            };

            if !is_valid_cue {
                continue;
            }

            // Find segment boundary before `start`
            let cut_start_offset = if start == 0 {
                0
            } else {
                let preceding_word = words[start - 1].text;
                if ends_sentence(preceding_word) {
                    let mut sentence_start = 0;
                    for i in (0..start - 1).rev() {
                        if ends_sentence(words[i].text) {
                            sentence_start = words[i + 1].start;
                            break;
                        }
                    }
                    sentence_start
                } else if ends_clause(preceding_word) {
                    let mut clause_start = 0;
                    for i in (0..start - 1).rev() {
                        if ends_clause(words[i].text) {
                            clause_start = words[i + 1].start;
                            break;
                        }
                    }
                    clause_start
                } else {
                    let mut boundary = 0;
                    for i in (0..start).rev() {
                        if ends_clause(words[i].text) {
                            boundary = words[i + 1].start;
                            break;
                        }
                    }
                    boundary
                }
            };

            let remaining_after = if start + parts.len() < words.len() {
                text[words[start + parts.len()].start..].trim_start()
            } else {
                ""
            };

            let prefix = text[..cut_start_offset].trim_end();

            let result = if prefix.is_empty() {
                remaining_after.to_string()
            } else if remaining_after.is_empty() {
                prefix.to_string()
            } else {
                format!("{} {}", prefix, remaining_after)
            };

            return Some(result);
        }
    }

    None
}

fn apply_restart(text: &str) -> Option<String> {
    let words = words_with_offsets(text);
    let bares: Vec<String> = words.iter().map(|w| bare(w.text)).collect();

    let mut best: Option<usize> = None;
    for phrase in RESTART_PHRASES {
        let parts: Vec<&str> = phrase.split(' ').collect();
        if parts.len() > bares.len() {
            continue;
        }
        for start in 0..=(bares.len() - parts.len()) {
            if bares[start..start + parts.len()]
                .iter()
                .zip(parts.iter())
                .all(|(w, p)| w == p)
            {
                let after = start + parts.len();
                if after < words.len() && ends_clause(words[after - 1].text) {
                    best = Some(match best {
                        Some(previous) if previous > after => previous,
                        _ => after,
                    });
                }
            }
        }
    }

    let after = best?;
    Some(text[words[after].start..].trim().to_string())
}

fn apply_cued_alignment(text: &str) -> Option<String> {
    let words = words_with_offsets(text);
    let bares: Vec<String> = words.iter().map(|w| bare(w.text)).collect();

    let mut cue_starts: Vec<(usize, usize)> = Vec::new();
    let mut index = 0;
    while index < words.len() {
        if let Some(len) = cue_run_len(&bares, &words, index) {
            cue_starts.push((index, len));
            index += len;
        } else {
            index += 1;
        }
    }

    for (cue_at, cue_len) in cue_starts.into_iter().rev() {
        let after = cue_at + cue_len;
        if cue_at == 0 || after >= words.len() {
            continue;
        }

        for span in (1..=MAX_ALIGN_WORDS.min(cue_at).min(words.len() - after)).rev() {
            let before = &bares[cue_at - span..cue_at];
            let candidate = &bares[after..after + span];

            if before.first() != candidate.first() {
                continue;
            }

            let mut out = String::with_capacity(text.len());
            out.push_str(&text[..words[cue_at - span].start]);
            out.push_str(text[words[after].start..].trim_end());
            return Some(out);
        }
    }
    None
}

fn cue_run_len(bares: &[String], words: &[Word<'_>], index: usize) -> Option<usize> {
    if index == 0 || !ends_clause(words[index - 1].text) {
        return None;
    }

    let mut len = 0;
    while index + len < words.len() {
        let remaining = &bares[index + len..];
        let matched = CORRECTION_CUES
            .iter()
            .filter_map(|cue| {
                let parts: Vec<&str> = cue.split(' ').collect();
                (remaining.len() >= parts.len()
                    && remaining[..parts.len()]
                        .iter()
                        .zip(parts.iter())
                        .all(|(w, p)| w == p))
                .then_some(parts.len())
            })
            .max();

        len += matched?;
        if ends_clause(words[index + len - 1].text) {
            return Some(len);
        }
    }
    None
}
