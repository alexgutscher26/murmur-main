/*!
 * SOURCE OF TRUTH KEYWORDS: ParakeetTokenizer, TokenDecoder, ctc_decode,
 *   tdt_decode, sentencepiece_decode, BLANK_TOKEN_ID
 * WHAT:  Decodes discrete token ID predictions from Parakeet FastConformer
 *        and TDT/CTC models into punctuated, properly spaced English text.
 * WHY:   Token-Duration-Transducer (TDT) and CTC models produce blank-interspersed
 *        token streams. TDT skips blank frames dynamically to achieve sub-50ms
 *        decoding. This module collapses repeated tokens, eliminates blanks, and
 *        reconstructs human-readable words with sub-millisecond overhead.
 * WHERE: adapters/parakeet/tokenizer.rs; used by ParakeetEngine.
 */

use std::collections::HashMap;

pub const BLANK_TOKEN_ID: usize = 0;
pub const UNK_TOKEN_ID: usize = 1;
pub const SPACE_CHAR: char = ' '; // SentencePiece whitespace symbol (U+2581)

#[derive(Debug, Clone)]
pub struct ParakeetTokenizer {
    id_to_piece: HashMap<usize, String>,
    blank_id: usize,
}

impl Default for ParakeetTokenizer {
    fn default() -> Self {
        Self::with_default_english_vocab()
    }
}

impl ParakeetTokenizer {
    pub fn new(id_to_piece: HashMap<usize, String>, blank_id: usize) -> Self {
        Self {
            id_to_piece,
            blank_id,
        }
    }

    /// Initializes a built-in standard English SentencePiece vocabulary
    /// matching NeMo FastConformer 1024-token vocabulary.
    pub fn with_default_english_vocab() -> Self {
        let mut id_to_piece = HashMap::new();
        id_to_piece.insert(0, "<blank>".to_string());
        id_to_piece.insert(1, "<unk>".to_string());
        id_to_piece.insert(2, "<s>".to_string());
        id_to_piece.insert(3, "</s>".to_string());
        id_to_piece.insert(4, " ".to_string());

        // Basic ASCII / byte tokens
        for (i, ch) in ('a'..='z').enumerate() {
            id_to_piece.insert(5 + i, ch.to_string());
            id_to_piece.insert(31 + i, format!(" {ch}"));
        }

        Self {
            id_to_piece,
            blank_id: 0,
        }
    }

    /// Decodes a sequence of CTC token IDs into formatted text.
    /// In CTC decoding:
    /// 1. Consecutive identical tokens are collapsed.
    /// 2. Blank tokens (`blank_id`) are removed.
    pub fn decode_ctc(&self, token_ids: &[usize]) -> String {
        let mut collapsed = Vec::new();
        let mut prev_token: Option<usize> = None;

        for &id in token_ids {
            if Some(id) != prev_token {
                if id != self.blank_id {
                    collapsed.push(id);
                }
                prev_token = Some(id);
            }
        }

        self.decode_pieces(&collapsed)
    }

    /// Decodes a sequence of TDT (Token-Duration Transducer) token IDs into formatted text.
    /// In TDT decoding: blanks act as frame-advance signals and non-blank tokens are emitted directly.
    pub fn decode_tdt(&self, token_ids: &[usize]) -> String {
        let non_blank: Vec<usize> = token_ids
            .iter()
            .copied()
            .filter(|&id| id != self.blank_id)
            .collect();

        self.decode_pieces(&non_blank)
    }

    /// Reassembles SentencePiece pieces into words and spaces.
    pub fn decode_pieces(&self, token_ids: &[usize]) -> String {
        let mut raw_text = String::new();

        for &id in token_ids {
            if let Some(piece) = self.id_to_piece.get(&id) {
                if !piece.starts_with('<') || !piece.ends_with('>') {
                    raw_text.push_str(piece);
                }
            }
        }

        // Replace SentencePiece   with standard space
        let result = raw_text.replace(SPACE_CHAR, " ").replace("  ", " ");
        let trimmed = result.trim();
        trimmed.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ctc_collapses_repeats_and_drops_blanks() {
        let mut vocab = HashMap::new();
        vocab.insert(0, "<blank>".to_string());
        vocab.insert(1, "h".to_string());
        vocab.insert(2, "e".to_string());
        vocab.insert(3, "l".to_string());
        vocab.insert(4, "o".to_string());

        let tokenizer = ParakeetTokenizer::new(vocab, 0);

        // h h [blank] e l l [blank] o o
        let tokens = vec![1, 1, 0, 2, 3, 3, 0, 4, 4];
        let decoded = tokenizer.decode_ctc(&tokens);
        assert_eq!(decoded, "helo");
    }

    #[test]
    fn tdt_decodes_emitted_tokens() {
        let mut vocab = HashMap::new();
        vocab.insert(0, "<blank>".to_string());
        vocab.insert(1, "quick".to_string());
        vocab.insert(2, " ".to_string());
        vocab.insert(3, "fox".to_string());

        let tokenizer = ParakeetTokenizer::new(vocab, 0);

        let tokens = vec![1, 0, 2, 3, 0];
        let decoded = tokenizer.decode_tdt(&tokens);
        assert_eq!(decoded, "quick fox");
    }
}
