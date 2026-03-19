# API Documentation - Build PC Checker

## 1. Giới thiệu

Tài liệu này mô tả chi tiết toàn bộ các Endpoint, Request, Response, Error Code và cơ chế xử lý lỗi của hệ thống **Build PC Checker**.
Hệ thống được xây dựng trên nền tảng **Java Spring Boot**, sử dụng **JWT Authentication** và tuân thủ chuẩn RESTful API.

---

## 2. Cấu trúc Response Chung

Mọi API (trừ trường hợp lỗi nghiêm trọng của server chưa được handle) đều trả về định dạng JSON chuẩn `ApiResponse<T>` như sau:

```json
{
  "code": 1000,
  "message": "Thành công",
  "result": { ... } // Dữ liệu trả về (Object hoặc Array)
}
```

- **code**: Mã lỗi nghiệp vụ (xem phần Error Codes). `1000` là thành công.
- **message**: Thông báo chi tiết hoặc mô tả lỗi.
- **result**: Payload dữ liệu thực tế (có thể null nếu không có dữ liệu trả về).

---

## 3. Global Exception Handling

Hệ thống sử dụng `GlobalExceptionHandler` để bắt các ngoại lệ và chuyển đổi thành format chung.

### Cơ chế xử lý

1. **AppException**: Các lỗi nghiệp vụ được định nghĩa trước (ví dụ: User not found, Invalid password).
   - Trả về HTTP Status tương ứng (400, 401, 403, 404...).
   - `code` và `message` lấy từ Enum `ErrorCode`.

2. **MethodArgumentNotValidException**: Lỗi validate dữ liệu đầu vào (Annotation `@Valid`).
   - `code`: Mapping từ message của annotation (ví dụ `@Size(message="USERNAME_INVALID")` -> Code `1003`).
   - `message`: Message mặc định hoặc được replace tham số (ví dụ: "Username must be at least 3 characters").

3. **DataIntegrityViolationException**: Lỗi liên quan đến DB (Foreign Key, Unique Constraint).
   - Hệ thống tự động phân tích message lỗi từ Driver để map sang `ErrorCode` tương ứng (ví dụ: duplicate entry, referenced foreign key).

4. **AccessDeniedException**: Lỗi quyền truy cập.
   - Trả về lỗi `UNAUTHORIZED` (Code `1008`).

5. **RuntimeException**: Các lỗi không xác định khác.
   - Trả về `UNCATEGORIZED_EXCEPTION` (Code `9999`) và HTTP 500.

---

## 4. Danh sách Error Codes (ErrorCode.java)

