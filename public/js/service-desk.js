/**
 * PropertEase Service Desk
 * Hybrid Bot + Live Agent Queue (FCFS) using Firestore.
 */

class ServiceDesk {
    constructor() {
        this.queueCollection = 'chat_queue';
        this.chatModal = document.getElementById('chat-modal');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.getElementById('chat-msg-input');
        this.sendChatBtn = document.getElementById('send-chat-btn');
        this.queueStatus = document.getElementById('chat-queue-status');
        this.talkToAgentBtn = document.getElementById('talk-to-agent-btn');
        this.currentSessionId = localStorage.getItem('chat_session_id');
        this.isAgentConnected = false;
        this.queueListener = null;

        // Premium: Virtual Concierge
        this.isPremium = localStorage.getItem('is_premium_user') === 'true';
        this.conciergeActive = this.isPremium;

        this.init();
    }

    init() {
        if (this.currentSessionId) {
            this.monitorQueue();
        }
        if (this.sendChatBtn) {
            this.sendChatBtn.addEventListener('click', () => this.handleSendMessage());
        }
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSendMessage();
            });
        }

        // Initial bot greeting
        this.appendMessage('bot', 'Hello! I am the PropertEase Assistant. How can I help you today? You can ask me general questions or type "Talk to agent" to join the live support queue.');
    }

    appendMessage(sender, text) {
        if (!this.chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        this.chatMessages.appendChild(msgDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async handleSendMessage() {
        if (!this.chatInput) return;
        const text = this.chatInput.value.trim();
        console.log(`[ServiceDesk] Attempting to send message: "${text}"`);

        if (!text) {
            console.log("[ServiceDesk] Message is empty, ignoring.");
            return;
        }

        this.appendMessage('user', text);
        this.chatInput.value = '';

        if (this.isPremium && this.conciergeActive) {
            console.log("[ServiceDesk] Premium Concierge active, handling intent...");
            this.handleConciergeIntent(text);
            return;
        }

        if (this.isAgentConnected) {
            // In a real app, this would send to a 'messages' subcollection in Firestore
            console.log("Sending to agent:", text);
            return;
        }

        if (text.toLowerCase().includes('agent') || text.toLowerCase().includes('talk to')) {
            this.joinQueue();
            return;
        }

        // Bot response
        this.getBotResponse(text);
    }

    async getBotResponse(input) {
        this.appendMessage('bot', 'Thinking...');

        // Simple heuristic bot for prototype
        let response = "I'm sorry, I didn't quite catch that. Try asking about properties, pricing, or say 'Talk to agent'.";

        if (input.toLowerCase().includes('propertease')) {
            response = "PropertEase is an AI-powered real estate platform that simplifies property discovery, verification, and transactions.";
        } else if (input.toLowerCase().includes('price') || input.toLowerCase().includes('cost')) {
            response = "Our AI provides real-time pricing intelligence based on market trends and property features. You can see the 'AI Price' on any listing.";
        } else if (input.toLowerCase().includes('3d') || input.toLowerCase().includes('tour')) {
            response = "Most listings include high-fidelity 3D tours using our NeRF-powered walkthrough technology.";
        } else if (window.aiHelper && typeof window.runPrompt === 'function') {
            try {
                // Try using Gemini Nano if available
                const aiResponse = await window.runPrompt(`You are a PropertEase customer support bot. Answer this enquiry briefly: ${input}`);
                response = aiResponse || response;
            } catch (e) {
                console.error("Bot AI error:", e);
            }
        }

        // Remove 'Thinking...' and add real response
        const messages = this.chatMessages.querySelectorAll('.chat-message.bot');
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.textContent === 'Thinking...') {
            lastMsg.textContent = response;
        } else {
            this.appendMessage('bot', response);
        }
    }

    async joinQueue() {
        if (this.currentSessionId) return;

        this.appendMessage('bot', 'Joining the live agent queue... Please wait.');
        if (this.queueStatus) {
            this.queueStatus.style.display = 'block';
            this.queueStatus.textContent = 'Queue Status: Connecting...';
        }

        try {
            const userId = window.auth?.currentUser?.uid || 'anon_' + Date.now();
            const sessionData = {
                userId: userId,
                userName: window.auth?.currentUser?.displayName || 'Anonymous User',
                timestamp: window.Firestore.serverTimestamp ? window.Firestore.serverTimestamp() : new Date(),
                status: 'waiting',
                agentId: null
            };

            const docRef = await window.collection(window.db, this.queueCollection);
            const newDoc = await window.Firestore.addDoc(docRef, sessionData);
            this.currentSessionId = newDoc.id;
            localStorage.setItem('chat_session_id', this.currentSessionId);

            this.monitorQueue();
        } catch (e) {
            console.error("Queue error:", e);
            this.appendMessage('bot', 'Failed to join queue. Please try again later.');
        }
    }

    monitorQueue() {
        if (!this.currentSessionId || !window.Firestore || !window.Firestore.onSnapshot) {
            console.error("Session or Firestore not ready for monitoring.");
            return;
        }

        const docRef = window.Firestore.doc(window.db, this.queueCollection, this.currentSessionId);
        this.queueListener = window.Firestore.onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.status === 'active' && data.agentId) {
                    this.isAgentConnected = true;
                    this.appendMessage('bot', `Agent ${data.agentName || 'assigned'} connected!`);
                    if (this.queueStatus) {
                        this.queueStatus.textContent = `Connected to: ${data.agentName || 'Agent'}`;
                        this.queueStatus.classList.add('connected');
                    }
                    if (this.talkToAgentBtn) this.talkToAgentBtn.style.display = 'none';
                } else if (data.status === 'waiting') {
                    this.updateQueuePosition(data.timestamp);
                }
            }
        });
    }

    async updateQueuePosition(userTimestamp) {
        if (!userTimestamp) return;

        try {
            // FCFS Logic: Count sessions with status 'waiting' and an earlier timestamp
            const q = window.Firestore.query(
                window.collection(window.db, this.queueCollection),
                window.Firestore.where('status', '==', 'waiting'),
                window.Firestore.where('timestamp', '<', userTimestamp)
            );

            const snapshot = await window.Firestore.getDocs(q);
            const position = snapshot.size + 1;

            if (this.queueStatus) {
                this.queueStatus.textContent = `Queue Position: #${position}`;
                this.queueStatus.style.display = 'block';
            }
        } catch (e) {
            console.error("Error updating queue position:", e);
        }
    }

    /**
     * Virtual Concierge Intent Handling (Premium)
     */
    async handleConciergeIntent(input) {
        this.appendMessage('bot', 'Processing your premium request with priority...');

        let response = "I've logged your request. Your dedicated concierge is analyzing the market to assist you. What else can I do?";

        if (input.toLowerCase().includes('book') || input.toLowerCase().includes('viewing')) {
            response = "I've scheduled a private VIP viewing for you. A digital confirmation is being sent to your dashboard. Should I arrange a luxury car for the tour?";
        } else if (input.toLowerCase().includes('negotiate') || input.toLowerCase().includes('offer')) {
            response = "I can initiate an AI-assisted negotiation for this property. I'll analyze the seller's history and current market trends to suggest the best entry point.";
        } else if (input.toLowerCase().includes('market') || input.toLowerCase().includes('trends')) {
            response = "I'm pulling up the latest Predictive Market Insights for this location. The demand is currently High Growth with a 5.2% projected yield.";
        }

        setTimeout(() => {
            const botMsgs = this.chatMessages.querySelectorAll('.chat-message.bot');
            const lastBotMsg = botMsgs[botMsgs.length - 1];
            if (lastBotMsg && lastBotMsg.textContent === 'Processing your premium request with priority...') {
                lastBotMsg.textContent = response;
            } else {
                this.appendMessage('bot', response);
            }

            // Voice Feedback (Premium)
            if ('speechSynthesis' in window && this.isPremium) {
                const utterance = new SpeechSynthesisUtterance(response);
                window.speechSynthesis.speak(utterance);
            }
        }, 1200);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    window.serviceDesk = new ServiceDesk();
});
