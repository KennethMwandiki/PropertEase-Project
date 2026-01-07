# Manual HTML Changes Needed for index.html

## 1. Fix Header Structure (Lines 736-754)

**Current (Broken):**
```html
<body>

    <!-- Logged In State -->
    <div id="user-info-nav" class="user-info hidden">
        <!-- ... user info content ... -->
    </div>
    </div>
    </div>
    </div>
    </header>
```

**Replace with:**
```html
<body>

    <!-- HEADER / NAVIGATION -->
    <header class="navbar">
        <div class="nav-content">
            <div class="logo">PropertEase</div>
            <nav class="nav-links">
                <!-- Auth Buttons for Logged Out Users -->
                <div id="auth-buttons" class="hidden">
                    <button class="btn btn-secondary" onclick="openModal('auth-modal')">Sign In</button>
                    <button class="btn btn-primary" onclick="openModal('auth-modal'); switchToSignup()">Sign Up</button>
                </div>
                
                <!-- User Info for Logged In Users -->
                <div id="user-info-nav" class="user-info hidden">
                    <button id="my-listings-btn" class="btn btn-secondary">My Listings</button>
                    <div id="profile-btn" class="profile-button">
                        <img src="https://i.pravatar.cc/40?u=propertease" alt="User Avatar">
                        <span id="welcome-name">Welcome!</span>
                    </div>
                    <button id="signout-btn" class="btn btn-secondary">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>
        </div>
    </header>
```

## 2. Add Browse Listings Section (After line 864 - after "Influencer Hub" section)

**Insert before the closing `</main>` tag:**
```html
        <!-- Browse All Listings Section -->
        <section class="container" style="margin-top: 4rem;">
            <div class="map-card-header">
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <h2>Browse All Listings</h2>
            </div>
            <button id="browse-listings-btn" class="btn btn-primary" style="margin-bottom: 2rem;">Load Listings</button>
            <button id="refresh-listings-btn" class="btn btn-secondary hidden" style="margin-bottom: 2rem; margin-left: 1rem;">Refresh</button>
            
            <div id="loading-spinner" class="hidden" style="text-align: center; padding: 2rem;">
                <p>Loading listings...</p>
            </div>
            
            <div id="listings-container" class="property-grid"></div>
            
            <div id="empty-state" class="hidden" style="text-align: center; padding: 3rem; color: hsl(var(--muted));">
                <p>No listings found. Be the first to create one!</p>
            </div>
        </section>
```

## 3. Add My Listings Modal (After Profile Modal, around line 1028)

**Insert after the `</div>` closing the profile modal:**
```html
    <!-- MY LISTINGS MODAL -->
    <div id="my-listings-modal" class="modal hidden">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <button class="modal-close-btn" onclick="closeModal('my-listings-modal')">&times;</button>
            <h2 class="modal-title">My Listings</h2>
            
            <div id="my-listings-loading" class="hidden" style="text-align: center; padding: 2rem;">
                <p>Loading your listings...</p>
            </div>
            
            <div id="my-listings-container" style="display: grid; gap: 1.5rem;"></div>
            
            <div id="my-listings-empty" class="hidden" style="text-align: center; padding: 3rem; color: hsl(var(--muted));">
                <p>You haven't created any listings yet.</p>
                <button class="btn btn-primary" onclick="closeModal('my-listings-modal'); openModal('smart-builder-modal');" style="margin-top: 1rem;">Create Your First Listing</button>
            </div>
        </div>
    </div>
```

## 4. Add Script Include (Before closing `</body>` tag, around line 1279)

**Insert before `</body>`:**
```html
    <!-- Listings Management Script -->
    <script src="listings.js"></script>

</body>
```

## 5. Update updateUI() function in JavaScript (around line 1230)

**Find the `updateUI()` function and update it to show/hide auth buttons:**
```javascript
function updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    
    if (currentUser) {
        userInfoNav.classList.remove('hidden');
        if (authButtons) authButtons.classList.add('hidden');
        welcomeName.textContent = `Welcome, ${currentUser.displayName || 'User'}`;
        profileName.textContent = currentUser.displayName || 'User';
        profileEmail.textContent = currentUser.email;
        heroSubtitle.textContent = `Welcome back, ${currentUser.displayName}! Ready to find your next property?`;
    } else {
        userInfoNav.classList.add('hidden');
        if (authButtons) authButtons.classList.remove('hidden');
        heroSubtitle.textContent = 'Discover, verify, and book properties with confidence using our AI-powered platform.';
    }
}
```

---

## Quick Implementation Steps:

1. Open `c:\Users\User\Documents\PropertEase-Project\public\index.html` in your editor
2. Make the 5 changes listed above
3. Save the file
4. Run `firebase deploy --only hosting` to deploy
5. Test at: https://properteaseapp.web.app

The `listings.js` file is already created and ready to use!
