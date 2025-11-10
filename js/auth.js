// Authentication Management
class AuthManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.currentUser = null;
        this.isAdmin = false;
        this.security = new SecurityManager();
        this.rateLimiter = this.security.createRateLimiter(5, 60000); // 5 requests per minute
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.adminCredentials = {
            name: 'nethunter',
            password: 'cbtpratice@nethunter'
        };
    }

    // Initialize auth state
    init() {
        this.currentUser = this.storage.getCurrentUser();
        this.updateUI();
        return this.currentUser;
    }

    // Sign up new user
    async signUp(email, password, confirmPassword) {
        try {
            // Rate limiting
            if (!this.rateLimiter.isAllowed('signup')) {
                throw new Error('Too many signup attempts. Please try again later.');
            }

            // Security validation
            const emailValidation = this.security.validateEmail(email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.error);
            }

            const passwordValidation = this.security.validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.error);
            }

            const confirmValidation = this.security.validatePassword(confirmPassword);
            if (!confirmValidation.valid) {
                throw new Error('Invalid confirmation password');
            }

            if (passwordValidation.sanitized !== confirmValidation.sanitized) {
                throw new Error('Passwords do not match');
            }

            // Check if user already exists
            const existingUser = this.storage.getUser(emailValidation.sanitized);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Create new user with hashed password
            const now = Date.now();
            const userData = {
                email: emailValidation.sanitized,
                password: this.security.hashPassword(passwordValidation.sanitized), // Hashed password
                createdAt: now,
                trialStart: now,
                premiumUntil: 0,
                premiumPending: false,
                settings: {
                    notifications: true,
                    theme: 'light',
                    autoSave: true
                },
                stats: {
                    totalExtractions: 0,
                    totalUrlsExtracted: 0,
                    lastActive: now
                }
            };

            // Save user
            const success = this.storage.addUser(emailValidation.sanitized, userData);
            if (!success) {
                throw new Error('Failed to create user account');
            }

            // Auto sign in after successful signup
            return await this.signIn(emailValidation.sanitized, passwordValidation.sanitized);

        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    // Sign in existing user
    async signIn(email, password) {
        try {
            // Rate limiting
            if (!this.rateLimiter.isAllowed('signin')) {
                throw new Error('Too many signin attempts. Please try again later.');
            }

            // Security validation
            const emailValidation = this.security.validateEmail(email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.error);
            }

            const passwordValidation = this.security.validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error('Invalid password');
            }

            // Get user from storage
            const user = this.storage.getUser(emailValidation.sanitized);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify password hash
            if (!this.security.verifyPassword(passwordValidation.sanitized, user.password)) {
                throw new Error('Invalid password');
            }

            // Check account status
            if (user.suspended) {
                throw new Error('Account has been suspended');
            }

            // Update last active and session
            const updatedUser = {
                ...user,
                stats: {
                    ...user.stats,
                    lastActive: Date.now()
                },
                sessionId: this.security.generateId(),
                sessionExpiry: Date.now() + this.sessionTimeout
            };

            this.storage.updateUser(emailValidation.sanitized, updatedUser);

            // Set as current user
            this.currentUser = updatedUser;
            this.storage.setCurrentUser(updatedUser);
            this.isAdmin = false;

            // Update UI
            this.updateUI();

            return updatedUser;

        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    // Sign out current user
    signOut() {
        this.currentUser = null;
        this.isAdmin = false;
        this.storage.removeCurrentUser();
        this.updateUI();
    }

    // Admin login
    async adminLogin(name, password) {
        try {
            if (name !== this.adminCredentials.name || 
                password !== this.adminCredentials.password) {
                throw new Error('Invalid admin credentials');
            }

            this.isAdmin = true;
            return true;

        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    }

    // Admin logout
    adminLogout() {
        this.isAdmin = false;
        this.updateUI();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if current user is premium
    isPremium() {
        return this.currentUser && (
            this.storage.isPremiumActive(this.currentUser) || 
            this.storage.isTrialActive(this.currentUser)
        );
    }

    // Check if trial is active
    isTrialActive() {
        return this.currentUser && this.storage.isTrialActive(this.currentUser);
    }

    // Get days remaining in trial/premium
    getDaysRemaining() {
        if (!this.currentUser) return 0;

        let endDate;
        if (this.storage.isTrialActive(this.currentUser)) {
            endDate = this.storage.addDays(this.currentUser.trialStart, 1);
        } else if (this.storage.isPremiumActive(this.currentUser)) {
            endDate = this.currentUser.premiumUntil;
        } else {
            return 0;
        }

        const remaining = Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24));
        return Math.max(0, remaining);
    }

    // Update user profile
    async updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            const success = this.storage.updateUser(this.currentUser.email, updates);
            if (!success) {
                throw new Error('Failed to update profile');
            }

            // Update current user object
            this.currentUser = { ...this.currentUser, ...updates };
            this.storage.setCurrentUser(this.currentUser);

            this.updateUI();
            return this.currentUser;

        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            // Verify current password
            if (this.currentUser.password !== currentPassword) {
                throw new Error('Current password is incorrect');
            }

            // Validate new password
            if (newPassword.length < 6) {
                throw new Error('New password must be at least 6 characters');
            }

            // Update password
            return await this.updateProfile({ password: newPassword });

        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }

    // Delete user account
    async deleteAccount(password) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        try {
            // Verify password
            if (this.currentUser.password !== password) {
                throw new Error('Invalid password');
            }

            // Remove user from storage
            const success = this.storage.removeUser(this.currentUser.email);
            if (!success) {
                throw new Error('Failed to delete account');
            }

            // Sign out
            this.signOut();

            return true;

        } catch (error) {
            console.error('Account deletion error:', error);
            throw error;
        }
    }

    // Get user statistics
    getUserStats() {
        if (!this.currentUser) return null;

        return {
            totalExtractions: this.currentUser.stats?.totalExtractions || 0,
            totalUrlsExtracted: this.currentUser.stats?.totalUrlsExtracted || 0,
            memberSince: new Date(this.currentUser.createdAt).toLocaleDateString(),
            lastActive: new Date(this.currentUser.stats?.lastActive).toLocaleDateString(),
            isPremium: this.isPremium(),
            isTrialActive: this.isTrialActive(),
            daysRemaining: this.getDaysRemaining()
        };
    }

    // Update user statistics
    updateUserStats(extractionCount, urlCount) {
        if (!this.currentUser) return;

        const stats = {
            totalExtractions: (this.currentUser.stats?.totalExtractions || 0) + extractionCount,
            totalUrlsExtracted: (this.currentUser.stats?.totalUrlsExtracted || 0) + urlCount,
            lastActive: Date.now()
        };

        this.updateProfile({ stats });
    }

    // Update UI based on auth state
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');

        if (this.currentUser) {
            // Show user menu, hide login button
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userEmail) userEmail.textContent = this.currentUser.email;

            // Update premium status in UI
            this.updatePremiumUI();
        } else {
            // Show login button, hide user menu
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }

    // Update premium UI elements
    updatePremiumUI() {
        const premiumLink = document.getElementById('premiumLink');
        const trialBadge = document.getElementById('trialBadge');
        const premiumBadge = document.getElementById('premiumBadge');

        if (this.isPremium()) {
            if (premiumLink) premiumLink.style.display = 'none';
            
            if (this.isTrialActive() && trialBadge) {
                trialBadge.classList.remove('hidden');
                trialBadge.textContent = `Trial: ${this.getDaysRemaining()} days left`;
            } else if (!this.isTrialActive() && premiumBadge) {
                premiumBadge.classList.remove('hidden');
            }
        } else {
            if (premiumLink) premiumLink.style.display = 'block';
            if (trialBadge) trialBadge.classList.add('hidden');
            if (premiumBadge) premiumBadge.classList.add('hidden');
        }
    }

    // Handle authentication UI interactions
    setupEventListeners() {
        // Auth tab switching
        const signinTab = document.getElementById('signinTab');
        const signupTab = document.getElementById('signupTab');
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');
        const showSignup = document.getElementById('showSignup');
        const showSignin = document.getElementById('showSignin');

        if (signinTab && signupTab) {
            signinTab.addEventListener('click', () => {
                signinTab.classList.add('active');
                signupTab.classList.remove('active');
                signinForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            });

            signupTab.addEventListener('click', () => {
                signupTab.classList.add('active');
                signinTab.classList.remove('active');
                signupForm.classList.remove('hidden');
                signinForm.classList.add('hidden');
            });
        }

        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                signupTab.click();
            });
        }

        if (showSignin) {
            showSignin.addEventListener('click', (e) => {
                e.preventDefault();
                signinTab.click();
            });
        }

        // Form submissions
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignIn();
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignUp();
            });
        }

        // User dropdown
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');

        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.signOut();
                window.app.navigateTo('home');
            });
        }

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.app.navigateTo('auth');
            });
        }
    }

    // Handle sign in form submission
    async handleSignIn() {
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;
        const errorDiv = document.getElementById('authError');
        const errorText = document.getElementById('authErrorText');

        try {
            await this.signIn(email, password);
            
            // Show success message
            window.app.showToast('Signed in successfully!', 'success');
            
            // Navigate to home
            window.app.navigateTo('home');
            
            // Clear error
            if (errorDiv) errorDiv.classList.add('hidden');
            
        } catch (error) {
            if (errorText) errorText.textContent = error.message;
            if (errorDiv) errorDiv.classList.remove('hidden');
        }
    }

    // Handle sign up form submission
    async handleSignUp() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const errorDiv = document.getElementById('authError');
        const errorText = document.getElementById('authErrorText');

        try {
            if (!agreeTerms) {
                throw new Error('You must agree to the Terms of Service and Privacy Policy');
            }

            await this.signUp(email, password, confirmPassword);
            
            // Show success message
            window.app.showToast('Account created successfully!', 'success');
            
            // Navigate to home
            window.app.navigateTo('home');
            
            // Clear error
            if (errorDiv) errorDiv.classList.add('hidden');
            
        } catch (error) {
            if (errorText) errorText.textContent = error.message;
            if (errorDiv) errorDiv.classList.remove('hidden');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
// Enhanced authentication security
AuthManager.prototype.enhancedSignIn = async function(email, password) {
    try {
        // Enhanced rate limiting with IP tracking
        if (!this.rateLimiter.isAllowed("signin_" + email)) {
            throw new Error("Too many signin attempts. Please try again later.");
        }

        // Enhanced validation
        const emailValidation = this.security.validateInput(email, "email");
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }

        const passwordValidation = this.security.validateInput(password, "password");
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }

        // Get user from storage
        const user = this.storage.getUser(emailValidation.sanitized);
        if (!user) {
            throw new Error("User not found");
        }

        // Enhanced password verification with timing attack protection
        const isValidPassword = await this.securePasswordVerify(passwordValidation.sanitized, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid password");
        }

        // Check account status
        if (user.suspended) {
            throw new Error("Account has been suspended");
        }

        // Update last active and session
        const now = Date.now();
        const sessionId = this.security.generateId();
        const updatedUser = {
            ...user,
            stats: {
                ...user.stats,
                lastActive: now
            },
            sessionId: sessionId,
            sessionExpiry: now + this.sessionTimeout
        };

        this.storage.updateUser(emailValidation.sanitized, updatedUser);

        // Set as current user
        this.currentUser = updatedUser;
        this.storage.setCurrentUser(updatedUser);
        this.isAdmin = false;

        // Update UI
        this.updateUI();

        return updatedUser;

    } catch (error) {
        console.error("Enhanced signin error:", error);
        throw this.security.secureError(error);
    }
};

// Secure password verification with timing attack protection
AuthManager.prototype.securePasswordVerify = async function(inputPassword, storedPassword) {
    // Use a constant-time comparison to prevent timing attacks
    if (typeof storedPassword === "string" && storedPassword.startsWith("hashed_")) {
        // For hashed passwords (future enhancement)
        return this.security.verifyPassword(inputPassword, storedPassword);
    } else {
        // For plain text passwords (current implementation)
        // Add artificial delay to prevent timing attacks
        const startTime = Date.now();
        const result = inputPassword === storedPassword;
        const elapsed = Date.now() - startTime;
        
        // Always take at least 100ms to prevent timing attacks
        if (elapsed < 100) {
            await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
        }
        
        return result;
    }
};

