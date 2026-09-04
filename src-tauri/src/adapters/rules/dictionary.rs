/*!
 * SOURCE OF TRUTH KEYWORDS: apply_dictionary, replace_whole_words, MatchKind
 * WHAT:  User vocabulary replacement table and regex/word boundary replacement.
 * WHERE: Consumed by adapters/rules/mod.rs and text.rs.
 */

use crate::types::{DictionaryEntry, MatchKind};
use super::spoken::normalize_named_entities;

/**
 * WHAT:  Applies the user's replacement table.
 * WHY:   The single highest-leverage rule in the app — a model that writes
 *        "clod code" instead of "Claude Code" feels broken regardless of its
 *        word error rate. Word matching is the default because substring
 *        matching silently corrupts unrelated words.
 */
pub fn apply_dictionary(text: &str, entries: &[DictionaryEntry]) -> String {
    let mut out = normalize_named_entities(text);
    for entry in entries.iter().filter(|e| e.enabled) {
        out = match entry.match_kind {
            MatchKind::Word => replace_whole_words(&out, &entry.pattern, &entry.replacement, false),
            MatchKind::WordCaseSensitive => {
                replace_whole_words(&out, &entry.pattern, &entry.replacement, true)
            }
            MatchKind::Substring => out.replace(&entry.pattern, &entry.replacement),
        };
    }
    out
}

/**
 * SOURCE OF TRUTH KEYWORDS: replace_whole_words
 * WHAT:  Replaces `needle` with `replacement` only at word boundaries.
 * WHY:   Written by hand rather than with a regex crate: the patterns come from
 *        user input, and compiling user text as a regex is both a correctness
 *        hazard and a way to make an unbounded-time replacement. Boundaries are
 *        "not alphanumeric on either side", which is what stops a replacement
 *        of "ai" from rewriting "said".
 * WHERE: The matching primitive under the dictionary, filler and spoken-command
 *        rules.
 */
pub fn replace_whole_words(
    haystack: &str,
    needle: &str,
    replacement: &str,
    case_sensitive: bool,
) -> String {
    if needle.is_empty() {
        return haystack.to_string();
    }

    let subject = if case_sensitive {
        haystack.to_string()
    } else {
        haystack.to_lowercase()
    };
    let pattern = if case_sensitive {
        needle.to_string()
    } else {
        needle.to_lowercase()
    };

    let mut out = String::with_capacity(haystack.len());
    let mut cursor = 0usize;

    while let Some(found) = subject[cursor..].find(&pattern) {
        let start = cursor + found;
        let end = start + pattern.len();

        let before_ok = start == 0
            || !subject[..start]
                .chars()
                .next_back()
                .map(|c| c.is_alphanumeric())
                .unwrap_or(false);
        let after_ok = end >= subject.len()
            || !subject[end..]
                .chars()
                .next()
                .map(|c| c.is_alphanumeric())
                .unwrap_or(false);

        if before_ok && after_ok {
            out.push_str(&haystack[cursor..start]);
            out.push_str(replacement);
        } else {
            out.push_str(&haystack[cursor..end]);
        }
        cursor = end;
    }

    out.push_str(&haystack[cursor..]);
    out
}
