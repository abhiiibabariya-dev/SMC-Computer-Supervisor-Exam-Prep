// ===== EMAILJS CONFIGURATION =====
// This file contains EmailJS credentials for sending email notifications.
// Replace the placeholder values below with your actual EmailJS credentials.
// Get credentials from: https://dashboard.emailjs.com

window.EMAILJS_CONFIG = {
    // Public key from EmailJS Account → API Keys
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY_HERE',

    // Service ID from EmailJS Email Services (e.g., Gmail, Outlook)
    SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID_HERE',

    // Template ID for customer receipt emails
    // Create template at EmailJS → Email Templates with variables:
    // to_email, name, order, plan, amount, key, txn, date
    TEMPLATE_CUSTOMER: 'YOUR_CUSTOMER_TEMPLATE_ID_HERE',

    // Template ID for admin notification emails
    // Create template at EmailJS → Email Templates with variables:
    // name, phone, email, order, plan, amount, key, txn, date, device
    TEMPLATE_ADMIN: 'YOUR_ADMIN_TEMPLATE_ID_HERE',

    // Admin email address for notifications
    ADMIN_EMAIL: 'abhibabariya007@gmail.com'
};

// Initialize EmailJS if configured
(function initEmailJS() {
    if (typeof window.emailjs !== 'undefined' &&
        window.EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE' &&
        window.EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID_HERE') {
        try {
            window.emailjs.init({ publicKey: window.EMAILJS_CONFIG.PUBLIC_KEY });
        } catch (e) {
            console.warn('EmailJS initialization failed:', e);
        }
    }
})();

// Helper to check if EmailJS is properly configured
window.isEmailJSConfigured = function() {
    return window.EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE' &&
           window.EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID_HERE' &&
           window.EMAILJS_CONFIG.TEMPLATE_CUSTOMER !== 'YOUR_CUSTOMER_TEMPLATE_ID_HERE' &&
           window.EMAILJS_CONFIG.TEMPLATE_ADMIN !== 'YOUR_ADMIN_TEMPLATE_ID_HERE';
};

// Send email via EmailJS (with fallback to mailto)
window.sendEmailJS = async function(templateId, params) {
    if (!window.isEmailJSConfigured()) {
        console.warn('EmailJS not configured, using mailto fallback');
        return { success: false, reason: 'not_configured' };
    }

    try {
        const response = await window.emailjs.send(
            window.EMAILJS_CONFIG.SERVICE_ID,
            templateId,
            params
        );
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS send failed:', error);
        return { success: false, error };
    }
};

// Send customer receipt email
window.sendCustomerReceipt = async function(receiptData) {
    const params = {
        to_email: receiptData.email,
        name: receiptData.name,
        order: receiptData.order,
        plan: receiptData.plan,
        amount: receiptData.amount,
        key: receiptData.key,
        txn: receiptData.txn,
        date: receiptData.date
    };
    return window.sendEmailJS(window.EMAILJS_CONFIG.TEMPLATE_CUSTOMER, params);
};

// Send admin notification email
window.sendAdminNotification = async function(receiptData, deviceId) {
    const params = {
        name: receiptData.name,
        phone: receiptData.phone || '',
        email: receiptData.email || '',
        order: receiptData.order,
        plan: receiptData.plan,
        amount: receiptData.amount,
        key: receiptData.key,
        txn: receiptData.txn,
        date: receiptData.date,
        device: deviceId || ''
    };
    return window.sendEmailJS(window.EMAILJS_CONFIG.TEMPLATE_ADMIN, params);
};