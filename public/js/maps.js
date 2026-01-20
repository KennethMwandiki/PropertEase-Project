/**
 * PropertEase Map Manager
 * Handles Google Maps initialization, property markers, and geolocation.
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.defaultLocation = { lat: -1.286389, lng: 36.817223 }; // Nairobi default
    }

    initMap() {
        console.log("[Map] Initializing Google Maps...");
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        this.map = new google.maps.Map(mapElement, {
            center: this.defaultLocation,
            zoom: 13,
            styles: this.getPremiumStyles(), // Dark mode aesthetic
            disableDefaultUI: false,
            zoomControl: true,
        });

        if (window.currentListings) {
            this.syncWithListings(window.currentListings);
        }
        this.enableGeolocation();
    }

    syncWithListings(listings) {
        if (!this.map) return;
        console.log("[Map] Syncing markers with listings...");

        // Clear existing markers
        this.clearMarkers();

        listings.forEach(listing => {
            if (listing.location && listing.location.includes(',')) {
                const [lat, lng] = listing.location.split(',').map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    this.addMarker({ lat, lng }, listing.title, listing.description);
                }
            }
        });
    }

    addMarker(position, title, description) {
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: title,
            animation: google.maps.Animation.DROP
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color: #333; max-width: 200px;"><strong>${title}</strong><p style="font-size: 0.8rem; margin: 5px 0;">${description.substring(0, 50)}...</p></div>`
        });

        marker.addListener("click", () => {
            infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
    }

    clearMarkers() {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
    }

    enableGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    this.map.setCenter(pos);
                    new google.maps.Marker({
                        position: pos,
                        map: this.map,
                        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        title: "Your Location"
                    });
                },
                () => {
                    console.warn("[Map] Geolocation failed or denied.");
                }
            );
        }
    }

    getPremiumStyles() {
        // Dark Mode Styles for Google Maps
        return [
            { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
            { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
            { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
            { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
            { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
            { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
            { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
            { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
            { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
            { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
            { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
            { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
            { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
            { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
            { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
            { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
            { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
        ];
    }
}

window.mapManager = new MapManager();

// Global callback for Gmaps
window.initMap = () => {
    window.mapManager.initMap();
};
