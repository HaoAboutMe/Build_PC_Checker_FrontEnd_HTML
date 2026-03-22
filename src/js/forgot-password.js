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
    1006: 'Email không tồn tại trong hệ thống',
    1014: 'Mã OTP sai hoặc hết hạn',
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
    const forgotForm = document.getElementById('forgot-password-form');
    const resetForm = document.getElementById('reset-password-form');
    
    const forgotBtn = document.getElementById('forgot-password-btn');
    const resetBtn = document.getElementById('reset-password-btn');
    
    const stepRequest = document.getElementById('step-request-otp');
    const stepReset = document.getElementById('step-reset-password');
    
    let currentEmail = '';

    // STEP 1: Request OTP
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('forgot-email').value.trim();
            currentEmail = email;

            if (!email || !validateEmail(email)) {
                showError('forgot-email', 'Email không hợp lệ');
                return;
            }

            clearAllErrors('forgot-password-form');
            forgotBtn.disabled = true;
            forgotBtn.textContent = 'Đang gửi...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.code === 1000) {
                    alert('Mã OTP đã được gửi đến email của bạn!');
                    stepRequest.style.display = 'none';
                    stepReset.style.display = 'block';
                } else {
                    const message = ERROR_MESSAGES[data.code] || data.message || 'Lỗi gửi OTP';
                    alert(message);
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                alert('Không thể kết nối đến server.');
            } finally {
                forgotBtn.disabled = false;
                forgotBtn.textContent = 'Gửi mã OTP';
            }
        });
    }

    // STEP 2: Reset Password
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const otp = document.getElementById('reset-otp').value.trim();
            const newPassword = document.getElementById('new-password').value;

            let isValid = true;
            clearAllErrors('reset-password-form');

            if (!otp) { showError('reset-otp', 'Vui lòng nhập mã OTP'); isValid = false; }
            if (!newPassword || newPassword.length < 8) { 
                showError('new-password', 'Mật khẩu phải ít nhất 8 ký tự'); 
                isValid = false; 
            }

            if (!isValid) return;

            resetBtn.disabled = true;
            resetBtn.textContent = 'Đang cập nhật...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: currentEmail,
                        otp: otp,
                        newPassword: newPassword
                    })
                });

                const data = await response.json();

                if (data.code === 1000) {
                    alert('Đổi mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
                    window.location.href = 'login.html';
                } else {
                    const message = ERROR_MESSAGES[data.code] || data.message || 'Lỗi đặt lại mật khẩu';
                    alert(message);
                }
            } catch (error) {
                console.error('Reset password error:', error);
                alert('Không thể kết nối đến server.');
            } finally {
                resetBtn.disabled = false;
                resetBtn.textContent = 'Cập nhật mật khẩu';
            }
        });
    }
});
