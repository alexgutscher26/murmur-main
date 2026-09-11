/*!
 * SOURCE OF TRUTH KEYWORDS: AudioPreprocessor, LogMelSpectrogram, FastConformer,
 *   mel_filters, stft, compute_features, TARGET_SAMPLE_RATE
 * WHAT:  Acoustic feature extractor computing 80-channel or 128-channel log-mel
 *        spectrograms from raw 16kHz audio samples for NVIDIA Parakeet models.
 * WHY:   FastConformer models expect normalized log-mel filterbank energies
 *        computed with 25ms (400 samples at 16kHz) windows and 10ms (160 samples)
 *        hops with per-feature normalization. Pure Rust implementation with zero
 *        external runtime C library dependencies for speed and stability.
 * WHERE: adapters/parakeet/preprocessor.rs; used by ParakeetEngine.
 */

use std::f32::consts::PI;

pub const PARAKEET_SAMPLE_RATE: usize = 16_000;
pub const DEFAULT_N_FFT: usize = 512;
pub const DEFAULT_WIN_LENGTH: usize = 400; // 25ms at 16kHz
pub const DEFAULT_HOP_LENGTH: usize = 160; // 10ms at 16kHz
pub const DEFAULT_N_MELS: usize = 80;

#[derive(Debug, Clone)]
pub struct PreprocessorConfig {
    pub sample_rate: usize,
    pub n_fft: usize,
    pub win_length: usize,
    pub hop_length: usize,
    pub n_mels: usize,
    pub dither: f32,
    pub preemph: f32,
}

impl Default for PreprocessorConfig {
    fn default() -> Self {
        Self {
            sample_rate: PARAKEET_SAMPLE_RATE,
            n_fft: DEFAULT_N_FFT,
            win_length: DEFAULT_WIN_LENGTH,
            hop_length: DEFAULT_HOP_LENGTH,
            n_mels: DEFAULT_N_MELS,
            dither: 1e-5,
            preemph: 0.97,
        }
    }
}

pub struct AudioPreprocessor {
    config: PreprocessorConfig,
    window: Vec<f32>,
    mel_filters: Vec<f32>, // Flat array of shape [n_mels, n_fft / 2 + 1]
}

impl AudioPreprocessor {
    pub fn new(config: PreprocessorConfig) -> Self {
        let window = Self::create_hann_window(config.win_length);
        let mel_filters = Self::create_mel_filterbank(
            config.n_mels,
            config.n_fft,
            config.sample_rate as f32,
            0.0,
            (config.sample_rate / 2) as f32,
        );
        Self {
            config,
            window,
            mel_filters,
        }
    }

    /// Creates a periodic Hann window.
    fn create_hann_window(size: usize) -> Vec<f32> {
        (0..size)
            .map(|i| 0.5 * (1.0 - (2.0 * PI * i as f32 / size as f32).cos()))
            .collect()
    }

    /// Converts frequency in Hz to Mel scale.
    fn hz_to_mel(hz: f32) -> f32 {
        2595.0 * (1.0 + hz / 700.0).log10()
    }

    /// Converts Mel scale value back to Hz.
    fn mel_to_hz(mel: f32) -> f32 {
        700.0 * (10.0f32.powf(mel / 2595.0) - 1.0)
    }

    /// Constructs the triangular mel filterbank matrix.
    fn create_mel_filterbank(
        n_mels: usize,
        n_fft: usize,
        sample_rate: f32,
        f_min: f32,
        f_max: f32,
    ) -> Vec<f32> {
        let n_freqs = n_fft / 2 + 1;
        let mut filters = vec![0.0f32; n_mels * n_freqs];

        let min_mel = Self::hz_to_mel(f_min);
        let max_mel = Self::hz_to_mel(f_max);

        let mel_points: Vec<f32> = (0..=n_mels + 1)
            .map(|i| min_mel + (max_mel - min_mel) * (i as f32 / (n_mels + 1) as f32))
            .map(Self::mel_to_hz)
            .collect();

        let fft_freqs: Vec<f32> = (0..n_freqs)
            .map(|i| i as f32 * sample_rate / n_fft as f32)
            .collect();

        for m in 0..n_mels {
            let f_left = mel_points[m];
            let f_center = mel_points[m + 1];
            let f_right = mel_points[m + 2];

            for (i, &f) in fft_freqs.iter().enumerate() {
                if f > f_left && f < f_center {
                    filters[m * n_freqs + i] = (f - f_left) / (f_center - f_left);
                } else if f >= f_center && f < f_right {
                    filters[m * n_freqs + i] = (f_right - f) / (f_right - f_center);
                }
            }
        }

        filters
    }

