// ===================================
// API CONFIGURATION
// ===================================
const API_BASE_URL = "http://localhost:8080/identity";

// ===================================
// ERROR CODES MAPPING
// ===================================
const ERROR_MESSAGES = {
  1000: "Thành công",
  1001: "Key message không hợp lệ",
  1002: "Email đã tồn tại trong hệ thống",
  1003: "Username phải có ít nhất 3 ký tự",
  1004: "Mật khẩu phải có ít nhất 8 ký tự",
  1005: "Email không đúng định dạng",
  1006: "Người dùng không tồn tại",
  1007: "Chưa đăng nhập hoặc token không hợp lệ",
  1008: "Bạn không có quyền truy cập",
  1009: "Tuổi không đủ yêu cầu (tối thiểu 5 tuổi)",
  9999: "Lỗi không xác định",
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
  const errorElements = form.querySelectorAll(".error-message");
  errorElements.forEach((el) => (el.textContent = ""));
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  return username && username.length >= 3;
}

function validatePassword(password) {
  return password && password.length >= 8;
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function validateDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return false;
  const age = calculateAge(dateOfBirth);
  return age >= 5;
}

/**
 * FORM HANDLING
 */
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const registerBtn = document.getElementById("register-btn");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const firstname = document
        .getElementById("register-firstname")
        .value.trim();
      const lastname = document
        .getElementById("register-lastname")
        .value.trim();
      const username = document
        .getElementById("register-username")
        .value.trim();
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value;
      const dateOfBirth = document.getElementById("register-dob").value;

      let isValid = true;
      clearAllErrors("register-form");

      if (!firstname) {
        showError("register-firstname", "Vui lòng nhập tên");
        isValid = false;
      }
      if (!lastname) {
        showError("register-lastname", "Vui lòng nhập họ");
        isValid = false;
      }
      if (!username) {
        showError("register-username", "Vui lòng nhập tên người dùng");
        isValid = false;
      } else if (!validateUsername(username)) {
        showError("register-username", "Username phải có ít nhất 3 ký tự");
        isValid = false;
      }

      if (!email) {
        showError("register-email", "Vui lòng nhập email");
        isValid = false;
      } else if (!validateEmail(email)) {
        showError("register-email", "Email không đúng định dạng");
        isValid = false;
      }

      if (!password) {
        showError("register-password", "Vui lòng nhập mật khẩu");
        isValid = false;
      } else if (!validatePassword(password)) {
        showError("register-password", "Mật khẩu phải có ít nhất 8 ký tự");
        isValid = false;
      }

      if (!dateOfBirth) {
        showError("register-dob", "Vui lòng chọn ngày sinh");
        isValid = false;
      } else if (!validateDateOfBirth(dateOfBirth)) {
        showError("register-dob", "Bạn phải trên 5 tuổi");
        isValid = false;
      }

      if (!isValid) return;

      // Submit data
      registerBtn.disabled = true;
      registerBtn.textContent = "Đang xử lý...";

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            password: password,
            dateOfBirth: dateOfBirth,
          }),
        });

        const data = await response.json();

        if (data.code === 1000) {
          showToast(
            "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
            "success",
          );
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1000);
        } else {
          const message =
            ERROR_MESSAGES[data.code] || data.message || "Lỗi đăng ký";
          showToast(message, "error");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showToast(
          "Không thể kết nối đến server. Vui lòng thử lại sau.",
          "error",
        );
      } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "Đăng ký";
      }
    });
  }

  // Password Visibility Toggle
  const passwordToggle = document.querySelector(".password-toggle");
  const passwordInput = document.getElementById("register-password");
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
    });
  }
});
