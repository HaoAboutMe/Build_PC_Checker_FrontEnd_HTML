# BuildPC Checker - Frontend

## 📁 Cấu trúc dự án (Refactored)

```
buildpcchecker_frontend_html/
├── index.html              # Trang chính (Auth + My Info + Admin Panel)
├── index-new.html          # Phiên bản mới với component system
├── style.css               # Tất cả styles
├── main.js                 # Logic chính của ứng dụng
├── utils.js                # Utilities để load components
├── components/             # Thư mục chứa các components
│   ├── toast.html                    # Toast notification
│   ├── edit-my-info-modal.html       # Modal chỉnh sửa thông tin user
│   ├── change-password-modal.html    # Modal đổi mật khẩu
│   └── edit-user-modal.html          # Modal chỉnh sửa user (admin)
└── backend_description.md  # API documentation
```

## 🎯 Cải tiến

### Trước đây (index.html):
- ❌ Tất cả HTML trong 1 file (560 dòng)
- ❌ Khó maintain và debug
- ❌ Khó tái sử dụng components

### Bây giờ (index-new.html + components/):
- ✅ Tách components ra files riêng
- ✅ Dễ maintain và mở rộng
- ✅ Load components động khi cần
- ✅ Code sạch hơn, dễ đọc hơn

## 🚀 Cách sử dụng

### Phương án 1: Sử dụng file mới (Recommended)
```bash
# Đổi tên file cũ
mv index.html index-old.html

# Đổi tên file mới thành index.html
mv index-new.html index.html

# Chạy với Live Server hoặc web server
```

### Phương án 2: Giữ nguyên file cũ
```bash
# Mở index-new.html để test
# Nếu OK thì thay thế index.html
```

## 📦 Components

### 1. Toast Notification (`components/toast.html`)
- Hiển thị thông báo success/error/info
- Tự động ẩn sau 5 giây

### 2. Edit My Info Modal (`components/edit-my-info-modal.html`)
- Cho phép user chỉnh sửa thông tin cá nhân
- Không cho phép đổi email và roles

### 3. Change Password Modal (`components/change-password-modal.html`)
- Đổi mật khẩu riêng biệt
- Endpoint: `PUT /identity/users/me/change-password`

### 4. Edit User Modal (`components/edit-user-modal.html`)
- Chỉ admin mới thấy
- Cho phép chỉnh sửa tất cả thông tin kể cả email và roles

## 🔧 Component Loading System

File `utils.js` cung cấp:

```javascript
// Load 1 component
await loadComponent('components/toast.html', 'targetId');

// Load nhiều components
await loadComponents([
    { path: 'components/toast.html' },
    { path: 'components/edit-my-info-modal.html' }
]);

// Auto-load tất cả components khi DOM ready
initializeComponents();
```

## 🎨 Styling

Tất cả styles vẫn trong `style.css`:
- CSS Variables
- Responsive design
- Animations
- Modal styles
- Toast styles

## 📝 JavaScript

File `main.js` chứa:
- API calls
- Form validation
- Event handlers
- UI logic
- Error handling

## 🌐 API Endpoints

### User Endpoints:
- `POST /identity/users` - Đăng ký
- `POST /identity/auth/token` - Đăng nhập
- `POST /identity/auth/logout` - Đăng xuất
- `GET /identity/users/me` - Lấy thông tin user
- `PUT /identity/users/me` - Cập nhật thông tin
- `PUT /identity/users/me/change-password` - Đổi mật khẩu

### Admin Endpoints:
- `GET /identity/users` - Lấy tất cả users
- `PUT /identity/users/{userId}` - Cập nhật user (bao gồm roles)

## 🔐 Authentication

- JWT token lưu trong `localStorage`
- Auto-check auth khi load trang
- Admin detection: email === 'haoaboutme@gmail.com'

## 📱 Responsive

- Desktop: Full features
- Tablet: Adjusted layout
- Mobile: Stack layout

## 🎯 Next Steps

1. Test `index-new.html` với Live Server
2. Kiểm tra tất cả chức năng hoạt động
3. Nếu OK, thay thế `index.html` bằng `index-new.html`
4. Xóa `index-old.html` nếu không cần

## 🐛 Debugging

Nếu components không load:
1. Mở Console (F12)
2. Kiểm tra lỗi CORS (cần chạy qua web server)
3. Đảm bảo `utils.js` được load trước `main.js`

## 📚 Tài liệu

- API Documentation: `backend_description.md`
- Component Examples: Xem trong `components/`
