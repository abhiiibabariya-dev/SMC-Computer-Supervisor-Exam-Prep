// ===== PREMIUM FLOW - Firebase Functions Integration =====
// Initializes Firebase Functions and provides server-side payment verification
(function() {
    'use strict';

    // Wait for Firebase to be initialized
    function initFunctions() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            if (typeof firebase.functions === 'function') {
                window.firebaseFunctions = firebase.functions();
                console.log('Firebase Functions initialized');
            } else {
                // Load functions SDK if not already loaded
                const script = document.createElement('script');
                script.src = 'https://www.gstatic.com/firebasejs/12.17.1/firebase-functions-compat.js';
                script.onload = () => {
                    window.firebaseFunctions = firebase.functions();
                    console.log('Firebase Functions loaded and initialized');
                };
                document.head.appendChild(script);
            }
        } else {
            // Firebase not ready yet, retry
            setTimeout(initFunctions, 100);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFunctions);
    } else {
        initFunctions();
    }

    // Also expose a function to get the functions instance
    window.getFirebaseFunctions = function() {
        return window.firebaseFunctions || (firebase.apps.length && firebase.functions ? firebase.functions() : null);
    };
})();