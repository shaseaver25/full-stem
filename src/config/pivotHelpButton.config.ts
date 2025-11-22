/**
 * Pivot Help Button Configuration
 * Centralized configuration for animations, triggers, and styling
 */

export const pivotHelpButtonConfig = {
  animations: {
    initialPulse: {
      enabled: true,
      duration: 2000, // ms
      iterations: 3,
      delay: 1500 // ms
    },
    iconWave: {
      enabled: true,
      interval: 12000 // ms - how often the icon waves
    },
    glowAfterWrong: {
      enabled: true,
      duration: 1500 // ms
    },
    urgentBounce: {
      enabled: true,
      duration: 600, // ms
      iterations: 3
    },
    slideIn: {
      enabled: true,
      duration: 600 // ms
    }
  },
  triggers: {
    timeBeforeSlideIn: 45, // seconds - how long before showing time-based prompt
    wrongAttemptsForGlow: 1, // number of wrong attempts before gentle glow
    wrongAttemptsForUrgent: 2 // number of wrong attempts before urgent animation
  },
  styles: {
    colors: {
      primary: ['217 91% 60%', '258 90% 66%'], // HSL gradient (blue/purple)
      afterWrong: ['316 73% 52%', '345 82% 61%'], // HSL gradient (pink/coral)
      urgent: ['340 82% 52%', '48 99% 64%'] // HSL gradient (pink/yellow)
    },
    borderRadius: 24,
    padding: {
      desktop: '12px 20px',
      mobile: '14px 20px'
    }
  },
  accessibility: {
    respectReducedMotion: true,
    keyboardShortcut: 'Alt+P',
    announceStateChanges: true
  },
  text: {
    buttonLabel: 'Need help understanding this?',
    ariaLabel: 'Ask Pivot AI tutor for help with this question',
    ariaMessageFirstWrong: 'Pivot AI tutor is available to help you think through this question',
    ariaMessageMultipleWrong: 'Having trouble? Pivot AI tutor can guide you with a step-by-step approach'
  }
};
