/*!
 * SOURCE OF TRUTH KEYWORDS: normalise_punctuation, capitalise_sentences, ensure_terminal_punctuation
 * WHAT:  Punctuation normalisation, sentence initial capitalisation, and terminal stops.
 * WHERE: Consumed by adapters/rules/mod.rs and text.rs.
 */

/**
 * WHAT:  Tidies spacing around punctuation and normalises quote characters.
 */
pub fn normalise_punctuation(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut chars = text.chars().peekable();

    while let Some(ch) = chars.next() {
        match ch {
            '\u{2018}' | '\u{2019}' => out.push('\''),
            '\u{201C}' | '\u{201D}' => out.push('"'),
            '\u{2013}' | '\u{2014}' => out.push('-'),
            ' ' => {
                if matches!(chars.peek(), Some(&next) if matches!(next, ',' | '.' | '!' | '?' | ';' | ':')) {
                    continue;
                }
                out.push(' ');
            }
            c if matches!(c, '.' | ',' | '!' | '?') => {
                out.push(c);
                if c != '.' {
                    while chars.peek() == Some(&c) {
                        chars.next();
                    }
                }
            }
            c => out.push(c),
        }
    }

    out
}

/**
 * WHAT:  Capitalises the first letter of the text and of each new sentence.
 */
pub fn capitalise_sentences(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut capitalise_next = true;

    for ch in text.chars() {
        if capitalise_next && ch.is_alphabetic() {
            out.extend(ch.to_uppercase());
            capitalise_next = false;
        } else {
            out.push(ch);
            if matches!(ch, '.' | '!' | '?' | '\n') {
                capitalise_next = true;
            }
        }
    }

    out
}

/**
 * WHAT:  Adds a full stop if the text does not already end in punctuation.
 */
pub fn ensure_terminal_punctuation(text: &str) -> String {
    let trimmed = text.trim_end();
    if trimmed.is_empty() {
        return text.to_string();
    }

    let ends_cleanly = trimmed
        .chars()
        .last()
        .map(|c| matches!(c, '.' | '!' | '?' | ':' | ';' | ',' | '"' | ')'))
        .unwrap_or(false);

    if ends_cleanly || text.ends_with('\n') {
        text.to_string()
    } else {
        format!("{trimmed}.")
    }
}