    /// Computes log-mel spectrogram features from 16kHz mono audio.
    /// Output shape: `[n_frames, n_mels]`
    pub fn compute_features(&self, samples: &[f32]) -> Vec<Vec<f32>> {
        if samples.len() < self.config.win_length {
            return Vec::new();
        }

        // Apply pre-emphasis
        let mut preemphasized = Vec::with_capacity(samples.len());
        if !samples.is_empty() {
            preemphasized.push(samples[0]);
            for i in 1..samples.len() {
                preemphasized.push(samples[i] - self.config.preemph * samples[i - 1]);
            }
        }

        let n_frames = (preemphasized.len() - self.config.win_length) / self.config.hop_length + 1;
        let n_freqs = self.config.n_fft / 2 + 1;
        let mut features = Vec::with_capacity(n_frames);

        let mut frame_buf = vec![0.0f32; self.config.n_fft];

        for f in 0..n_frames {
            let start = f * self.config.hop_length;
            let end = start + self.config.win_length;

            // Apply Hann window and pad to n_fft
            frame_buf.fill(0.0);
            for (i, (&sample, &win)) in preemphasized[start..end]
                .iter()
                .zip(&self.window)
                .enumerate()
            {
                frame_buf[i] = sample * win;
            }

            // Power spectrum via DFT
            let mut power_spectrum = vec![0.0f32; n_freqs];
            for k in 0..n_freqs {
                let mut real = 0.0f32;
                let mut imag = 0.0f32;
                for (n, &val) in frame_buf.iter().enumerate() {
                    let angle = 2.0 * PI * (k * n) as f32 / self.config.n_fft as f32;
                    real += val * angle.cos();
                    imag -= val * angle.sin();
                }
                power_spectrum[k] = real * real + imag * imag;
            }

            // Mel filterbank dot product and log compression
            let mut mel_frame = vec![0.0f32; self.config.n_mels];
            for m in 0..self.config.n_mels {
                let filter_offset = m * n_freqs;
                let mut mel_energy = 0.0f32;
                for k in 0..n_freqs {
                    mel_energy += power_spectrum[k] * self.mel_filters[filter_offset + k];
                }
                // Log compression with small epsilon clamp to prevent -inf
                mel_frame[m] = (mel_energy.max(1e-5)).ln();
            }

            features.push(mel_frame);
        }

        // Feature normalization (zero mean, unit variance per mel band)
        Self::normalize_features(&mut features, self.config.n_mels);

        features
    }

    /// Normalizes feature matrix across time frames for each mel channel.
    fn normalize_features(features: &mut [Vec<f32>], n_mels: usize) {
        if features.is_empty() {
            return;
        }
        let n_frames = features.len() as f32;

        for m in 0..n_mels {
            let sum: f32 = features.iter().map(|frame| frame[m]).sum();
            let mean = sum / n_frames;

            let variance: f32 = features
                .iter()
                .map(|frame| {
                    let diff = frame[m] - mean;
                    diff * diff
                })
                .sum::<f32>()
                / n_frames;

            let std_dev = (variance + 1e-5).sqrt();

            for frame in features.iter_mut() {
                frame[m] = (frame[m] - mean) / std_dev;
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preprocessor_computes_expected_frame_count() {
        let config = PreprocessorConfig::default();
        let preprocessor = AudioPreprocessor::new(config);

        // 1 second of 16kHz audio = 16000 samples
        let samples = vec![0.1f32; 16000];
        let features = preprocessor.compute_features(&samples);

        // (16000 - 400) / 160 + 1 = 98 frames
        assert_eq!(features.len(), 98);
        assert_eq!(features[0].len(), 80);
    }

    #[test]
    fn empty_or_tiny_audio_returns_empty_features() {
        let preprocessor = AudioPreprocessor::new(PreprocessorConfig::default());
        let features = preprocessor.compute_features(&[0.1, 0.2]);
        assert!(features.is_empty());
    }
}
