# BuildPC Checker - Frontend Authentication

Giao diện đăng ký và đăng nhập cho hệ thống BuildPC Checker, được xây dựng bằng HTML, CSS, JavaScript thuần (vanilla).

## 🎨 Tính năng

### ✅ Chức năng chính
- **Đăng ký tài khoản mới** với validation đầy đủ
- **Đăng nhập** với email và mật khẩu
- **Hiển thị thông tin cá nhân** sau khi đăng nhập
- **Đăng xuất** an toàn
- **Toggle giữa form đăng ký/đăng nhập** không reload page

### 🎯 Validation Client-side
- Username: Tối thiểu 3 ký tự
- Email: Đúng format email
- Password: Tối thiểu 8 ký tự
- Tuổi: Tối thiểu 5 tuổi
- Hiển thị lỗi rõ ràng dưới từng input

### 🎨 Thiết kế
- **Modern UI** với gradient và glassmorphism
- **Smooth animations** và transitions
- **Responsive design** cho mọi thiết bị
- **Toast notifications** cho feedback người dùng
- **Loading states** khi gọi API

## 📋 Cấu trúc File

```
buildpcchecker_frontend_html/
├── index.html          # Cấu trúc HTML
├── style.css           # Styling với animations
├── main.js             # Logic xử lý
└── README.md           # Tài liệu này
```

## 🚀 Cách sử dụng

### 1. Yêu cầu
- Backend API đang chạy tại `http://localhost:8080/identity`
- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Live Server hoặc web server đơn giản

### 2. Chạy ứng dụng

#### Sử dụng Live Server (VS Code)
1. Cài đặt extension "Live Server" trong VS Code
2. Click chuột phải vào `index.html`
3. Chọn "Open with Live Server"
4. Ứng dụng sẽ mở tại `http://localhost:5500` (hoặc port khác)

#### Sử dụng Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Mở trình duyệt tại http://localhost:8000
```

#### Sử dụng Node.js HTTP Server
```bash
# Cài đặt http-server (nếu chưa có)
npm install -g http-server

# Chạy server
http-server -p 8000

# Mở trình duyệt tại http://localhost:8000
```

### 3. Sử dụng ứng dụng

#### Đăng ký tài khoản mới
1. Click tab "Đăng ký"
2. Điền đầy đủ thông tin:
   - Họ và Tên
   - Username (tối thiểu 3 ký tự)
   - Email (đúng format)
   - Mật khẩu (tối thiểu 8 ký tự)
   - Ngày sinh (tối thiểu 5 tuổi)
3. Click "Đăng ký"
4. Sau khi thành công, tự động chuyển sang form đăng nhập

#### Đăng nhập
1. Click tab "Đăng nhập" (hoặc đã ở tab này)
2. Nhập Email và Mật khẩu
3. Click "Đăng nhập"
4. Sau khi thành công, hiển thị trang thông tin cá nhân

#### Xem thông tin cá nhân
Sau khi đăng nhập thành công, bạn sẽ thấy:
- Avatar với initials
- Họ tên đầy đủ
- Username
- Email
- Ngày sinh (format DD/MM/YYYY)
- Vai trò (roles)
- Thống kê (placeholder)

#### Đăng xuất
1. Click nút "Đăng xuất" ở góc trên bên phải
2. Token sẽ bị xóa khỏi localStorage
3. Quay lại trang đăng nhập

## 🔧 API Integration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:8080/identity';
```

### Endpoints được sử dụng

#### 1. Đăng ký
```
POST /identity/users
Body: {
  username, firstname, lastname, 
  email, password, dateOfBirth
}
```

#### 2. Đăng nhập
```
POST /identity/auth/token
Body: { email, password }
Response: { token, authenticated }
```

#### 3. Lấy thông tin user
```
GET /identity/users/me
Headers: { Authorization: Bearer <token> }
```

#### 4. Đăng xuất
```
POST /identity/auth/logout
Body: { token }
```

## 🐛 Xử lý lỗi

Ứng dụng xử lý đầy đủ các mã lỗi từ backend:

| Code | Mô tả | Xử lý |
|------|-------|-------|
| 1000 | Thành công | Hiển thị toast success |
| 1002 | Email đã tồn tại | Hiển thị lỗi dưới input email |
| 1003 | Username quá ngắn | Hiển thị lỗi dưới input username |
| 1004 | Password quá ngắn | Hiển thị lỗi dưới input password |
| 1005 | Email không hợp lệ | Hiển thị lỗi dưới input email |
| 1006 | User không tồn tại | Hiển thị lỗi đăng nhập |
| 1007 | Token không hợp lệ | Redirect về login |
| 1009 | Tuổi không đủ | Hiển thị lỗi dưới input ngày sinh |

## 💾 LocalStorage

Ứng dụng sử dụng localStorage để lưu:
- `token`: JWT token sau khi đăng nhập thành công

## 🎨 Customization

### Thay đổi màu sắc
Chỉnh sửa CSS variables trong `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... */
}
```

### Thay đổi API URL
Chỉnh sửa trong `main.js`:
```javascript
const API_BASE_URL = 'http://your-api-url.com/identity';
```

## 📱 Responsive Design

Ứng dụng hoạt động tốt trên:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (320px - 768px)

## 🔒 Bảo mật

- Mật khẩu không được lưu trong localStorage
- Token được lưu an toàn và tự động xóa khi đăng xuất
- Validation đầy đủ ở cả client và server
- HTTPS nên được sử dụng trong production

## 🚧 Lưu ý

1. **CORS**: Đảm bảo backend đã cấu hình CORS cho phép frontend truy cập
2. **Token Expiration**: Token có thời hạn 5 phút, cần refresh hoặc đăng nhập lại
3. **Network**: Kiểm tra backend đang chạy trước khi test frontend

## 📝 TODO / Future Enhancements

- [ ] Thêm chức năng "Quên mật khẩu"
- [ ] Thêm chức năng "Nhớ đăng nhập"
- [ ] Thêm chức năng refresh token tự động
- [ ] Thêm chức năng cập nhật thông tin cá nhân
- [ ] Thêm chức năng đổi mật khẩu
- [ ] Thêm chức năng upload avatar
- [ ] Tích hợp với các tính năng quản lý PC

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

## 👨‍💻 Developer

Developed by Senior Frontend Developer
- Modern design with glassmorphism
- Smooth animations and transitions
- Full validation and error handling
- Clean, maintainable code structure
"# Build_PC_Checker_FrontEnd_HTML" 
