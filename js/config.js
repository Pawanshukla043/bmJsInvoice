// Google Apps Script Configuration
const CONFIG = {
    // Replace this with your actual Google Apps Script Web App URL
    // SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyROwV2Km5_-nYvzHOIg1NbGjXmOKpTB6PWK1Lo8UVnP_c2xX2vOf9DaGOmjD1Ab1Ue/exec',
    // SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx7Zmvdb7mEqyONpwuNKb0pi5-yDtBpNZrf-ujMoz5OjWQDz77-UnREbgY22ZdPmUrj/exec',
    // SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzrmanF7YFuYbrVoDouQICg9d7HB3tETHL3a5CgoxwOhbcwYAsPQms1bcNjF5zjEBSk/exec',
    // SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwby2lLTehlcIEqOome0amT2oIfh5WmrpF7aljKSLDHK_O1sPTOcVLlIKbcqN27yK_J/exec',
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz_KN436XUFQ760rmsv2z12lyPGZU2QLx0GnAXmc7iZJFn1Ut2LHF08hWtfluaAhG8/exec',
    
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
