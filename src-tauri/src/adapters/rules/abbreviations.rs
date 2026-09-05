/*!
 * SOURCE OF TRUTH KEYWORDS: expand_abbreviations, Abbreviation, abbreviations_for_language
 * WHAT:  Language-specific abbreviation expansion (e.g. "eg" -> "e.g.", "ie" -> "i.e.").
 * WHY:   Whisper often transcribes Latin abbreviations like "eg" or "ie" without
 *        periods, leading to clumsy transcripts. Deterministic expansion restores
 *        the proper notation while allowing users to opt out per abbreviation.
 * WHERE: Consumed by adapters/rules/mod.rs and text.rs.
 */

use crate::types::LanguageCode;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Abbreviation {
    pub needle: &'static str,
    pub replacement: &'static str,
    pub description: &'static str,
}

pub const ENGLISH_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "eg",
        replacement: "e.g.",
        description: "for example (exempli gratia)",
    },
    Abbreviation {
        needle: "ie",
        replacement: "i.e.",
        description: "that is (id est)",
    },
    Abbreviation {
        needle: "etc",
        replacement: "etc.",
        description: "and so forth (et cetera)",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus / against",
    },
    Abbreviation {
        needle: "aka",
        replacement: "a.k.a.",
        description: "also known as",
    },
    Abbreviation {
        needle: "et al",
        replacement: "et al.",
        description: "and others (et alii)",
    },
];

pub const SPANISH_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "ej",
        replacement: "p. ej.",
        description: "por ejemplo",
    },
    Abbreviation {
        needle: "etc",
        replacement: "etc.",
        description: "etcétera",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus",
    },
];

pub const FRENCH_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "ex",
        replacement: "p. ex.",
        description: "par exemple",
    },
    Abbreviation {
        needle: "cad",
        replacement: "c.-à-d.",
        description: "c'est-à-dire",
    },
    Abbreviation {
        needle: "etc",
        replacement: "etc.",
        description: "et cætera",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus",
    },
];

pub const GERMAN_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "zb",
        replacement: "z. B.",
        description: "zum Beispiel",
    },
    Abbreviation {
        needle: "dh",
        replacement: "d. h.",
        description: "das heißt",
    },
    Abbreviation {
        needle: "usw",
        replacement: "usw.",
        description: "und so weiter",
    },
    Abbreviation {
        needle: "etc",
        replacement: "etc.",
        description: "et cetera",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus",
    },
];

pub const ITALIAN_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "es",
        replacement: "ad es.",
        description: "ad esempio",
    },
    Abbreviation {
        needle: "ecc",
        replacement: "ecc.",
        description: "eccetera",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus",
    },
];

pub const PORTUGUESE_ABBREVIATIONS: &[Abbreviation] = &[
    Abbreviation {
        needle: "ex",
        replacement: "p. ex.",
        description: "por exemplo",
    },
    Abbreviation {
        needle: "etc",
        replacement: "etc.",
        description: "etcétera",
    },
    Abbreviation {
        needle: "vs",
        replacement: "vs.",
        description: "versus",
    },
];

/// Returns the abbreviation catalog for the specified language, falling back to English.
pub fn abbreviations_for_language(language: Option<&LanguageCode>) -> &'static [Abbreviation] {
    let Some(lang) = language else {
        return ENGLISH_ABBREVIATIONS;
    };
    let code = lang.as_str();
    let prefix = code.split(['-', '_']).next().unwrap_or(code);
    match prefix {
        "en" => ENGLISH_ABBREVIATIONS,
        "es" => SPANISH_ABBREVIATIONS,
        "fr" => FRENCH_ABBREVIATIONS,
        "de" => GERMAN_ABBREVIATIONS,
        "it" => ITALIAN_ABBREVIATIONS,
        "pt" => PORTUGUESE_ABBREVIATIONS,
        _ => ENGLISH_ABBREVIATIONS,
    }
}

/**
 * SOURCE OF TRUTH KEYWORDS: expand_abbreviations
 * WHAT:  Expands recognized abbreviations in `text` based on language and user exclusions.
 * WHY:   Preserves leading casing (e.g. "Eg" -> "E.g."), stops false positive substrings
 *        via word boundary verification, avoids duplicate trailing dots (e.g. "etc." stays "etc."),
 *        and skips any abbreviation the user opted out of.
 */
pub fn expand_abbreviations(
    text: &str,
    language: Option<&LanguageCode>,
    disabled: &[String],
) -> String {
    if text.is_empty() {
        return String::new();
    }

    let abbreviations = abbreviations_for_language(language);
    let mut current = text.to_string();

    for abbr in abbreviations {
        if disabled.iter().any(|d| d.trim().eq_ignore_ascii_case(abbr.needle)) {
            continue;
        }

        current = replace_abbreviation(&current, abbr.needle, abbr.replacement);
    }

    current
}

