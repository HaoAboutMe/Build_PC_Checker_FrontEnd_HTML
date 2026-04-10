// toast.js
// Handles displaying custom toast notifications in top-right corner

const createToastContainer = () => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
};

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - milliseconds before disappearing (default 4000)
 */
function showToast(message, type = 'success', duration = 4000) {
    const container = createToastContainer();
    
    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon (Success or Error)
    const iconSvg = type === 'success' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    toast.innerHTML = `
        <div class="toast-icon">
            ${iconSvg}
        </div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove logic
    const removeToast = () => {
        toast.style.animation = 'none'; // reset to avoid conflict
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };

    // Manual close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast();
    });

    // Auto-timeout
    setTimeout(() => {
        removeToast();
    }, duration);
}

// Attach to window so it's globally available
window.showToast = showToast;
