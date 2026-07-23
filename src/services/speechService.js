/**
 * Web Speech API Text-to-Speech (TTS) Service
 * Converts recognized text and sentences into audible speech with voice controls.
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.isSpeaking = false;
    this.onStateChange = null;

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0 && !this.selectedVoice) {
      // Default to an English voice if available
      this.selectedVoice = this.voices.find(v => v.lang.includes('en')) || this.voices[0];
    }
  }

  getVoices() {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  setVoice(voiceURI) {
    const voice = this.voices.find(v => v.voiceURI === voiceURI || v.name === voiceURI);
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  setRate(rate) {
    this.rate = parseFloat(rate);
  }

  setPitch(pitch) {
    this.pitch = parseFloat(pitch);
  }

  setVolume(volume) {
    this.volume = parseFloat(volume);
  }

  speak(text, onEndCallback = null) {
    if (!this.synth || !text || text.trim().length === 0) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (err) => {
      console.warn("Speech Synthesis Notice:", err);
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
    }
  }
}

export const speechService = new SpeechService();
