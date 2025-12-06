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
    
    card.innerHTML = `
        <div class="property-card-image-wrapper">
            <img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover;">
        </div>
        <div class="property-card-body">
            <h3>${title}</h3>
            <p style="color: hsl(var(--muted)); margin: 0.5rem 0;">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
            <p style="font-size: 0.875rem; color: hsl(var(--muted)); margin-top: 1rem;">
                Listed by ${userEmail}<br>
                <span style="font-size: 0.75rem;">Posted on ${createdAt}</span>
            </p>
            ${showActions ? `
                <div class="property-card-tags" style="margin-top: 1rem;">
                    <button class="btn btn-secondary btn-small delete-listing-btn" data-id="${listing.id}">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
    
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
