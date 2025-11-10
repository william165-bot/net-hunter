// Local Storage Management
class StorageManager {
    constructor() {
        this.prefix = 'nethunt_';
        this.maxStorageSize = 4 * 1024 * 1024; // 4MB limit
        this.encryptionKey = this.generateEncryptionKey();
    }

    // Generate simple encryption key
    generateEncryptionKey() {
        return 'nethunt_' + Date.now().toString(36);
    }

    // Simple encryption for sensitive data
    encrypt(data) {
        try {
            const json = JSON.stringify(data);
            return btoa(json); // Base64 encoding (simple obfuscation)
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    // Simple decryption
    decrypt(encryptedData) {
        try {
            const json = atob(encryptedData);
            return JSON.parse(json);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Validate and sanitize key
    validateKey(key) {
        if (typeof key !== 'string') {
            throw new Error('Key must be a string');
        }
        if (key.length === 0 || key.length > 100) {
            throw new Error('Key length must be between 1 and 100 characters');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
            throw new Error('Key can only contain letters, numbers, underscores, and hyphens');
        }
        return this.prefix + key;
    }

    // Get item from localStorage
    get(key) {
        try {
            const validatedKey = this.validateKey(key);
            const item = localStorage.getItem(validatedKey);
            
            if (!item) {
                return null;
            }

            const parsed = JSON.parse(item);
            
            // Check if data is encrypted
            if (parsed.encrypted && typeof parsed.data === 'string') {
                return this.decrypt(parsed.data);
            }
            
            return parsed.data;
        } catch (error) {
            console.error('Error getting storage item:', error);
            return null;
        }
    }

    // Set item to localStorage
    set(key, value, encrypt = false) {
        try {
            const validatedKey = this.validateKey(key);
            
            // Validate value
            if (value === undefined) {
                throw new Error('Value cannot be undefined');
            }

            let data;
            if (encrypt) {
                const encrypted = this.encrypt(value);
                if (!encrypted) {
                    throw new Error('Failed to encrypt data');
                }
                data = { encrypted: true, data: encrypted, timestamp: Date.now() };
            } else {
                data = { encrypted: false, data: value, timestamp: Date.now() };
            }

            const serialized = JSON.stringify(data);
            
            // Check storage quota
            if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                this.cleanupOldData();
            }

            localStorage.setItem(validatedKey, serialized);
            return true;
        } catch (error) {
            console.error('Error setting storage item:', error);
            return false;
        }
    }

    // Remove item from localStorage
    remove(key) {
        try {
            const validatedKey = this.validateKey(key);
            localStorage.removeItem(validatedKey);
            return true;
        } catch (error) {
            console.error('Error removing storage item:', error);
            return false;
        }
    }

    // Clear all app data from localStorage
    clear() {
        try {
            const keys = this.getKeys();
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Get all keys with app prefix
    getKeys() {
        try {
            const keys = Object.keys(localStorage);
            return keys.filter(key => key.startsWith(this.prefix));
        } catch (error) {
            console.error('Error getting storage keys:', error);
            return [];
        }
    }

    // Get current storage size
    getStorageSize() {
        try {
            let total = 0;
            const keys = this.getKeys();
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    total += new Blob([item]).size;
                }
            });
            return total;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }

    // Get storage size in bytes
    getSize() {
        try {
            let total = 0;
            const keys = this.getKeys();
            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    total += new Blob([item]).size;
                }
            });
            return total;
        } catch (error) {
            console.error('Error getting storage size:', error);
            return 0;
        }
    }

    // User specific methods
    getCurrentUser() {
        return this.get('currentUser');
    }

    setCurrentUser(user) {
        return this.set('currentUser', user);
    }

    removeCurrentUser() {
        return this.remove('currentUser');
    }

    // Users management (with encryption for sensitive data)
    getUsers() {
        try {
            const users = this.get('users') || {};
            // Decrypt sensitive fields for each user
            Object.keys(users).forEach(email => {
                if (users[email].password) {
                    // Password should remain hashed, but other sensitive data can be decrypted
                    users[email] = this.decryptUserData(users[email]);
                }
            });
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            return {};
        }
    }

    setUsers(users) {
        try {
            // Encrypt sensitive data before storing
            const encryptedUsers = {};
            Object.keys(users).forEach(email => {
                encryptedUsers[email] = this.encryptUserData(users[email]);
            });
            return this.set('users', encryptedUsers, true);
        } catch (error) {
            console.error('Error setting users:', error);
            return false;
        }
    }

    // Decrypt user data (except password)
    decryptUserData(userData) {
        const decrypted = { ...userData };
        // Keep password as is (should be hashed)
        if (decrypted.encryptedSettings) {
            decrypted.settings = this.decrypt(decrypted.encryptedSettings);
            delete decrypted.encryptedSettings;
        }
        return decrypted;
    }

    // Encrypt user data (except password)
    encryptUserData(userData) {
        const encrypted = { ...userData };
        // Encrypt settings if present
        if (encrypted.settings) {
            encrypted.encryptedSettings = this.encrypt(encrypted.settings);
            delete encrypted.settings;
        }
        return encrypted;
    }

    addUser(email, userData) {
        try {
            // Validate email
            if (!email || typeof email !== 'string') {
                throw new Error('Valid email is required');
            }

            const users = this.getUsers();
            
            // Check if user already exists
            if (users[email]) {
                throw new Error('User already exists');
            }

            // Validate and sanitize user data
            const sanitizedData = this.validateUserData(userData);
            
            users[email] = sanitizedData;
            return this.setUsers(users);
        } catch (error) {
            console.error('Error adding user:', error);
            return false;
        }
    }

