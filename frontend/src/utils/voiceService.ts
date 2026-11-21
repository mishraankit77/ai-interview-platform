// Speech Synthesis Service with Indian English Voice Priority

class VoiceService {
  private indianVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();

    // Prioritize genuine Indian English voices
    const indianVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();

      return (
        lang === 'en-in' ||
        lang.includes('en_in') ||
        name.includes('india') ||
        name.includes('neerja') ||
        name.includes('prabhat') ||
        name.includes('rishi') ||
        name.includes('heera') ||
        name.includes('veena') ||
        name.includes('ravi')
      );
    });

    if (indianVoice) {
      this.indianVoice = indianVoice;
    } else {
      // Fallback to any natural English voice
      this.indianVoice = voices.find(v => v.lang.startsWith('en')) || null;
    }
  }

  public getVoiceName(): string {
    return this.indianVoice ? `${this.indianVoice.name} (Indian Accent)` : 'Default Audio Voice';
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.cancel();
    }
  }

  public cancel(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void
  ): void {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.cancel();

    // Clean text of markdown, code blocks, or URLs before speaking
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Refer to code on screen.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[\*_~#]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();

    if (!cleanSpeech) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);

    if (this.indianVoice) {
      utterance.voice = this.indianVoice;
      utterance.lang = this.indianVoice.lang || 'en-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Natural Indian conversational pacing
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis] Utterance error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceService = new VoiceService();
