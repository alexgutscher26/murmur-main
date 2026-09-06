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
            '.' => {
                let mut dots = 1;
                while chars.peek() == Some(&'.') {
                    chars.next();
                    dots += 1;
                }
                if dots == 1 || dots == 2 {
                    // Accidental double-period (e.g. ASR + LLM post-processor collision): collapse to single '.'
                    out.push('.');
                } else {
                    // 3 or more dots: preserve ellipsis "..."
                    out.push_str("...");
                }
            }
            c if matches!(c, ',' | '!' | '?') => {
                out.push(c);
                while chars.peek() == Some(&c) {
                    chars.next();
                }
            }
            c => out.push(c),
        }
    }

    out
}

/**
 * WHAT: Strips trailing punctuation (periods, exclamation marks, question marks, commas, colons, semicolons, ellipsis)
 *       from transcript/ASR output before feeding to an LLM post-processor.
 * WHY:  When both ASR and LLM post-processor append terminal punctuation, doubled punctuation ("word..")
 *       is produced. Stripping trailing punctuation from the ASR prompt input avoids this collision.
 */
pub fn strip_trailing_punctuation(text: &str) -> &str {
    let trimmed = text.trim_end();
    trimmed.trim_end_matches(['.', ',', '!', '?', ';', ':', '…', '‽'])
}

/**
 * WHAT:  Capitalises the first letter of the text and of each new sentence.
 */
pub fn capitalise_sentences(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut capitalise_next = true;
    let chars: Vec<char> = text.chars().collect();

    for i in 0..chars.len() {
        let ch = chars[i];
        if capitalise_next && ch.is_alphabetic() {
            out.extend(ch.to_uppercase());
            capitalise_next = false;
        } else {
            out.push(ch);
            if ch == '.' {
                let next_is_alphanumeric = i + 1 < chars.len() && chars[i + 1].is_alphanumeric();
                if !next_is_alphanumeric {
                    capitalise_next = true;
                }
            } else if matches!(ch, '!' | '?' | '\n') {
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
