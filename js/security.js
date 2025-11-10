// Security utilities and validation
class SecurityManager {
    constructor() {
        this.allowedDomains = [
            'gmail.com',
            'googlemail.com'
        ];
        this.maxInputLength = 100000; // 100KB max input
        this.maxUrlLength = 2048;
    }

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }

        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim()
            .substring(0, this.maxInputLength);
    }

    // Validate email address
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }

        const sanitized = this.sanitizeInput(email);
        
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
            return { valid: false, error: 'Invalid email format' };
        }

        // Check if it's an allowed domain
        const domain = sanitized.split('@')[1].toLowerCase();
        if (!this.allowedDomains.includes(domain)) {
            return { valid: false, error: 'Only Gmail addresses are allowed' };
        }

        return { valid: true, sanitized };
    }

    // Validate password
    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password is required' };
        }

        const sanitized = this.sanitizeInput(password);
        
        if (sanitized.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }

        if (sanitized.length > 128) {
            return { valid: false, error: 'Password is too long' };
        }

        // Check for common weak passwords
        const weakPasswords = ['password', '123456', 'qwerty', 'abc123'];
        if (weakPasswords.includes(sanitized.toLowerCase())) {
            return { valid: false, error: 'Password is too common. Please choose a stronger password.' };
        }

        return { valid: true, sanitized };
    }

    // Validate URL
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }

        const sanitized = this.sanitizeInput(url);
        
        if (sanitized.length > this.maxUrlLength) {
            return { valid: false, error: 'URL is too long' };
        }

        try {
            const urlObj = new URL(sanitized);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
            }

            // Check for potentially dangerous URLs
            const dangerousPatterns = [
                /javascript:/i,
                /data:/i,
                /vbscript:/i,
                /file:/i,
                /ftp:/i
            ];

            for (const pattern of dangerousPatterns) {
                if (pattern.test(sanitized)) {
                    return { valid: false, error: 'Unsafe URL detected' };
                }
            }

            return { valid: true, sanitized };
        } catch (error) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }

    // Validate text input for URL extraction
    validateTextInput(text) {
        if (!text || typeof text !== 'string') {
            return { valid: false, error: 'Text is required' };
        }

        const sanitized = this.sanitizeInput(text);
        
        if (sanitized.length > this.maxInputLength) {
            return { valid: false, error: 'Text is too long' };
        }

        if (sanitized.trim().length === 0) {
            return { valid: false, error: 'Text cannot be empty' };
        }

        return { valid: true, sanitized };
    }

    // Extract URLs safely
    extractUrls(text) {
        const sanitized = this.sanitizeInput(text);
        
        // More restrictive URL regex
        const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        
        const matches = sanitized.match(urlRegex) || [];
        
        // Filter and validate each URL
        const validUrls = [];
        const seen = new Set();
        
        for (const url of matches) {
            const validation = this.validateUrl(url);
            if (validation.valid && !seen.has(validation.sanitized)) {
                validUrls.push(validation.sanitized);
                seen.add(validation.sanitized);
            }
        }

        return validUrls;
    }

    // Hash password (simple hash for demo - use bcrypt in production)
    hashPassword(password) {
        // This is a simple hash for demonstration
        // In production, use proper password hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(36) + '_' + password.length;
    }

    // Verify password
    verifyPassword(password, hash) {
        const newHash = this.hashPassword(password);
        return newHash === hash;
    }

    // Generate secure random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Rate limiting (simple implementation)
    createRateLimiter(maxRequests = 5, windowMs = 60000) {
        const requests = [];
        
        return {
            isAllowed: (identifier = 'default') => {
                const now = Date.now();
                const windowStart = now - windowMs;
                
                // Remove old requests
                const filtered = requests.filter(req => 
                    req.identifier === identifier && req.timestamp > windowStart
                );
                
                if (filtered.length >= maxRequests) {
                    return false;
                }
                
                requests.push({ identifier, timestamp: now });
                return true;
            },
            
            reset: (identifier = 'default') => {
                const index = requests.findIndex(req => req.identifier === identifier);
                if (index !== -1) {
                    requests.splice(index, 1);
                }
            }
        };
    }

    // Content Security Policy helper
    getCSPHeader() {
        return "default-src 'self'; " +
               "script-src 'self' 'unsafe-inline'; " +
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
               "font-src 'self' https://fonts.gstatic.com; " +
               "img-src 'self' data: https:; " +
               "connect-src 'self'; " +
               "frame-src 'none'; " +
               "object-src 'none'; " +
               "base-uri 'self'; " +
               "form-action 'self'";
    }

    // Set security headers (for server-side implementation)
    setSecurityHeaders(response) {
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.setHeader('Content-Security-Policy', this.getCSPHeader());
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}
// Enhanced security validation
SecurityManager.prototype.validateInput = function(input, type = "text") {
    if (!input || typeof input !== "string") {
        return { valid: false, error: "Invalid input" };
    }

    const sanitized = this.sanitizeInput(input.trim());
    
    if (sanitized.length === 0) {
        return { valid: false, error: "Input cannot be empty" };
    }

    // Type-specific validation
    switch (type) {
        case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sanitized)) {
                return { valid: false, error: "Invalid email format" };
            }
            // Gmail validation
            if (!/@gmail\.com$/i.test(sanitized)) {
                return { valid: false, error: "Only Gmail addresses are allowed" };
            }
            break;
            
        case "password":
            if (sanitized.length < 6) {
                return { valid: false, error: "Password must be at least 6 characters" };
            }
            if (sanitized.length > 128) {
                return { valid: false, error: "Password is too long" };
            }
            // Check for common weak passwords
            const weakPasswords = ["123456", "password", "qwerty", "abc123"];
            if (weakPasswords.includes(sanitized.toLowerCase())) {
                return { valid: false, error: "Password is too common. Please choose a stronger password." };
            }
            break;
            
        case "text":
            if (sanitized.length > 10000) {
                return { valid: false, error: "Text input is too long" };
            }
            break;
            
        case "url":
            try {
                new URL(sanitized);
                if (!sanitized.startsWith("http://") && !sanitized.startsWith("https://")) {
                    return { valid: false, error: "URL must start with http:// or https://" };
                }
            } catch (error) {
                return { valid: false, error: "Invalid URL format" };
            }
            break;
    }

    return { valid: true, sanitized };
};