    // Validate user data
    validateUserData(userData) {
        const sanitized = {
            email: userData.email || '',
            password: userData.password || '',
            createdAt: userData.createdAt || Date.now(),
            trialStart: userData.trialStart || Date.now(),
            premiumUntil: userData.premiumUntil || 0,
            premiumPending: userData.premiumPending || false,
            settings: userData.settings || {
                notifications: true,
                theme: 'light',
                autoSave: true
            },
            stats: {
                totalExtractions: userData.stats?.totalExtractions || 0,
                totalUrlsExtracted: userData.stats?.totalUrlsExtracted || 0,
                lastActive: userData.stats?.lastActive || Date.now()
            }
        };

        // Validate numeric fields
        if (typeof sanitized.createdAt !== 'number' || sanitized.createdAt <= 0) {
            sanitized.createdAt = Date.now();
        }
        
        if (typeof sanitized.premiumUntil !== 'number') {
            sanitized.premiumUntil = 0;
        }

        return sanitized;
    }

    getUser(email) {
        try {
            if (!email || typeof email !== 'string') {
                return null;
            }

            const users = this.getUsers();
            return users[email] || null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    updateUser(email, userData) {
        try {
            if (!email || typeof email !== 'string') {
                throw new Error('Valid email is required');
            }

            const users = this.getUsers();
            if (!users[email]) {
                throw new Error('User not found');
            }

            // Validate and merge data
            const validatedData = this.validateUserData({ ...users[email], ...userData });
            users[email] = validatedData;
            
            return this.setUsers(users);
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }

    removeUser(email) {
        try {
            if (!email || typeof email !== 'string') {
                throw new Error('Valid email is required');
            }

            const users = this.getUsers();
            if (users[email]) {
                delete users[email];
                return this.setUsers(users);
            }
            return false;
        } catch (error) {
            console.error('Error removing user:', error);
            return false;
        }
    }

    // Extraction history
    getExtractionHistory() {
        return this.get('extractionHistory') || [];
    }

    setExtractionHistory(history) {
        return this.set('extractionHistory', history);
    }

    addExtractionItem(item) {
        const history = this.getExtractionHistory();
        item.id = Date.now().toString();
        item.timestamp = new Date().toISOString();
        history.unshift(item); // Add to beginning
        
        // Keep only last 50 items
        if (history.length > 50) {
            history.splice(50);
        }
        
        return this.setExtractionHistory(history);
    }

    removeExtractionItem(id) {
        const history = this.getExtractionHistory();
        const filtered = history.filter(item => item.id !== id);
        return this.setExtractionHistory(filtered);
    }

    clearExtractionHistory() {
        return this.setExtractionHistory([]);
    }

    // App settings
    getSettings() {
        return this.get('settings') || {
            theme: 'light',
            autoSave: true,
            exportFormat: 'json',
            maxUrls: 1000,
            notifications: true
        };
    }

    setSettings(settings) {
        const currentSettings = this.getSettings();
        return this.set('settings', { ...currentSettings, ...settings });
    }

    // Admin data
    getAdminData() {
        return this.get('adminData') || {
            totalUsers: 0,
            totalExtractions: 0,
            lastUpdate: new Date().toISOString()
        };
    }

    setAdminData(data) {
        return this.set('adminData', {
            ...this.getAdminData(),
            ...data,
            lastUpdate: new Date().toISOString()
        });
    }

    updateAdminStats() {
        const users = this.getUsers();
        const history = this.getExtractionHistory();
        
        return this.setAdminData({
            totalUsers: Object.keys(users).length,
            premiumUsers: Object.values(users).filter(user => user.premiumUntil && user.premiumUntil > Date.now()).length,
            totalExtractions: history.length
        });
    }

    // Backup and restore
    exportData() {
        try {
            const data = {
                users: this.getUsers(),
                history: this.getExtractionHistory(),
                settings: this.getSettings(),
                adminData: this.getAdminData(),
                exportDate: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.users) {
                this.setUsers(data.users);
            }
            
            if (data.history) {
                this.setExtractionHistory(data.history);
            }
            
            if (data.settings) {
                this.setSettings(data.settings);
            }
            
            if (data.adminData) {
                this.setAdminData(data.adminData);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Utility methods
    isGmail(email) {
        return /@gmail\.com$/i.test(String(email || '').trim());
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.getTime();
    }

    isPremiumActive(user) {
        if (!user?.premiumUntil) return false;
        return Date.now() < user.premiumUntil;
    }

    isTrialActive(user) {
        if (!user?.trialStart) return false;
        return Date.now() < this.addDays(user.trialStart, 1);
    }

    // Storage quota management
    getQuotaUsed() {
        return this.getSize();
    }

    getQuotaAvailable() {
        // localStorage typically has 5-10MB limit
        const estimated = 5 * 1024 * 1024; // 5MB
        return Math.max(0, estimated - this.getQuotaUsed());
    }

    cleanupOldData() {
        try {
            // Remove extraction history items older than 30 days
            const history = this.getExtractionHistory();
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            const filtered = history.filter(item => {
                const itemDate = new Date(item.timestamp).getTime();
                return itemDate > thirtyDaysAgo;
            });
            
            if (filtered.length !== history.length) {
                this.setExtractionHistory(filtered);
            }
            
            return true;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            return false;
        }
    }
}

// Create global storage instance
const storage = new StorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}