fn replace_abbreviation(haystack: &str, needle: &str, replacement: &str) -> String {
    let lower_haystack = haystack.to_lowercase();
    let lower_needle = needle.to_lowercase();
    let mut out = String::with_capacity(haystack.len());
    let mut cursor = 0usize;

    while let Some(found) = lower_haystack[cursor..].find(&lower_needle) {
        let start = cursor + found;
        let end = start + lower_needle.len();

        let before_ok = start == 0
            || !haystack[..start]
                .chars()
                .next_back()
                .map(|c| c.is_alphanumeric())
                .unwrap_or(false);

        let after_ok = end >= haystack.len()
            || !haystack[end..]
                .chars()
                .next()
                .map(|c| c.is_alphanumeric())
                .unwrap_or(false);

        if before_ok && after_ok {
            out.push_str(&haystack[cursor..start]);

            // Determine casing from the original match
            let matched_text = &haystack[start..end];
            let first_char = matched_text.chars().next().unwrap_or(' ');
            let is_upper = first_char.is_uppercase();

            // Check if text after match already starts with a dot
            let already_has_dot = haystack[end..].starts_with('.');
            let mut effective_replacement = replacement.to_string();

            if is_upper {
                let mut chars = effective_replacement.chars();
                if let Some(first) = chars.next() {
                    effective_replacement = first.to_uppercase().collect::<String>() + chars.as_str();
                }
            }

            if already_has_dot && effective_replacement.ends_with('.') {
                effective_replacement.pop();
            }

            out.push_str(&effective_replacement);
        } else {
            out.push_str(&haystack[cursor..end]);
        }
        cursor = end;
    }

    out.push_str(&haystack[cursor..]);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expands_standard_english_abbreviations() {
        let lang = LanguageCode("en".into());
        assert_eq!(
            expand_abbreviations("We like fruit, eg apples, and vegetables, ie carrots.", Some(&lang), &[]),
            "We like fruit, e.g. apples, and vegetables, i.e. carrots."
        );
        assert_eq!(
            expand_abbreviations("Bring pens, paper, etc to the meeting.", Some(&lang), &[]),
            "Bring pens, paper, etc. to the meeting."
        );
        assert_eq!(
            expand_abbreviations("Red vs blue in the match.", Some(&lang), &[]),
            "Red vs. blue in the match."
        );
        assert_eq!(
            expand_abbreviations("He is aka the chief.", Some(&lang), &[]),
            "He is a.k.a. the chief."
        );
    }

    #[test]
    fn preserves_start_of_sentence_capitalisation() {
        let lang = LanguageCode("en".into());
        assert_eq!(
            expand_abbreviations("Eg apples are great.", Some(&lang), &[]),
            "E.g. apples are great."
        );
        assert_eq!(
            expand_abbreviations("Ie that is the truth.", Some(&lang), &[]),
            "I.e. that is the truth."
        );
    }

    #[test]
    fn avoids_duplicate_trailing_dots() {
        let lang = LanguageCode("en".into());
        assert_eq!(
            expand_abbreviations("Apples, oranges, etc. are healthy.", Some(&lang), &[]),
            "Apples, oranges, etc. are healthy."
        );
        assert_eq!(
            expand_abbreviations("Take eg. this one.", Some(&lang), &[]),
            "Take e.g. this one."
        );
    }

    #[test]
    fn respects_word_boundaries() {
        let lang = LanguageCode("en".into());
        assert_eq!(
            expand_abbreviations("I ate an egg and begged for categories.", Some(&lang), &[]),
            "I ate an egg and begged for categories."
        );
        assert_eq!(
            expand_abbreviations("Piece of pie.", Some(&lang), &[]),
            "Piece of pie."
        );
    }

    #[test]
    fn respects_user_opt_out() {
        let lang = LanguageCode("en".into());
        let disabled = vec!["eg".to_string(), "vs".to_string()];
        assert_eq!(
            expand_abbreviations("We like eg apples vs oranges, ie fruits.", Some(&lang), &disabled),
            "We like eg apples vs oranges, i.e. fruits."
        );
    }

    #[test]
    fn handles_other_languages() {
        let de = LanguageCode("de".into());
        assert_eq!(
            expand_abbreviations("Wir essen zb Äpfel usw mit Genuss.", Some(&de), &[]),
            "Wir essen z. B. Äpfel usw. mit Genuss."
        );

        let es = LanguageCode("es".into());
        assert_eq!(
            expand_abbreviations("Comemos ej manzanas etc frescos.", Some(&es), &[]),
            "Comemos p. ej. manzanas etc. frescos."
        );

        let fr = LanguageCode("fr".into());
        assert_eq!(
            expand_abbreviations("C'est cad la fin, ex hier.", Some(&fr), &[]),
            "C'est c.-à-d. la fin, p. ex. hier."
        );
    }
}
