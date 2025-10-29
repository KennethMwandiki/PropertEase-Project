'use client';

import React, { useState, useEffect, FormEvent } from 'react';

type AuthState = 'signed_in' | 'signed_out';
type ActiveModal = null | 'auth' | 'profile' | 'chat';
type AuthForm = 'signin' | 'signup';

interface User {
    name: string;
    email: string;
}

interface Property {
    name: string;
    description: string;
    price: string;
    market_avg: string;
    image: string;
    recommendation_reason: string;
}

interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

export default function HomePage() {
    // --- STATE MANAGEMENT ---
    const [authState, setAuthState] = useState<AuthState>('signed_out');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [authForm, setAuthForm] = useState<AuthForm>('signin');

    // Form states
    const [signinEmail, setSigninEmail] = useState('');
    const [signinPassword, setSigninPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    // Form validation error states
    const [signupErrors, setSignupErrors] = useState({ name: '', email: '', password: '' });

    // Chat states
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hello! How can I help you find your perfect space today? You can ask me about listings, neighborhoods, or scheduling a tour." }
    ]);
    const [recommendations, setRecommendations] = useState<Property[]>([]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const prompt = "Return a JSON object with a key 'properties' which is an array of 3 property objects. Each object should have the following keys: 'name', 'description', 'price', 'market_avg', 'image', 'recommendation_reason'. The 'image' should be a URL from unsplash.com. The other fields should be realistic for a property listing.";

                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                    throw new Error('Failed to get recommendations');
                }

                const data = await response.json();
                const jsonResponse = JSON.parse(data.text);
                setRecommendations(jsonResponse.properties);

            } catch (error) {
                console.error(error);
            }
        };

        fetchRecommendations();
    }, []);

    // --- PUSH NOTIFICATIONS ---
    // This effect runs once to set up push notifications if the user grants permission.
    useEffect(() => {
        function configurePushNotifications() {
            if ('serviceWorker' in navigator && 'Notification' in window) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered with scope:', registration.scope);
                        return Notification.requestPermission();
                    })
                    .then(permission => {
                        if (permission === 'granted') {
                            console.log('Notification permission granted.');
                            // Here you would subscribe the user and send the subscription to your backend
                        } else {
                            console.log('Unable to get permission to notify.');
                        }
                    })
                    .catch(error => console.error('Service Worker registration failed:', error));
            }
        }
        // In a real app, you might trigger this after a specific user action,
        // like completing signup. For this prototype, we can log it on load.
        console.log("Push notification setup is available.");
        // configurePushNotifications(); // Uncomment to run on page load
    }, []);

    // --- AUTHENTICATION LOGIC ---
    const handleSignIn = (e: FormEvent) => {
        e.preventDefault();
        // In a real app, you would call your backend API here
        // For now, we'll simulate a successful login
        if (signinEmail) {
            const name = signinEmail.split('@')[0].replace(/\W/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
            setCurrentUser({ name, email: signinEmail });
            setAuthState('signed_in');
            setActiveModal(null);
            setSigninEmail('');
            setSigninPassword('');
        }
    };

    const validateSignUpForm = () => {
        const errors = { name: '', email: '', password: '' };
        let isValid = true;

        if (!signupName.trim()) {
            errors.name = 'Full Name is required.';
            isValid = false;
        }
        if (!signupEmail.trim()) {
            errors.email = 'Email Address is required.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }
        if (!signupPassword.trim()) {
            errors.password = 'Password is required.';
            isValid = false;
        }

        setSignupErrors(errors);
        return isValid;
    };

    const handleSignUp = (e: FormEvent) => {
        e.preventDefault();
        if (validateSignUpForm()) {
            // In a real app, you would call your backend API here
            setCurrentUser({ name: signupName, email: signupEmail });
            setAuthState('signed_in');
            setActiveModal(null);
            setSignupName('');
            setSignupEmail('');
            setSignupPassword('');
        }
    };

    const handleSignOut = () => {
        setAuthState('signed_out');
        setCurrentUser(null);
    };

    // --- CHAT LOGIC ---
    const handleSendMessage = async () => {
        const message = chatInput.trim();
        if (!message) return;

        const newMessages = [...chatMessages, { sender: 'user' as const, text: message }];
        setChatMessages(newMessages);
        setChatInput('');

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: message }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI assistant');
            }

            const data = await response.json();
            const botResponse = data.text;

            setChatMessages(prev => [...prev, { sender: 'bot' as const, text: botResponse }]);
        } catch (error) {
            console.error(error);
            const botResponse = "I'm sorry, something went wrong. Please try again later.";
            setChatMessages(prev => [...prev, { sender: 'bot' as const, text: botResponse }]);
        }
    };

    // --- RENDER LOGIC ---
    return (
        <>
            {/* NAVBAR */}
            <header className="navbar">
                <div className="nav-content container">
                    <div className="logo">PropertEase</div>
                    <div id="auth-container">
                        <div className="nav-links">
                            <button className="btn btn-secondary" onClick={() => alert('Opening owner verification flow...')}>List your space</button>
                            {authState === 'signed_out' ? (
                                <button id="signin-btn" className="btn btn-primary" onClick={() => { setAuthForm('signin'); setActiveModal('auth'); }}>
                                    <svg className="icon" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                                    <span>Sign In</span>
                                </button>
                            ) : (
                                <div id="user-info-nav" className="user-info">
                                    <div id="profile-btn" className="profile-button" onClick={() => setActiveModal('profile')}>
                                        <img src={`https://i.pravatar.cc/40?u=${currentUser?.email}`} alt="User Avatar" />
                                        <span>Welcome, {currentUser?.name.split(' ')[0]}!</span>
                                    </div>
                                    <button id="signout-btn" className="btn btn-secondary" onClick={handleSignOut}>
                                        <svg className="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main>
                <div className="hero container">
                    <h1>Find Your Next Space</h1>
                    <p id="hero-subtitle">
                        {authState === 'signed_in' && currentUser
                            ? `Welcome back, ${currentUser.name}! Discover, verify, and book properties with confidence using our AI-powered platform.`
                            : 'Discover, verify, and book properties with confidence using our AI-powered platform.'
                        }
                    </p>
                </div>

                {/* Search Bar */}
                <div className="search-bar container">
                    <input type="text" placeholder="Search by city, neighborhood, or address..." />
                    <button className="btn btn-primary">
                        <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
                        <span>Search</span>
                    </button>
                </div>

                {/* AI-Powered Recommendations */}
                <div className="container">
                    <div className="map-card-header">
                        <svg className="icon" viewBox="0 0 24 24"><path d="M12 2l.7 4.4L18 7l-3.8 2.3L18 14l-5.3-1.1L12 22l-1.6-8.1L5 14l3.8-2.3L5 7l5.3.4z" /></svg>
                        <h2>Personalized For You</h2>
                    </div>
                    <div className="property-grid">
                        {recommendations.length > 0 ? (
                            recommendations.map((property, index) => (
                                <div className="property-card" key={index}>
                                    <div className="property-card-image-wrapper">
                                        <img src={property.image} alt={property.name} />
                                        <button className="btn-icon btn-save" aria-label="Save property" onClick={(e) => e.currentTarget.classList.toggle('saved')}>
                                            <svg className="icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                                        </button>
                                    </div>
                                    <div className="property-card-body">
                                        <h3>{property.name}</h3>
                                        <p>{property.description}</p>
                                        <p><b>AI Price: {property.price}</b> <span className="price-market-avg">(Market average: {property.market_avg})</span></p>
                                        <div className="property-card-tags">
                                            <button className="btn btn-secondary btn-small">View 3D Tour</button>
                                            <button className="btn-ai-why btn-small" onClick={() => alert(`AI Recommendation Reason:\n\n- ${property.recommendation_reason}`)}>Why this for me?</button>
                                            <button className="btn-secondary btn-small" onClick={async () => {
                                                try {
                                                    const response = await fetch('/api/gemini-vision', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                        },
                                                        body: JSON.stringify({ imageUrl: property.image, prompt: 'Describe this image in detail.' }),
                                                    });
                                                    const data = await response.json();
                                                    alert(`Image Analysis:\n\n${data.text}`);
                                                } catch (error) {
                                                    console.error(error);
                                                    alert('Failed to analyze image.');
                                                }
                                            }}>Analyze Image</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Loading recommendations...</p>
                        )}
                    </div>
                </div>

                <div className="map-card container">
                    <div className="map-card-header">
                        <svg className="icon" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        <h2>Discover Properties Near You</h2>
                    </div>
                    <div className="map-placeholder">
                        <p>Interactive Map Placeholder</p>
                    </div>

                    <iframe src="https://your-3d-tour-provider.com/tour/123" width="100%" height="400px" title="3D Tour">3D Tour</iframe>
                </div>

                {/* CTA: Become a Host */}
                <section className="cta-section container">
                    <h2>Become a PropertEase Host</h2>
                    <p>Join thousands of property owners who are seamlessly connecting with buyers and renters. Our AI tools help you create listings, set prices, and verify tenants with ease.</p>
                    <button className="btn btn-primary btn-large" onClick={() => alert('Opening owner verification flow...')}>Start Listing Today</button>
                </section>

                {/* CTA: Influencer Hub */}
                <section className="cta-section container">
                    <h2>Join our Influencer Hub</h2>
                    <p>Are you a content creator in the real estate, finance, or lifestyle space? Partner with PropertEase to create authentic content and earn commissions.</p>
                    <button className="btn btn-secondary btn-large" onClick={() => alert('Redirecting to Influencer Onboarding...')}>Become a Partner</button>
                </section>
            </main>

            <footer className="footer">
                <p>© 2025 Ken’s Digital Hub. All rights reserved. PropertEase and its framework are the exclusive property of Ken’s Digital Hub.</p>
            </footer>

            {/* --- MODALS --- */}

            {/* AUTHENTICATION MODAL */}
            {activeModal === 'auth' && (
                <div id="auth-modal" className="modal">
                    <div className="modal-content">
                        <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>

                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${authForm === 'signin' ? 'active' : ''}`}
                                onClick={() => setAuthForm('signin')}
                            >
                                Sign In
                            </button>
                            <button
                                className={`auth-tab ${authForm === 'signup' ? 'active' : ''}`}
                                onClick={() => setAuthForm('signup')}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Sign In Form */}
                        {authForm === 'signin' && (
                            <form id="signin-form" className="modal-form" onSubmit={handleSignIn}>
                                <h2 className="modal-title">Welcome Back</h2>
                                <input
                                    id="signin-email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={signinEmail}
                                    onChange={(e) => setSigninEmail(e.target.value)}
                                    required
                                />
                                <input
                                    id="signin-password"
                                    type="password"
                                    placeholder="Password"
                                    value={signinPassword}
                                    onChange={(e) => setSigninPassword(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary btn-full-width">Sign In</button>
                                <p className="form-switcher">
                                    Don&apos;t have an account? <a href="#" onClick={(e) => { e.preventDefault(); setAuthForm('signup'); }}>Sign Up</a>
                                </p>
                            </form>
                        )}

                        {/* Sign Up Form */}
                        {authForm === 'signup' && (
                            <form id="signup-form" className="modal-form" onSubmit={handleSignUp}>
                                <h2 className="modal-title">Create Your Account</h2>
                                {signupErrors.name && <div className="error-message">{signupErrors.name}</div>}
                                <input
                                    id="signup-name"
                                    type="text"
                                    placeholder="Full Name"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    required
                                />

                                {signupErrors.email && <div className="error-message">{signupErrors.email}</div>}
                                <input
                                    id="signup-email"
                                    type="email"
                                    placeholder="Email Address"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />

                                {signupErrors.password && <div className="error-message">{signupErrors.password}</div>}
                                <input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Password"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary btn-full-width">Create Account</button>
                                <p className="form-switcher">
                                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setAuthForm('signin'); }}>Sign In</a>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* PROFILE MODAL */}
            {activeModal === 'profile' && currentUser && (
                <div id="profile-modal" className="modal">
                    <div className="modal-content">
                        <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
                        <div className="modal-body-centered">
                            <img src={`https://i.pravatar.cc/80?u=${currentUser.email}`} alt="User Avatar" className="profile-avatar-large" />
                            <h2 id="profile-name">{currentUser.name}</h2>
                            <p id="profile-email" className="profile-email">{currentUser.email}</p>
                            <button className="btn btn-secondary btn-full-width mb-1">My Listings</button>
                            <button className="btn btn-secondary btn-full-width">Account Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chat Bubble */}
            <div id="chat-bubble" className="chat-bubble" onClick={() => setActiveModal('chat')}>
                <svg className="icon" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>

            {/* CHAT MODAL */}
            {activeModal === 'chat' && (
                <div id="chat-modal" className="modal">
                    <div className="modal-content chat-modal-content">
                        <div className="chat-header">
                            <h3>PropertEase AI Assistant</h3>
                            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>&times;</button>
                        </div>
                        <div id="chat-messages" className="chat-messages">
                            {chatMessages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.sender}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <div id="chat-input-area" className="chat-input-area">
                            <input
                                id="chat-input"
                                type="text"
                                placeholder="Type your message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button id="chat-send-btn" className="btn btn-primary" onClick={handleSendMessage}>
                                <svg className="icon" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                            <button id="chat-voice-btn" className="btn btn-secondary" onClick={() => alert('Voice input demo!')}>
                                <svg className="icon" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

