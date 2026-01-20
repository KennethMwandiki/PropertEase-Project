/**
 * PropertEase Auth Manager
 * Centrally manages authentication state, UI toggling, and account actions.
 */

class AuthManager {
    constructor(auth, updateProfile) {
        this.auth = auth;
        this.updateProfile = updateProfile;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Elements
        this.guestNav = document.getElementById('guest-nav');
        this.userInfoNav = document.getElementById('user-info-nav');
        this.welcomeName = document.getElementById('welcome-name');
        this.profileName = document.getElementById('profile-name');
        this.profileEmail = document.getElementById('profile-email');
        this.heroSubtitle = document.getElementById('hero-subtitle');

        // Modal Forms
        this.signinForm = document.getElementById('signin-form');
        this.signupForm = document.getElementById('signup-form');
        this.signOutBtn = document.getElementById('signout-btn');

        this.setupListeners();
    }

    setupListeners() {
        // Sign In
        if (this.signinForm) {
            this.signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signin-email').value;
                const password = document.getElementById('signin-password').value;
                try {
                    await window.FirebaseLogout.signInWithEmailAndPassword(this.auth, email, password);
                    window.closeModal('auth-modal');
                } catch (error) {
                    alert("Sign in failed: " + error.message);
                }
            });
        }

        // Sign Up
        if (this.signupForm) {
            this.signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const name = document.getElementById('signup-name').value;
                try {
                    const userCredential = await window.FirebaseLogout.createUserWithEmailAndPassword(this.auth, email, password);
                    await this.updateProfile(userCredential.user, { displayName: name });
                    window.closeModal('auth-modal');
                } catch (error) {
                    alert("Sign up failed: " + error.message);
                }
            });
        }

        // Sign Out
        if (this.signOutBtn) {
            this.signOutBtn.addEventListener('click', async () => {
                try {
                    await window.FirebaseLogout.signOut(this.auth);
                    alert("Signed out successfully.");
                } catch (error) {
                    console.error("Sign out error", error);
                }
            });
        }
    }

    onStateChanged(user) {
        this.currentUser = user;
        window.currentUser = user;
        this.updateUI();
    }

    updateUI() {
        if (this.currentUser) {
            if (this.guestNav) this.guestNav.classList.add('hidden');
            if (this.userInfoNav) this.userInfoNav.classList.remove('hidden');
            if (this.welcomeName) this.welcomeName.textContent = `Welcome, ${this.currentUser.displayName || 'User'}!`;
            if (this.profileName) this.profileName.textContent = this.currentUser.displayName || 'No name set';
            if (this.profileEmail) this.profileEmail.textContent = this.currentUser.email;
            if (this.heroSubtitle) this.heroSubtitle.textContent = `Welcome back, ${this.currentUser.displayName || 'User'}! Ready to find your next property?`;

            // Premium Status Persistence
            const isPremium = localStorage.getItem('is_premium_user') === 'true';
            if (isPremium) {
                this.enablePremiumUI();
            }
        } else {
            if (this.guestNav) this.guestNav.classList.remove('hidden');
            if (this.userInfoNav) this.userInfoNav.classList.add('hidden');
            if (this.heroSubtitle) this.heroSubtitle.textContent = 'Discover, verify, and book properties with confidence using our AI-powered platform.';
            localStorage.removeItem('is_premium_user');
        }
    }

    enablePremiumUI() {
        const welcomeContainer = document.querySelector('.user-welcome');
        const badgeId = 'premium-badge-global';
        if (welcomeContainer && !document.getElementById(badgeId)) {
            const badge = document.createElement('span');
            badge.id = badgeId;
            badge.className = 'magic-badge';
            badge.style.marginLeft = '0.5rem';
            badge.style.background = 'hsl(280, 100%, 70%)';
            badge.style.color = 'hsl(280, 100%, 10%)';
            badge.textContent = 'PREMIUM';
            welcomeContainer.appendChild(badge);
        }
    }
}

window.AuthManager = AuthManager;
