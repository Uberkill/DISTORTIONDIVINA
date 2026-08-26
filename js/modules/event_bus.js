/**
 * Global Event Bus
 * Provides robust Pub/Sub architecture to prevent tight coupling between modules.
 */
export const EventBus = {
    listeners: {},
    history: {}, // State Replay mechanism for late subscribers

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // State Replay: If this event already fired, immediately notify the late subscriber
        if (this.history[event] !== undefined) {
            try {
                callback(this.history[event]);
            } catch (err) {
                console.error(\[EventBus] Error in late subscriber for \:\, err);
            }
        }

        // Return unsubscribe function to prevent memory leaks
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    },

    publish(event, data = null) {
        // Save to history for late subscribers (State Replay)
        this.history[event] = data;

        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                // Hardening: Prevent one broken subscriber from crashing the event loop
                console.error(\[EventBus] Subscriber crashed while handling \:\, err);
            }
        });
    },
    
    // Allow clearing history if a state truly resets
    clearHistory(event) {
        delete this.history[event];
    }
};
