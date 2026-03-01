// Google Apps Script Configuration
const CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyBAnsBTdJ3idLaCJViwqRXVa9zeDU410U4q4L9e-cE03q_pzTsJzPB9v5gYWsOb905/exec',
    
    // Sheet names (must match your Google Sheets)
    SHEETS: {
        CONTACT: 'ContactForm',
        SIGNUP: 'SignupData',
        INVOICE: 'InvoiceData'
    },
    
    // Actions for Google Apps Script
    ACTIONS: {
        CONTACT: 'submitContact',
        SIGNUP: 'submitSignup',
        LOGIN: 'checkLogin',
        INVOICE: 'generateInvoice'
    }
};