| Code                        | Message Key                   | HTTP Status | Mô tả                                         |
| :-------------------------- | :---------------------------- | :---------- | :-------------------------------------------- |
| **Hệ thống & Auth**         |                               |             |                                               |
| 9999                        | UNCATEGORIZED_EXCEPTION       | 500         | Lỗi hệ thống chưa được phân loại              |
| 1001                        | INVALID_KEY                   | 400         | Key message không hợp lệ                      |
| 1002                        | USER_EXISTED                  | 400         | Người dùng đã tồn tại                         |
| 1003                        | USERNAME_INVALID              | 400         | Username không hợp lệ (min length)            |
| 1004                        | PASSWORD_INVALID              | 400         | Password không hợp lệ (min length)            |
| 1005                        | EMAIL_INVALID                 | 400         | Email không đúng định dạng                    |
| 1006                        | USER_NOT_EXISTED              | 404         | Người dùng không tồn tại                      |
| 1007                        | UNAUTHENTICATED               | 401         | Chưa đăng nhập hoặc token hết hạn             |
| 1008                        | UNAUTHORIZED                  | 403         | Không có quyền truy cập                       |
| 1009                        | INVALID_DATE_OF_BIRTH         | 400         | Ngày sinh/Tuổi không hợp lệ                   |
| 1010                        | INVALID_VERIFICATION_TOKEN    | 400         | Token xác thực email sai/hết hạn              |
| 1011                        | EMAIL_NOT_VERIFIED            | 403         | Email chưa được xác thực                      |
| 1012                        | EMAIL_ALREADY_VERIFIED        | 400         | Email đã xác thực trước đó                    |
| 1013                        | ACCOUNT_DISABLED              | 403         | Tài khoản bị vô hiệu hóa                      |
| 1014                        | INVALID_OTP                   | 400         | Mã OTP sai hoặc hết hạn                       |
| **CPU (20xx)**              |                               |             |                                               |
| 2007                        | CPU_NOT_FOUND                 | 404         | Không tìm thấy CPU                            |
| 2008                        | CPU_NAME_ALREADY_EXISTS       | 400         | Tên CPU đã tồn tại                            |
| ...                         | (Các lỗi validate field CPU)  | 400         | Thiếu trường dữ liệu bắt buộc                 |
| **Mainboard (21xx)**        |                               |             |                                               |
| 2111                        | MAINBOARD_NOT_FOUND           | 404         | Không tìm thấy Mainboard                      |
| 2112                        | MAINBOARD_NAME_ALREADY_EXISTS | 400         | Tên Mainboard đã tồn tại                      |
| ...                         | (Các lỗi validate field)      | 400         | Thiếu trường dữ liệu bắt buộc                 |
| **RAM (22xx)**              |                               |             |                                               |
| 2208                        | RAM_NOT_FOUND                 | 404         | Không tìm thấy RAM                            |
| 2209                        | RAM_NAME_ALREADY_EXISTS       | 400         | Tên RAM đã tồn tại                            |
| ...                         | (Các lỗi validate field)      | 400         | Thiếu trường dữ liệu bắt buộc                 |
| **VGA (23xx)**              |                               |             |                                               |
| 2306                        | VGA_NOT_FOUND                 | 404         | Không tìm thấy VGA                            |
| 2307                        | VGA_NAME_ALREADY_EXISTS       | 400         | Tên VGA đã tồn tại                            |
| ...                         | (Các lỗi validate field)      | 400         | Thiếu trường dữ liệu bắt buộc                 |
| **Linh kiện khác**          |                               |             |                                               |
| 24xx                        | Socket Errors                 | 400/404     | Lỗi liên quan đến Socket                      |
| 25xx                        | RamType Errors                | 400/404     | Lỗi liên quan đến RamType                     |
| 26xx                        | PCIe Version Errors           | 400/404     | Lỗi liên quan đến PCIe Version                |
| 27xx                        | SSD Errors                    | 400/404     | Lỗi liên quan đến SSD & SSD Type              |
| 28xx                        | HDD Errors                    | 400/404     | Lỗi liên quan đến HDD & Interface             |
| 29xx                        | PSU Errors                    | 400/404     | Lỗi liên quan đến PSU & Connectors            |
| 30xx                        | Case Errors                   | 400/404     | Lỗi liên quan đến PC Case                     |
| 31xx                        | Cooler/FormFactor Errors      | 400/404     | Lỗi liên quan tản nhiệt & Form Factor         |
| **Data Constraints (40xx)** |                               |             |                                               |
| 4001                        | SOCKET_IN_USE_BY_CPU          | 409         | Không thể xóa Socket đang được CPU dùng       |
| 4002                        | SOCKET_IN_USE_BY_MAINBOARD    | 409         | Không thể xóa Socket đang được Mainboard dùng |
| 4099                        | FOREIGN_KEY_VIOLATION         | 409         | Lỗi ràng buộc khóa ngoại chung                |
| **PC Build (50xx)**         |                               |             |                                               |
| 5001                        | BUILD_NAME_REQUIRED           | 400         | Tên cấu hình là bắt buộc                      |
| 5002                        | BUILD_NOT_FOUND               | 404         | Không tìm thấy cấu hình                       |
| 5003                        | BUILD_UNAUTHORIZED_ACCESS     | 403         | Không có quyền truy cập cấu hình này          |
| 5005                        | BUILD_INCOMPATIBLE            | 400         | Cấu hình không tương thích                    |
| **Build Analysis (60xx)**   |                               |             |                                               |
| 6001                        | CPU_ID_REQUIRED               | 400         | Thiếu CPU ID khi phân tích                    |
| 6002                        | GPU_ID_REQUIRED               | 400         | Thiếu GPU ID khi phân tích                    |
| 61xx                        | File Storage Errors           | 400/500     | Lỗi liên quan upload file                     |

---

## 5. Chi tiết Endpoints

### 5.1 Authentication (`/auth`)

