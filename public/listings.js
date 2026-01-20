// listings.js - Client-side listing management for PropertEase
// This file handles fetching, displaying, and managing property listings from Firestore

// Import Firestore functions (these are already loaded from CDN in index.html)
const { getDocs, query, where, getDoc, deleteDoc, doc } = window.Firestore;

// Elements
let browseListingsBtn, refreshListingsBtn, listingsContainer, loadingSpinner, emptyState;
let myListingsBtn, myListingsModal, myListingsContainer, myListingsLoading, myListingsEmpty;

// Initialize when DOM is loaded
function initListings() {
    // Browse listings elements
    browseListingsBtn = document.getElementById('browse-listings-btn');
    refreshListingsBtn = document.getElementById('refresh-listings-btn');
    listingsContainer = document.getElementById('listings-container');
    loadingSpinner = document.getElementById('loading-spinner');
    emptyState = document.getElementById('empty-state');

    // My listings elements
    myListingsBtn = document.getElementById('my-listings-btn');
    myListingsModal = document.getElementById('my-listings-modal');
    myListingsContainer = document.getElementById('my-listings-container');
    myListingsLoading = document.getElementById('my-listings-loading');
    myListingsEmpty = document.getElementById('my-listings-empty');

    // Event listeners
    if (browseListingsBtn) {
        browseListingsBtn.addEventListener('click', loadAllListings);
    }

    if (refreshListingsBtn) {
        refreshListingsBtn.addEventListener('click', loadAllListings);
    }

    if (myListingsBtn) {
        myListingsBtn.addEventListener('click', openMyListings);
    }
}

// Fetch all listings from Firestore
async function fetchAllListings() {
    try {
        const querySnapshot = await getDocs(window.collection(window.db, "listings"));
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        return listings;
    } catch (error) {
        console.error("Error fetching listings:", error);
        alert("Error loading listings: " + error.message);
        return [];
    }
}

