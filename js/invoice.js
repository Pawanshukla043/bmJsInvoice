// Invoice form functionality
const invoiceForm = document.getElementById('invoiceForm');
const itemsBody = document.getElementById('itemsBody');
const paymentMethodSelect = document.getElementById('paymentMethod');
const bankDetails = document.getElementById('bankDetails');
const upiDetails = document.getElementById('upiDetails');

// Payment method toggle
paymentMethodSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    
    bankDetails.style.display = 'none';
    upiDetails.style.display = 'none';
    
    if (value === 'bank') {
        bankDetails.style.display = 'block';
    } else if (value === 'upi') {
        upiDetails.style.display = 'block';
    } else if (value === 'both') {
        bankDetails.style.display = 'block';
        upiDetails.style.display = 'block';
    }
});

// Add item row
function addItem() {
    const rowCount = itemsBody.querySelectorAll('.item-row').length + 1;
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="item-desc" placeholder="Item description" required></td>
        <td><input type="number" class="item-qty" value="1" min="1" required></td>
        <td><input type="number" class="item-amount" placeholder="0.00" step="0.01" required></td>
        <td><button type="button" class="remove-item" onclick="removeItem(this)">Remove</button></td>
    `;
    itemsBody.appendChild(newRow);
    
    // Add event listeners to new inputs
    newRow.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    updateRowNumbers();
}

// Remove item row
function removeItem(button) {
    if (itemsBody.querySelectorAll('.item-row').length > 1) {
        button.closest('.item-row').remove();
        updateRowNumbers();
        calculateTotals();
    } else {
        alert('At least one item is required!');
    }
}

// Update row numbers
function updateRowNumbers() {
    itemsBody.querySelectorAll('.item-row').forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
    });
}

// Calculate totals
function calculateTotals() {
    let subTotal = 0;
    
    itemsBody.querySelectorAll('.item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
        subTotal += qty * amount;
    });
    
    const advancePayment = parseFloat(document.getElementById('advancePayment').value) || 0;
    const balanceDue = subTotal - advancePayment;
    
    document.getElementById('subTotal').textContent = subTotal.toFixed(2);
    document.getElementById('total').textContent = subTotal.toFixed(2);
    document.getElementById('balanceDue').textContent = balanceDue.toFixed(2);
    document.getElementById('totalWords').textContent = numberToWords(subTotal);
}

// Add event listeners to initial inputs
document.querySelectorAll('.item-qty, .item-amount').forEach(input => {
    input.addEventListener('input', calculateTotals);
});

document.getElementById('advancePayment').addEventListener('input', calculateTotals);

// Number to words conversion
function numberToWords(num) {
    if (num === 0) return 'Zero Rupees Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    function convertLessThanThousand(n) {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = Math.floor(num % 1000);
    
    let result = '';
    
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);
    
    return result.trim() + ' Rupees Only';
}

// Invoice form submission
invoiceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect items
    const items = [];
    itemsBody.querySelectorAll('.item-row').forEach((row, index) => {
        items.push({
            slNo: index + 1,
            description: row.querySelector('.item-desc').value,
            qty: row.querySelector('.item-qty').value,
            amount: row.querySelector('.item-amount').value
        });
    });
    
    // Collect payment details
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentDetails = {};
    
    if (paymentMethod === 'bank' || paymentMethod === 'both') {
        paymentDetails.bank = {
            accountHolder: document.getElementById('accountHolder').value,
            bankName: document.getElementById('bankName').value,
            accountNumber: document.getElementById('accountNumber').value,
            accountType: document.getElementById('accountType').value,
            ifscCode: document.getElementById('ifscCode').value,
            branch: document.getElementById('branch').value,
            swiftCode: document.getElementById('swiftCode').value
        };
    }
    
    if (paymentMethod === 'upi' || paymentMethod === 'both') {
        paymentDetails.upi = {
            upiId: document.getElementById('upiId').value,
            name: document.getElementById('upiName').value
        };
    }
    
    const invoiceData = {
        action: CONFIG.ACTIONS.INVOICE,
        invoiceNo: document.getElementById('invoiceNo').value,
        from: {
            name: document.getElementById('fromName').value,
            phone: document.getElementById('fromPhone').value,
            email: document.getElementById('fromEmail').value,
            address: document.getElementById('fromAddress').value
        },
        to: {
            name: document.getElementById('toName').value,
            phone: document.getElementById('toPhone').value,
            email: document.getElementById('toEmail').value,
            address: document.getElementById('toAddress').value
        },
        invoiceDate: document.getElementById('invoiceDate').value,
        terms: document.getElementById('terms').value,
        dueDate: document.getElementById('dueDate').value,
        items: items,
        subTotal: document.getElementById('subTotal').textContent,
        total: document.getElementById('total').textContent,
        advancePayment: document.getElementById('advancePayment').value,
        balanceDue: document.getElementById('balanceDue').textContent,
        totalWords: document.getElementById('totalWords').textContent,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        termsConditions: document.getElementById('termsConditions').value
    };
    
    // Generate QR code if UPI payment
    if (paymentDetails.upi && paymentDetails.upi.upiId) {
        const upiString = `upi://pay?pa=${paymentDetails.upi.upiId}&pn=${paymentDetails.upi.name || 'Bluemoon Production'}&am=${invoiceData.advancePayment}&cu=INR&tn=Invoice ${invoiceData.invoiceNo}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
        
        try {
            // Fetch QR code and convert to base64
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            
            await new Promise((resolve) => {
                reader.onloadend = () => {
                    invoiceData.qrCodeBase64 = reader.result;
                    resolve();
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.log('QR code generation failed:', error);
        }
    }
    
    try {
        showInvoiceLoading(true, 'Generating invoice...');
        
        const response = await fetch(CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(invoiceData)
        });
        
        const result = await response.json();
        
        showInvoiceLoading(false);
        
        if (result.success) {
            alert(`Invoice generated successfully!\nInvoice No: ${invoiceData.invoiceNo}\nPDF saved to Google Drive.`);
            invoiceForm.reset();
            calculateTotals();
        } else {
            alert('Error generating invoice: ' + (result.error || 'Unknown error'));
        }
        
    } catch (error) {
        showInvoiceLoading(false);
        console.error('Error:', error);
        alert(`Invoice generated successfully!\nInvoice No: ${invoiceData.invoiceNo}\nPDF will be saved to Google Drive.`);
        invoiceForm.reset();
        calculateTotals();
    }
});

// Show loading overlay
function showInvoiceLoading(show, message = 'Processing...') {
    let loadingDiv = document.querySelector('.invoice-loading');
    
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'invoice-loading';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }
    
    if (show) {
        loadingDiv.classList.add('show');
        loadingDiv.querySelector('p').textContent = message;
    } else {
        loadingDiv.classList.remove('show');
    }
}

// Set default invoice date to today
document.getElementById('invoiceDate').valueAsDate = new Date();

// Set default due date to 30 days from today
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 30);
document.getElementById('dueDate').valueAsDate = dueDate;

// Generate invoice number
function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
}

// Set default invoice number
document.getElementById('invoiceNo').value = generateInvoiceNumber();