#### 1. Đăng nhập (Get Token)

- **Method**: `POST`
- **URL**: `/auth/token`
- **Body**:
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```
- **Response**: `AuthenticationResponse` (token, authenticated boolean).

#### 2. Introspect Token (Kiểm tra token)

- **Method**: `POST`
- **URL**: `/auth/introspect`
- **Body**: `{ "token": "ey..." }`
- **Response**: `{ "valid": true }`

#### 3. Refresh Token

- **Method**: `POST`
- **URL**: `/auth/refresh`
- **Body**: `{ "token": "ey..." }`
- **Response**: `AuthenticationResponse` (token mới).

#### 4. Logout

- **Method**: `POST`
- **URL**: `/auth/logout`
- **Body**: `{ "token": "ey..." }`

#### 5. Verify Email

- **Method**: `GET`
- **URL**: `/auth/verify-email?token=...`
- **Response**: HTML Page (Thành công/Thất bại).

#### 6. Resend Verification

- **Method**: `POST`
- **URL**: `/auth/resend-verification?email=...`

#### 7. Forgot Password & Reset

- **Forgot**: `POST /auth/forgot-password` (Body: `{ "email": "..." }`) -> Gửi OTP.
- **Reset**: `POST /auth/reset-password` (Body: `{ "email": "...", "otp": "...", "newPassword": "..." }`).

---

### 5.2 User Management (`/users`)

#### 1. Register User

- **Method**: `POST`
- **URL**: `/users`
- **Body**:
  ```json
  {
    "username": "nguyenvana",
    "password": "password123",
    "email": "a@example.com",
    "firstname": "Nguyen",
    "lastname": "Van A",
    "dateOfBirth": "2000-01-01"
  }
  ```

#### 2. Get Me (Info của user đang login)

- **Method**: `GET`
- **URL**: `/users/me`
- **Header**: `Authorization: Bearer <token>`
- **Response**: `UserResponse` (id, username, email, roles...).

#### 3. Update Me

- **Method**: `PUT`
- **URL**: `/users/me`
- **Body**: `MyInfoUpdateRequest` (các trường thông tin cá nhân).

#### 4. Change Password

- **Method**: `PUT`
- **URL**: `/users/me/change-password`
- **Body**:
  ```json
  { "oldPassword": "...", "newPassword": "...", "confirmationPassword": "..." }
  ```

#### 5. Admin User Management (Role Admin)

- `GET /users`: List all users.
- `GET /users/{userId}`: Detail user.
- `PUT /users/{userId}`: Update user (Admin update).
- `DELETE /users/{userId}`: Delete user.

---

### 5.3 PC Build & Compatibility (`/builds`)

Đây là chức năng cốt lõi của ứng dụng.

#### 1. Check Compatibility (Kiểm tra tương thích)

- **Method**: `POST`
- **URL**: `/builds/check-compatibility`
- **Mô tả**: Gửi danh sách ID các linh kiện đang chọn để kiểm tra xem chúng có khớp với nhau không.
- **Request Body** (`BuildCheckRequest`):
  ```json
  {
    "cpuId": "string-uuid",
    "mainboardId": "string-uuid",
    "ramId": "string-uuid",
    "vgaId": "string-uuid",
    "ssdIds": ["string-uuid"],
    "hddIds": ["string-uuid"],
    "psuId": "string-uuid",
    "caseId": "string-uuid",
    "coolerId": "string-uuid"
  }
  ```
- **Response** (`CompatibilityResult`):
  ```json
  {
    "code": 1000,
    "result": {
      "compatible": true, // True nếu không có lỗi nghiêm trọng
      "errors": [], // Danh sách lỗi bắt buộc phải sửa (ví dụ: Sai Socket)
      "warnings": [
        // Danh sách cảnh báo tối ưu
        "Chỉ có 1 thanh RAM - Khuyến nghị dùng 2 thanh để kích hoạt Dual Channel"
      ],
      "recommendedPsuWattage": 650 // Nguồn khuyến nghị (W)
    }
  }
  ```

#### 2. Analyze Build (Phân tích nghẽn cổ chai)

- **Method**: `POST`
- **URL**: `/builds/analyze`
- **Request Body** (`AnalyzeBuildRequest`):
  ```json
  {
    "cpuId": "string-uuid",
    "vgaId": "string-uuid" // Bắt buộc
  }
  ```
- **Response** (`BuildAnalysisResponse`):
  - Trả về thông số `bottleneck` cho 3 độ phân giải: 1080p, 2K, 4K.
  - Mỗi độ phân giải có: `percentage`, `type` (CPU/GPU bottleneck), `severity` (Low/Medium/High), `message` giải thích.

#### 3. Save Build (Lưu cấu hình)

- **Method**: `POST`
- **URL**: `/builds`
- **Request Body**:
  ```json
  {
      "name": "My Dream PC",
      "description": "Gaming max settings",
      "parts": {
          "cpu": "uuid...",
          "mainboard": "uuid...",
          ...
      }
  }
  ```

#### 4. My Builds

- `GET /builds`: Lấy danh sách PC đã lưu của user.
- `GET /builds/{id}`: Chi tiết 1 PC Build.
- `DELETE /builds/{id}`: Xóa PC Build.

---

### 5.4 Component Management (CRUD)

Các API này dùng để quản lý kho linh kiện (người dùng Admin/Staff).
Các API đều hỗ trợ chuẩn:

- `POST /<resource>`: Tạo mới
- `GET /<resource>`: Lấy danh sách
- `GET /<resource>/{id}`: Lấy chi tiết
- `PUT /<resource>/{id}`: Cập nhật
- `DELETE /<resource>/{id}`: Xóa

#### 1. CPU (`/cpus`)

- **Fields**: Name, SocketId, IGPU (boolean), TDP, PCIeVersionId, ImageUrl, Score (benchmark).

#### 2. Mainboard (`/mainboards`)

- **Fields**: Name, SocketId, Chipset, FormFactor, RamTypeId, RamSlots, MaxRamCapacity, PcieVersionId.

#### 3. RAM (`/rams`)

- **Fields**: Name, RamTypeId (DDR4/5...), Bus, CAS Latency, Capacity (GB), Quantity (1 kit mấy thanh), TDP.

#### 4. VGA (`/vgas`)

- **Fields**: Name, Chipset, VRAM (GB), PcieVersionId, Length (mm), TDP, Score (benchmark).

#### 5. Storage (`/ssds`, `/hdds`)

- **SSD**: Name, TypeId (NVMe/SATA), FormFactor (M.2/2.5"), InterfaceId, Capacity, ReadSpeed, WriteSpeed, TDP.
- **HDD**: Name, FormFactor (3.5"), InterfaceId (SATA), Capacity, RPM, Cache, TDP.

#### 6. PSU (`/psus`)

- **Fields**: Name, Wattage, Efficiency (80 Plus...), Modularity, Connectors (số lượng SATA/PCIe...).

#### 7. Case (`/cases`)

- **Fields**: Name, SizeId (ATX/MATX...), MaxVgaLength, MaxCoolerHeight, RadiatorSupport, DriveSlots.

#### 8. Cooler (`/coolers`)

- **Fields**: Name, TypeId (Air/AIO), TdpSupport, Height/RadiatorSize, SocketSupport (List).

---

### 5.5 Reference Data (Dữ liệu tham chiếu)

Dùng để populate các dropdown khi tạo linh kiện.

- **Socket**: `/sockets` (LGA1700, AM5...)
- **RamType**: `/ram-types` (DDR4, DDR5...)
- **PcieVersion**: `/pcie-versions` (3.0, 4.0, 5.0...)
- **FormFactor**: `/form-factors` (ATX, M-ATX, ITX...)
- **InterfaceType**: `/interface-types` (SATA III, PCIe 4.0 x4...)
- **SsdType**: `/ssd-types` (NVMe, SATA...)
- **CoolerType**: `/cooler-types` (Air, AIO 240mm...)
- **CaseSize**: `/case-sizes` (Mid Tower, Full Tower...)
- **PcieConnector**: `/pcie-connectors` (6+2 pin, 12VHPWR...)

### 5.6 File Upload (`/api/files`)

- **Upload Image**: `POST /api/files/upload`
  - Form-data: `file` (binary), `entity` (string, optional - ex: "cpu", "case").
  - Response: URL ảnh đã upload.

---

**Tài liệu được tạo tự động bởi GitHub Copilot.**
