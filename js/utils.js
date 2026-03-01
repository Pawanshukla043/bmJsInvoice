// Custom Alert and Confirm Functions
function customAlert(message, title = 'Notification', icon = '✓') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-header">
                    <div class="custom-modal-icon">${icon}</div>
                    <h2 class="custom-modal-title">${title}</h2>
                </div>
                <div class="custom-modal-body">
                    <p class="custom-modal-message">${message}</p>
                </div>
                <div class="custom-modal-footer">
                    <button class="custom-modal-btn custom-modal-btn-primary" onclick="this.closest('.custom-modal').remove()">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('.custom-modal-btn').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
    });
}

function customConfirm(message, title = 'Confirm', icon = '❓') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-header">
                    <div class="custom-modal-icon">${icon}</div>
                    <h2 class="custom-modal-title">${title}</h2>
                </div>
                <div class="custom-modal-body">
                    <p class="custom-modal-message">${message}</p>
                </div>
                <div class="custom-modal-footer">
                    <button class="custom-modal-btn custom-modal-btn-secondary cancel-btn">Cancel</button>
                    <button class="custom-modal-btn custom-modal-btn-primary confirm-btn">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}