// Fetch user's listings from Firestore
async function fetchUserListings(userId) {
    try {
        const q = query(window.collection(window.db, "listings"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        return listings;
    } catch (error) {
        console.error("Error fetching user listings:", error);
        alert("Error loading your listings: " + error.message);
        return [];
    }
}

// Delete a listing
async function deleteListing(listingId, userId) {
    if (!confirm("Are you sure you want to delete this listing?")) {
        return false;
    }

    try {
        const listingRef = doc(window.db, "listings", listingId);
        const listingDoc = await getDoc(listingRef);

        // Verify ownership
        if (listingDoc.exists() && listingDoc.data().userId === userId) {
            await deleteDoc(listingRef);
            return true;
        } else {
            alert("You can only delete your own listings.");
            return false;
        }
    } catch (error) {
        console.error("Error deleting listing:", error);
        alert("Error deleting listing: " + error.message);
        return false;
    }
}

// Display listings in a container
function displayListings(listings, container, showActions = false) {
    container.innerHTML = '';

    // Global export for Map integration
    window.currentListings = listings;

    if (window.mapManager && typeof window.mapManager.syncWithListings === 'function') {
        window.mapManager.syncWithListings(listings);
    }

    if (listings.length === 0) {
        return;
    }

    listings.forEach(listing => {
        const card = createListingCard(listing, showActions);
        container.appendChild(card);
    });
}

// Create a listing card element
function createListingCard(listing, showActions = false) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.listingId = listing.id;

    const imageUrl = listing.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';
    const title = listing.title || 'Untitled Listing';
    const description = listing.description || 'No description available';
    const userEmail = listing.userEmail || 'Unknown';
    const createdAt = listing.createdAt ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
    const locationHtml = listing.location ? `<div style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.8rem; color: hsl(var(--primary)); margin-bottom: 0.5rem; margin-top: 0.25rem;"><svg style="width: 1em; height: 1em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${listing.location}</div>` : '';

    card.innerHTML = `
        <div class="property-card-image-wrapper">
            <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;">
        </div>
        <div class="property-card-body">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <h3>${title}</h3>
                <div id="smart-price-${listing.id}" class="magic-badge hidden" style="font-size: 0.7rem; background: hsla(280, 100%, 70%, 0.2); color: hsl(280, 100%, 70%); border: 1px solid hsla(280, 100%, 70%, 0.5); padding: 0.1rem 0.4rem; border-radius: 4px;">
                    ✨ AI PRICE
                </div>
            </div>
            ${locationHtml}
            <p style="color: hsl(var(--muted)); margin: 0.5rem 0;">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
            <p style="font-size: 0.875rem; color: hsl(var(--muted)); margin-top: 1rem;">
                Listed by ${userEmail}<br>
                <span style="font-size: 0.75rem;">Posted on ${createdAt}</span>
            </p>

            <!-- Strategic Addition: AI Vibe Score -->
            <div style="margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <div class="magic-badge" style="background: hsla(150, 100%, 50%, 0.1); color: hsl(150, 100%, 40%); border: 1px solid hsla(150, 100%, 50%, 0.3); font-size: 0.65rem; animation: none;">
                    🍀 VIBE: URBAN PULSE 9.2
                </div>
                <div class="magic-badge" style="background: hsla(200, 100%, 50%, 0.1); color: hsl(200, 100%, 40%); border: 1px solid hsla(200, 100%, 50%, 0.3); font-size: 0.65rem; animation: none;">
                    🔇 QUIET: 8.5
                </div>
            </div>
            
            <div class="property-card-tags" style="margin-top: 1rem; flex-wrap: wrap;">
                <!-- VIP Booking for Premium Users -->
                <button class="btn btn-primary btn-small vip-booking-btn" style="background: linear-gradient(135deg, hsl(var(--primary)), hsl(280, 100%, 70%)); border: none;" onclick="handleVIPBooking('${listing.id}', '${title}')">
                    Schedule VIP Viewing
                </button>

                <button class="btn btn-secondary btn-small a11y-describe-btn" title="Describe image for blind users">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Describe
                </button>
                <button class="btn btn-secondary btn-small a11y-simplify-btn" title="Simplify text for cognitive ease">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg> Simplify
                </button>
                ${showActions ? `
                    <button class="btn btn-secondary btn-small delete-listing-btn" data-id="${listing.id}">Delete</button>
                ` : ''}
            </div>

            <div class="premium-tools" style="margin-top: 0.75rem; display: flex; gap: 0.5rem; border-top: 1px solid hsl(var(--muted)); padding-top: 0.75rem;">
                <button class="btn btn-primary btn-small premium-valuation-btn" title="AI Appraisal" style="background: hsl(280, 100%, 70%); border: none;">
                    📊 Appraisal
                </button>
                <button class="btn btn-secondary btn-small premium-market-btn">
                    📈 Market
                </button>
                <div class="verified-title-badge hidden" style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: #4CAF50; font-weight: bold; cursor: pointer;">
                    🛡️ Blockchain Verified
                </div>
            </div>
        </div>
    `;

    // Accessibility Listeners
    const describeBtn = card.querySelector('.a11y-describe-btn');
    const simplifyBtn = card.querySelector('.a11y-simplify-btn');
    const cardDescription = card.querySelector('.property-card-body p');

    describeBtn.addEventListener('click', async () => {
        const img = card.querySelector('img');
        if (img && window.aiHelper) {
            const desc = await window.aiHelper.describeImage(null); // Passing null will trigger the multimodal logic in helper
            // For this prototype, we'll alert the description or use TTS
            alert("Image Description (Accessible):\n\n" + desc);
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(desc);
                window.speechSynthesis.speak(utterance);
            }
        }
    });

    simplifyBtn.addEventListener('click', async () => {
        if (window.aiHelper && cardDescription) {
            const currentDesc = listing.description || "";
            const simpleDesc = await window.aiHelper.simplifyText(currentDesc);
            cardDescription.textContent = simpleDesc;
            simplifyBtn.classList.add('hidden'); // Hide after use
        }
    });

    // 3D Tour Listener
    const tourBtn = card.querySelector('.btn-secondary.btn-small');
    if (tourBtn && tourBtn.textContent.includes('3D Tour')) {
        tourBtn.addEventListener('click', () => {
            if (window.tour3D) {
                window.tour3D.openTour(listing.id);
            } else {
                alert("3D Viewer is initializing. Please try again in a moment.");
            }
        });
    }

    // Premium Feature Listeners
    const valuationBtn = card.querySelector('.premium-valuation-btn');
    const marketBtn = card.querySelector('.premium-market-btn');
    const titleBadge = card.querySelector('.verified-title-badge');

    valuationBtn.addEventListener('click', async () => {
        if (window.financeAI) {
            const report = await window.financeAI.generateValuationReport(listing.id);
            // Open modal and populate
            document.getElementById('valuation-price').textContent = `$${report.valuation.toLocaleString()}`;
            document.getElementById('valuation-trend').textContent = `+${(report.trend * 100).toFixed(1)}%`;
            document.getElementById('valuation-condition').textContent = report.marketCondition;

            const historyContainer = document.getElementById('valuation-history');
            historyContainer.innerHTML = report.historicalData.map(d => `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.7rem; width: 30px;">${d.year}</span>
                    <div style="flex-grow: 1; background: hsl(var(--secondary)); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: hsl(280, 100%, 70%); height: 100%; width: ${(d.avgPrice / 550000) * 100}%"></div>
                    </div>
                    <span style="font-size: 0.7rem;">$${(d.avgPrice / 1000).toFixed(0)}k</span>
                </div>
            `).join('');

            window.openModal('valuation-modal');
        }
    });

    marketBtn.addEventListener('click', async () => {
        if (window.marketIntelligence) {
            const location = listing.location || "Local Market";
            const forecast = await window.marketIntelligence.getMarketForecast(location);

            document.getElementById('market-insights-location').textContent = location;
            document.getElementById('market-demand-score').textContent = `${forecast.demandScore}/10`;
            document.getElementById('market-yield').textContent = forecast.projectedYield;

            const list = document.getElementById('market-insights-list');
            list.innerHTML = forecast.insights.map(i => `<li>${i}</li>`).join('');

            window.openModal('market-insights-modal');

            // Generate chart (delayed to ensure container is visible)
            setTimeout(() => {
                window.marketIntelligence.generateForecastChart('market-chart', forecast.seasonalOccupancy);
            }, 100);
        }
    });

    // Simulate Blockchain Verification check
    if (listing.id.length % 2 === 0) { // Random logic for demo
        titleBadge.classList.remove('hidden');
        titleBadge.addEventListener('click', async () => {
            if (window.ownershipVerification) {
                const data = await window.ownershipVerification.verifyTitle(listing.id);
                window.ownershipVerification.showCertificateModal(listing.title, data);
            }
        });
    }

    // Add delete event listener if actions are shown
    if (showActions) {
        const deleteBtn = card.querySelector('.delete-listing-btn');
        deleteBtn.addEventListener('click', async () => {
            const success = await deleteListing(listing.id, window.currentUser.uid);
            if (success) {
                card.remove();
                // Check if container is empty
                const container = card.parentElement;
                if (container && container.children.length === 0) {
                    if (container.id === 'my-listings-container') {
                        myListingsEmpty.classList.remove('hidden');
                    }
                }
            }
        });
    }

    // Integrated Smart Pricing (Finance AI)
    if (window.financeAI && document.getElementById('toggle-smart-pricing')?.checked) {
        const basePrice = parseInt(listing.price) || 500000; // Mock base price if missing
        window.financeAI.getSmartPriceSuggestion(basePrice, 'high', 0.9).then(result => {
            const badge = card.querySelector(`#smart-price-${listing.id}`);
            if (badge) {
                badge.classList.remove('hidden');
                badge.title = result.reasoning;
                badge.innerHTML = `✨ AI: $${result.suggestedPrice.toLocaleString()}`;
            }
        });
    }

    return card;
}

