// Gujarat Govt Jobs Hub - Feedback Module
// Provides user feedback functionality for job listings and site features
// This is a placeholder implementation to prevent 404 errors

(function(){
    'use strict';

    // Simple feedback tracker - stores user interactions locally
    window.FeedbackTracker = {
        // Track a user action
        track: function(action, data) {
            try {
                const feedback = JSON.parse(localStorage.getItem('smc_feedback') || '[]');
                feedback.push({
                    action: action,
                    data: data || {},
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
                // Keep only last 100 feedback entries
                if (feedback.length > 100) {
                    feedback.splice(0, feedback.length - 100);
                }
                localStorage.setItem('smc_feedback', JSON.stringify(feedback));
            } catch (e) {
                console.warn('Feedback tracking failed:', e);
            }
        },

        // Get all feedback entries
        getAll: function() {
            try {
                return JSON.parse(localStorage.getItem('smc_feedback') || '[]');
            } catch (e) {
                return [];
            }
        },

        // Clear feedback history
        clear: function() {
            localStorage.removeItem('smc_feedback');
        }
    };

    // Auto-track common interactions
    document.addEventListener('click', function(e) {
        // Track job card clicks
        if (e.target.closest('.job-card')) {
            const jobCard = e.target.closest('.job-card');
            FeedbackTracker.track('job_card_click', {
                jobId: jobCard.dataset.jobId || '',
                title: jobCard.querySelector('.job-title')?.textContent?.trim() || '',
                company: jobCard.querySelector('.company-name')?.textContent?.trim() || ''
            });
        }

        // Track filter changes
        if (e.target.matches('select.filter, input.filter')) {
            FeedbackTracker.track('filter_change', {
                element: e.target.className,
                value: e.target.value
            });
        }
    });

    // Auto-track form submissions
    document.addEventListener('submit', function(e) {
        FeedbackTracker.track('form_submit', {
            formId: e.target.id || 'unknown',
            action: e.target.action || ''
        });
    });

    // Provide a simple way to get feedback stats
    window.FeedbackStats = {
        getJobClicks: function() {
            const feedback = FeedbackTracker.getAll();
            return feedback.filter(f => f.action === 'job_card_click').length;
        },
        getFilterChanges: function() {
            const feedback = FeedbackTracker.getAll();
            return feedback.filter(f => f.action === 'filter_change').length;
        }
    };

})();