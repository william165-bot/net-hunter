// Input validation and sanitization utilities
class Validator {
    constructor() {
        this.maxTextLength = 100000;
        this.maxUrlLength = 2048;
        this.allowedSchemes = ['http:', 'https:'];
    }

    // Sanitize any input to prevent XSS
    sanitize(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .substring(0, this.maxTextLength);
    }

    // Validate email format
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }

        const sanitized = this.sanitize(email.trim());
        
        if (sanitized.length === 0) {
            return { valid: false, error: 'Email cannot be empty' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
            return { valid: false, error: 'Invalid email format' };
        }

        // Check for Gmail
        if (!/@gmail\.com$/i.test(sanitized)) {
            return { valid: false, error: 'Only Gmail addresses are allowed' };
        }

        return { valid: true, sanitized };
    }

    // Validate password
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required' };
        }

        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }

        if (password.length > 128) {
            return { valid: false, error: 'Password is too long' };
        }

        return { valid: true, password };
    }

    // Validate URL
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }

        const sanitized = this.sanitize(url.trim());
        
        if (sanitized.length === 0) {
            return { valid: false, error: 'URL cannot be empty' };
        }

        if (sanitized.length > this.maxUrlLength) {
            return { valid: false, error: 'URL is too long' };
        }

        try {
            const urlObj = new URL(sanitized);
            if (!this.allowedSchemes.includes(urlObj.protocol)) {
                return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
            }
            return { valid: true, sanitized };
        } catch (error) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }

    // Validate text input
    validateText(text) {
        if (!text || typeof text !== 'string') {
            return { valid: false, error: 'Text is required' };
        }

        const sanitized = this.sanitize(text.trim());
        
        if (sanitized.length === 0) {
            return { valid: false, error: 'Text cannot be empty' };
        }

        if (sanitized.length > this.maxTextLength) {
            return { valid: false, error: 'Text is too long' };
        }

        return { valid: true, sanitized };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
}