// Load and display all listings
async function loadAllListings() {
    loadingSpinner.classList.remove('hidden');
    emptyState.classList.add('hidden');
    browseListingsBtn.classList.add('hidden');
    refreshListingsBtn.classList.remove('hidden');

    const listings = await fetchAllListings();

    loadingSpinner.classList.add('hidden');

    if (listings.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        displayListings(listings, listingsContainer, false);
    }
}

// Open My Listings modal
async function openMyListings() {
    if (!window.currentUser) {
        alert("Please sign in to view your listings.");
        window.openModal('auth-modal');
        return;
    }

    window.openModal('my-listings-modal');

    myListingsLoading.classList.remove('hidden');
    myListingsEmpty.classList.add('hidden');
    myListingsContainer.innerHTML = '';

    const listings = await fetchUserListings(window.currentUser.uid);

    myListingsLoading.classList.add('hidden');

    if (listings.length === 0) {
        myListingsEmpty.classList.remove('hidden');
    } else {
        displayListings(listings, myListingsContainer, true);
    }
}

// Helper function for switchToSignup (to be called from auth buttons)
function switchToSignup() {
    const signupTab = document.getElementById('signup-tab');
    if (signupTab) {
        signupTab.click();
    }
}

// Initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListings);
} else {
    initListings();
}

// Export functions to global scope for inline onclick handlers
window.switchToSignup = switchToSignup;

// 11. Strategic Optimization: VIP Booking Handler
window.handleVIPBooking = function (listingId, title) {
    const isPremium = localStorage.getItem('is_premium_user') === 'true';

    if (!isPremium) {
        alert("VIP Viewing is a Premium feature. Please verify your identity in 'My Profile' to unlock VIP access.");
        // Redirect to profile modal to encourage verification
        if (window.openModal) window.openModal('profile-modal');
        return;
    }

    // Trigger Virtual Concierge for booking flow
    if (window.openModal) window.openModal('chat-modal');

    const bookingMsg = `I want to schedule a VIP viewing for "${title}" (ID: ${listingId}).`;
    if (window.serviceDesk) {
        window.serviceDesk.appendMessage('user', bookingMsg);
        window.serviceDesk.handleConciergeIntent(bookingMsg);
    }
};
