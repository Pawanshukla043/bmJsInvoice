// Google Apps Script Code
// Deploy this as a Web App with "Anyone" access

// CONFIGURATION - Update these IDs with your actual Google Sheets and Drive folder IDs
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Google Sheets ID
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID_HERE'; // Replace with your Google Drive folder ID

// Sheet names
const SHEETS = {
  CONTACT: 'ContactForm',
  SIGNUP: 'SignupData',
  INVOICE: 'InvoiceData'
};

// Main function to handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch(action) {
      case 'submitContact':
        result = handleContactForm(data);
        break;
      case 'submitSignup':
        result = handleSignup(data);
        break;
      case 'checkLogin':
        result = handleLogin(data);
        break;
      case 'generateInvoice':
        result = handleInvoice(data);
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput('Bluemoon Production API is running!');
}

// Handle Contact Form Submission
function handleContactForm(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.CONTACT);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.CONTACT);
      sheet.appendRow(['Timestamp', 'Name', 'Stage Name', 'Instagram', 'Email', 'Phone', 'Message']);
    }
    
    sheet.appendRow([
      new Date(),
      data.name,
      data.stageName || '',
      data.instagram || '',
      data.email,
      data.phone,
      data.message
    ]);
    
    return { success: true, message: 'Contact form submitted successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Handle Signup
function handleSignup(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.SIGNUP);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.SIGNUP);
      sheet.appendRow(['Timestamp', 'Full Name', 'Stage Name', 'Email', 'Phone', 'Password']);
    }
    
    // Check if email already exists
    const dataRange = sheet.getDataRange().getValues();
    for (let i = 1; i < dataRange.length; i++) {
      if (dataRange[i][3] === data.email) {
        return { success: false, error: 'Email already registered' };
      }
    }
    
    sheet.appendRow([
      new Date(),
      data.fullName,
      data.stageName || '',
      data.email,
      data.phone,
      data.password // In production, hash this password
    ]);
    
    return { success: true, message: 'Signup successful' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Handle Login
function handleLogin(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.SIGNUP);
    
    if (!sheet) {
      return { success: false, error: 'No users registered yet' };
    }
    
    const dataRange = sheet.getDataRange().getValues();
    
    // Check credentials (skip header row)
    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      if (row[3] === data.email && row[5] === data.password) {
        return {
          success: true,
          user: {
            fullName: row[1],
            stageName: row[2],
            email: row[3],
            phone: row[4]
          }
        };
      }
    }
    
    return { success: false, error: 'Invalid email or password' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Handle Invoice Generation
function handleInvoice(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.INVOICE);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.INVOICE);
      sheet.appendRow(['Timestamp', 'Invoice No', 'Customer Name', 'Contact No', 'Date', 'Advance Amount', 'Total Amount']);
    }
    
    // Save invoice data to sheet
    sheet.appendRow([
      new Date(),
      data.invoiceNo,
      data.to.name,
      data.to.phone,
      data.invoiceDate,
      data.advancePayment,
      data.total
    ]);
    
    // Generate PDF
    const pdfBlob = generateInvoicePDF(data);
    
    // Save to Google Drive
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const file = folder.createFile(pdfBlob);
    
    return {
      success: true,
      message: 'Invoice generated successfully',
      invoiceNo: data.invoiceNo,
      fileId: file.getId(),
      fileUrl: file.getUrl()
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Generate Invoice PDF using HTML Service
function generateInvoicePDF(data) {
  const html = generateInvoiceHTML(data);
  
  // Create PDF from HTML
  const blob = Utilities.newBlob(html, 'text/html', 'invoice.html')
    .getAs('application/pdf')
    .setName('Invoice_' + data.invoiceNo + '.pdf');
  
  return blob;
}

// Generate Invoice HTML
function generateInvoiceHTML(data) {
  let itemsHTML = '';
  let itemTotal = 0;
  
  data.items.forEach(item => {
    const lineTotal = parseFloat(item.qty) * parseFloat(item.amount);
    itemTotal += lineTotal;
    itemsHTML += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.slNo}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.qty}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${parseFloat(item.amount).toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  });
  
  let paymentHTML = '';
  if (data.paymentDetails.bank) {
    const bank = data.paymentDetails.bank;
    paymentHTML += `
      <div style="margin-top: 20px;">
        <h3 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 5px;">Bank Details</h3>
        <p><strong>Account Holder:</strong> ${bank.accountHolder || 'N/A'}</p>
        <p><strong>Bank Name:</strong> ${bank.bankName || 'N/A'}</p>
        <p><strong>Account Number:</strong> ${bank.accountNumber || 'N/A'}</p>
        <p><strong>Account Type:</strong> ${bank.accountType || 'N/A'}</p>
        <p><strong>IFSC Code:</strong> ${bank.ifscCode || 'N/A'}</p>
        <p><strong>Branch:</strong> ${bank.branch || 'N/A'}</p>
        ${bank.swiftCode ? '<p><strong>SWIFT Code:</strong> ' + bank.swiftCode + '</p>' : ''}
      </div>
    `;
  }
  
  if (data.paymentDetails.upi) {
    const upi = data.paymentDetails.upi;
    paymentHTML += `
      <div style="margin-top: 20px;">
        <h3 style="color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 5px;">UPI Details</h3>
        <p><strong>UPI ID:</strong> ${upi.upiId || 'N/A'}</p>
        <p><strong>Name:</strong> ${upi.name || 'N/A'}</p>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #e94560; padding-bottom: 20px; }
        .header h1 { color: #1a1a2e; margin: 0; font-size: 32px; }
        .header h2 { color: #e94560; margin: 5px 0; font-size: 24px; }
        .invoice-info { margin: 20px 0; }
        .invoice-info p { margin: 5px 0; }
        .section { margin: 20px 0; }
        .section h3 { color: #1a1a2e; border-bottom: 2px solid #e94560; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #1a1a2e; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        .totals { text-align: right; margin: 20px 0; font-size: 14px; }
        .totals p { margin: 8px 0; }
        .total-amount { font-size: 18px; font-weight: bold; color: #e94560; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <h2>Bluemoon Production</h2>
      </div>
      
      <div class="invoice-info">
        <p><strong>Invoice No:</strong> ${data.invoiceNo}</p>
        <p><strong>Invoice Date:</strong> ${data.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${data.dueDate}</p>
        ${data.terms ? '<p><strong>Terms:</strong> ' + data.terms + '</p>' : ''}
      </div>
      
      <div class="section">
        <h3>From:</h3>
        <p><strong>${data.from.name}</strong></p>
        <p>Email: ${data.from.email}</p>
        <p>Phone: ${data.from.phone}</p>
        <p>Address: ${data.from.address}</p>
      </div>
      
      <div class="section">
        <h3>Bill To:</h3>
        <p><strong>${data.to.name}</strong></p>
        <p>Email: ${data.to.email}</p>
        <p>Phone: ${data.to.phone}</p>
        <p>Address: ${data.to.address}</p>
      </div>
      
      <div class="section">
        <h3>Items:</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Sl.No</th>
              <th>Description</th>
              <th style="width: 80px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Rate</th>
              <th style="width: 100px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      
      <div class="totals">
        <p><strong>Sub Total:</strong> ₹${data.subTotal}</p>
        <p><strong>Total:</strong> ₹${data.total}</p>
        <p><strong>Advance Payment:</strong> ₹${data.advancePayment}</p>
        <p class="total-amount"><strong>Balance Due:</strong> ₹${data.balanceDue}</p>
        <p style="font-style: italic; font-size: 12px;">${data.totalWords}</p>
      </div>
      
      ${paymentHTML}
      
      ${data.termsConditions ? `
        <div class="section">
          <h3>Terms & Conditions:</h3>
          <p>${data.termsConditions}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Bluemoon Production - Professional Music Production Services</p>
      </div>
    </body>
    </html>
  `;
}
