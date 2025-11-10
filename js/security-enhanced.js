// Enhanced Security Manager with additional protections
class EnhancedSecurityManager extends SecurityManager {
    constructor() {
        super();
        this.failedAttempts = new Map();
        this.blockedIPs = new Map();
    }

    // Enhanced error handling
    secureError(error) {
        // Don't expose sensitive information in production
        const safeErrors = [
            "User not found",
            "Invalid password", 
            "Account has been suspended",
            "Too many attempts. Please try again later.",
            "Invalid email format",
            "Only Gmail addresses are allowed",
            "Password must be at least 6 characters",
            "Passwords do not match",
            "User already exists",
            "Password is too common. Please choose a stronger password."
        ];
        
        if (safeErrors.includes(error.message)) {
            return error;
        }
        
        return new Error("An error occurred. Please try again.");
    }

    // Track failed attempts for brute force protection
    trackFailedAttempt(identifier) {
        const attempts = this.failedAttempts.get(identifier) || 0;
        this.failedAttempts.set(identifier, attempts + 1);
        
        // Block after 5 failed attempts for 30 minutes
        if (attempts + 1 >= 5) {
            this.blockedIPs.set(identifier, Date.now() + (30 * 60 * 1000));
        }
    }

    // Check if identifier is blocked
    isBlocked(identifier) {
        const blockExpiry = this.blockedIPs.get(identifier);
        if (blockExpiry && Date.now() < blockExpiry) {
            return true;
        }
        
        // Clear expired blocks
        if (blockExpiry && Date.now() >= blockExpiry) {
            this.blockedIPs.delete(identifier);
            this.failedAttempts.delete(identifier);
        }
        
        return false;
    }

    // Clear failed attempts on successful authentication
    clearFailedAttempts(identifier) {
        this.failedAttempts.delete(identifier);
        this.blockedIPs.delete(identifier);
    }

    // Enhanced session validation
    validateSession(user) {
        if (!user || !user.sessionId || !user.sessionExpiry) {
            return false;
        }
        
        // Check if session is expired
        if (Date.now() >= user.sessionExpiry) {
            return false;
        }
        
        // Additional validation for session integrity
        if (typeof user.sessionId !== "string" || user.sessionId.length < 10) {
            return false;
        }
        
        return true;
    }

    // Generate secure session ID
    generateSecureSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = this.generateId();
        return `${timestamp}_${randomPart}`;
    }

    // CSRF token generation
    generateCSRFToken() {
        return this.generateId() + Date.now().toString(36);
    }

    // Validate CSRF token
    validateCSRFToken(token) {
        return typeof token === "string" && token.length >= 20;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSecurityManager;
}