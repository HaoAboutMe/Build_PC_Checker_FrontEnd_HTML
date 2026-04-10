// ===================================
// API CONFIGURATION
// ===================================
const API_BASE_URL = 'http://localhost:8080/identity';

// ===================================
// ERROR CODES MAPPING
// ===================================
const ERROR_MESSAGES = {
    1000: 'Thành công',
    1001: 'Key message không hợp lệ',
    1002: 'Email đã tồn tại trong hệ thống',
    1004: 'Mật khẩu phải có ít nhất 8 ký tự',
    1005: 'Email không đúng định dạng',
    1006: 'Người dùng không tồn tại',
    1007: 'Chưa đăng nhập hoặc token không hợp lệ',
    1008: 'Bạn không có quyền truy cập',
    1015: 'Mật khẩu không chính xác', // Adding potential error code for wrong password
    9999: 'Lỗi không xác định'
};

/**
 * UTILITY FUNCTIONS
 */
function showError(inputId, message) {
    const errorElement = document.getElementById(`${inputId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * FORM HANDLING
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            let isValid = true;
            clearAllErrors('login-form');

            if (!email) { 
                showError('login-email', 'Vui lòng nhập email'); 
                isValid = false; 
            } else if (!validateEmail(email)) { 
                showError('login-email', 'Email không đúng định dạng'); 
                isValid = false; 
            }
            
            if (!password) { 
                showError('login-password', 'Vui lòng nhập mật khẩu'); 
                isValid = false; 
            }

            if (!isValid) return;

            // Submit data
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang xử lý...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.code === 1000 && data.result.token) {
                    // Save token
                    localStorage.setItem('token', data.result.token);
                    
                    showToast('Đăng nhập thành công!', 'success');
                    // Redirect to home or dashboard after a short delay to let toast show
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 500);
                } else {
                    const message = ERROR_MESSAGES[data.code] || data.message || 'Email hoặc mật khẩu không chính xác';
                    showToast(message, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('Không thể kết nối đến server. Vui lòng thử lại sau.', 'error');
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Đăng nhập';
            }
        });
    }

    // Password Visibility Toggle
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('login-password');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Optional: toggle icon class/src here if you had separate icons
        });
    }
});
