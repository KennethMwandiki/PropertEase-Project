/**
 * PropertEase 3D Tour Viewer
 * Uses Three.js to simulate a NeRF-based (Neural Radiance Field) immersive walkthrough.
 */

class Tour3DViewer {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Cleanup existing
        this.container.innerHTML = '';

        // Three.js Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Simulated NeRF Environment (Sphere with texture)
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert for inside view

        // Use a high-quality property panorama (Unsplash)
        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://images.unsplash.com/photo-1513584684374-8bdb7489feef?auto=format&fit=crop&w=2000&q=80');
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);

        this.camera.position.set(0, 0, 0.1);

        // Simple Controls (Mouse Look)
        let isUserInteracting = false;
        let onPointerDownPointerX = 0, onPointerDownPointerY = 0;
        let lon = 0, onPointerDownLon = 0;
        let lat = 0, onPointerDownLat = 0;
        let phi = 0, theta = 0;

        this.container.addEventListener('mousedown', (e) => {
            isUserInteracting = true;
            onPointerDownPointerX = e.clientX;
            onPointerDownPointerY = e.clientY;
            onPointerDownLon = lon;
            onPointerDownLat = lat;
        });

        window.addEventListener('mousemove', (e) => {
            if (isUserInteracting) {
                lon = (onPointerDownPointerX - e.clientX) * 0.1 + onPointerDownLon;
                lat = (e.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
            }
        });

        window.addEventListener('mouseup', () => {
            isUserInteracting = false;
        });

        const animate = () => {
            requestAnimationFrame(animate);

            lat = Math.max(-85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);

            this.camera.target = new THREE.Vector3(
                500 * Math.sin(phi) * Math.cos(theta),
                500 * Math.cos(phi),
                500 * Math.sin(phi) * Math.sin(theta)
            );

            this.camera.lookAt(this.camera.target);
            this.renderer.render(this.scene, this.camera);
        };

        animate();

        // Responsive
        window.addEventListener('resize', () => {
            if (this.container) {
                this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            }
        });
    }

    openTour(listingId) {
        // Show modal or container
        const modal = document.getElementById('tour-3d-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.init('tour-3d-canvas');
        }
    }
}

// Global instance
window.tour3D = new Tour3DViewer();
