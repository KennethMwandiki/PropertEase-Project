/**
 * PropertEase Accessibility Manager
 * Handles user preferences for high contrast, reduced motion, font size, and cognitive aids.
 */

const A11Y_STORAGE_KEY = 'propertease_a11y_prefs';

const defaultPrefs = {
    highContrast: false,
    reducedMotion: false,
    dyslexiaFriendly: false,
    fontSize: 'normal', // small, normal, large, extra-large
    cognitiveEase: false,
    screenReaderOptimized: false
};

class AccessibilityManager {
    constructor() {
        this.prefs = this.loadPrefs();
        this.init();
    }

    loadPrefs() {
        const stored = localStorage.getItem(A11Y_STORAGE_KEY);
        try {
            return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
        } catch (e) {
            return defaultPrefs;
        }
    }

    savePrefs() {
        localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(this.prefs));
        this.applyPrefs();
    }

    init() {
        this.applyPrefs();
        this.setupEventListeners();
    }

    applyPrefs() {
        const root = document.documentElement;
        const body = document.body;

        // High Contrast
        if (this.prefs.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }

        // Reduced Motion
        if (this.prefs.reducedMotion) {
            body.classList.add('reduce-motion');
        } else {
            body.classList.remove('reduce-motion');
        }

        // Dyslexia Friendly Font
        if (this.prefs.dyslexiaFriendly) {
            body.classList.add('dyslexia-friendly');
        } else {
            body.classList.remove('dyslexia-friendly');
        }

        // Font Size
        root.style.setProperty('--base-font-size', this.getFontSizeValue(this.prefs.fontSize));

        // Cognitive Ease (Simplifies UI)
        if (this.prefs.cognitiveEase) {
            body.classList.add('cognitive-ease');
        } else {
            body.classList.remove('cognitive-ease');
        }

        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('a11y-prefs-changed', { detail: this.prefs }));
    }

    getFontSizeValue(size) {
        switch (size) {
            case 'small': return '14px';
            case 'large': return '18px';
            case 'extra-large': return '20px';
            default: return '16px';
        }
    }

    setupEventListeners() {
        // Listen for system changes if preferred
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
            if (!localStorage.getItem(A11Y_STORAGE_KEY)) {
                this.prefs.reducedMotion = e.matches;
                this.applyPrefs();
            }
        });
    }

    updatePref(key, value) {
        if (key in this.prefs) {
            this.prefs[key] = value;
            this.savePrefs();
        }
    }

    togglePref(key) {
        if (typeof this.prefs[key] === 'boolean') {
            this.prefs[key] = !this.prefs[key];
            this.savePrefs();
        }
    }
}

// Initialize and expose to window
window.a11yManager = new AccessibilityManager();
