# 🔧 BUILD CONTROLLER API DOCUMENTATION

> **Tài liệu API cho BuildController - Kiểm tra tương thích linh kiện PC**
>
> Phiên bản: 1.0  
> Ngày cập nhật: 02/03/2026

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Base URL](#base-url)
3. [Endpoints](#endpoints)
4. [Request Models](#request-models)
5. [Response Models](#response-models)
6. [Error Codes](#error-codes)
7. [Ví dụ sử dụng](#ví-dụ-sử-dụng)

---

## 🎯 Tổng quan

BuildController cung cấp API để kiểm tra tính tương thích giữa các linh kiện PC được chọn. API sẽ phân tích và trả về:

- ✅ Trạng thái tương thích tổng thể
- ❌ Danh sách lỗi nghiêm trọng (nếu có)
- ⚠️ Danh sách cảnh báo và khuyến nghị
- 💡 Công suất PSU được khuyến nghị

---

## 🌐 Base URL

```
/builds
```

---

## 📡 Endpoints

### 1. Kiểm tra tương thích Build PC

**Mô tả:** Kiểm tra tương thích giữa các linh kiện PC được chọn

| Thuộc tính        | Giá trị                       |
| ----------------- | ----------------------------- |
| **Method**        | `POST`                        |
| **Endpoint**      | `/builds/check-compatibility` |
| **Auth Required** | ❌ Không (Public API)         |
| **Content-Type**  | `application/json`            |

---

## 📥 Request Models

### BuildCheckRequest

**Mô tả:** Request body chứa các ID của linh kiện PC cần kiểm tra

> ⚠️ **Lưu ý:** Tất cả các trường đều là **optional** (không bắt buộc). Bạn có thể gửi bất kỳ tổ hợp linh kiện nào để kiểm tra.

```json
{
  "cpuId": "string (UUID)",
  "mainboardId": "string (UUID)",
  "ramId": "string (UUID)",
  "vgaId": "string (UUID)",
  "ssdIds": ["string (UUID)", "string (UUID)"],
  "hddIds": ["string (UUID)"],
  "psuId": "string (UUID)",
  "caseId": "string (UUID)",
  "coolerId": "string (UUID)"
}
```

#### Chi tiết các trường

| Trường        | Kiểu dữ liệu           | Bắt buộc | Mô tả                   | Ví dụ                                    |
| ------------- | ---------------------- | -------- | ----------------------- | ---------------------------------------- |
| `cpuId`       | String (UUID)          | ❌ Không | ID của CPU              | `"550e8400-e29b-41d4-a716-446655440000"` |
| `mainboardId` | String (UUID)          | ❌ Không | ID của Mainboard        | `"550e8400-e29b-41d4-a716-446655440001"` |
| `ramId`       | String (UUID)          | ❌ Không | ID của RAM              | `"550e8400-e29b-41d4-a716-446655440002"` |
| `vgaId`       | String (UUID)          | ❌ Không | ID của VGA/Card đồ họa  | `"550e8400-e29b-41d4-a716-446655440003"` |
| `ssdIds`      | Array of String (UUID) | ❌ Không | Danh sách ID các SSD    | `["uuid-ssd-1", "uuid-ssd-2"]`           |
| `hddIds`      | Array of String (UUID) | ❌ Không | Danh sách ID các HDD    | `["uuid-hdd-1"]`                         |
| `psuId`       | String (UUID)          | ❌ Không | ID của PSU/Nguồn        | `"550e8400-e29b-41d4-a716-446655440006"` |
| `caseId`      | String (UUID)          | ❌ Không | ID của Case/Vỏ máy      | `"550e8400-e29b-41d4-a716-446655440007"` |
| `coolerId`    | String (UUID)          | ❌ Không | ID của Cooler/Tản nhiệt | `"550e8400-e29b-41d4-a716-446655440008"` |

---

## 📤 Response Models

### ApiResponse<CompatibilityResult>

**Cấu trúc response chung:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    // CompatibilityResult object
  }
}
```

#### Chi tiết ApiResponse

| Trường    | Kiểu dữ liệu        | Mô tả                          |
| --------- | ------------------- | ------------------------------ |
| `code`    | Integer             | Mã trạng thái (1000 = success) |
| `message` | String              | Thông báo trạng thái           |
| `result`  | CompatibilityResult | Kết quả kiểm tra tương thích   |

---

### CompatibilityResult

**Mô tả:** Kết quả chi tiết của quá trình kiểm tra tương thích

```json
{
  "compatible": true,
  "errors": [],
  "warnings": [
    "Chỉ có 1 thanh RAM - Khuyến nghị dùng 2 thanh để kích hoạt Dual Channel"
  ],
  "recommendedPsuWattage": 650
}
```

#### Chi tiết các trường

| Trường                  | Kiểu dữ liệu    | Mô tả                                                                           | Ví dụ                                                            |
| ----------------------- | --------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `compatible`            | Boolean         | Trạng thái tương thích tổng thể (true = tương thích, false = không tương thích) | `true`                                                           |
| `errors`                | Array of String | Danh sách lỗi nghiêm trọng khiến build không hoạt động                          | `["CPU socket 'LGA1700' không khớp với Mainboard socket 'AM5'"]` |
| `warnings`              | Array of String | Danh sách cảnh báo và khuyến nghị (không nghiêm trọng)                          | `["Chỉ có 1 thanh RAM - Khuyến nghị dùng 2 thanh"]`              |
| `recommendedPsuWattage` | Integer         | Công suất PSU khuyến nghị (Watts) - Tính = Total TDP × 1.2                      | `650`                                                            |

---

## 🔴 Error Codes

### Các Error Code chung của hệ thống

| Code     | Message                | HTTP Status               | Mô tả                             |
| -------- | ---------------------- | ------------------------- | --------------------------------- |
| **1000** | Success                | 200 OK                    | ✅ Thành công                     |
| **999**  | Malformed JSON request | 400 Bad Request           | JSON request không đúng định dạng |
| **1001** | Invalid message key    | 400 Bad Request           | Key message không hợp lệ          |
| **9999** | Uncategorized error    | 500 Internal Server Error | Lỗi không xác định                |

### Authentication & Authorization Errors

| Code     | Message                   | HTTP Status      | Mô tả                    |
| -------- | ------------------------- | ---------------- | ------------------------ |
| **1007** | Unauthenticated           | 401 Unauthorized | Chưa xác thực            |
| **1008** | You don't have permission | 403 Forbidden    | Không có quyền truy cập  |
| **1011** | Email is not verified     | 403 Forbidden    | Email chưa được xác thực |
| **1013** | Account is disabled       | 403 Forbidden    | Tài khoản bị vô hiệu hóa |

### CPU Errors (2001-2099)

| Code     | Message       | HTTP Status   |
| -------- | ------------- | ------------- |
| **2007** | CPU not found | 404 Not Found |

### Mainboard Errors (2101-2199)

| Code     | Message             | HTTP Status   |
| -------- | ------------------- | ------------- |
| **2111** | Mainboard not found | 404 Not Found |

### RAM Errors (2201-2299)

| Code     | Message       | HTTP Status   |
| -------- | ------------- | ------------- |
| **2208** | RAM not found | 404 Not Found |

### VGA Errors (2301-2399)

| Code     | Message       | HTTP Status   |
| -------- | ------------- | ------------- |
| **2306** | VGA not found | 404 Not Found |

### Socket Errors (2401-2499)

| Code     | Message          | HTTP Status   |
| -------- | ---------------- | ------------- |
| **2403** | Socket not found | 404 Not Found |

### RAM Type Errors (2501-2599)

| Code     | Message            | HTTP Status   |
| -------- | ------------------ | ------------- |
| **2503** | RAM Type not found | 404 Not Found |

### PCIe Version Errors (2601-2699)

| Code     | Message                | HTTP Status   |
| -------- | ---------------------- | ------------- |
| **2603** | PCIe Version not found | 404 Not Found |

### SSD Errors (2701-2799)

| Code     | Message                 | HTTP Status   |
| -------- | ----------------------- | ------------- |
| **2707** | SSD not found           | 404 Not Found |
| **2713** | SSD Type not found      | 404 Not Found |
| **2723** | SSD Interface not found | 404 Not Found |

### HDD Errors (2801-2899)

| Code     | Message                 | HTTP Status   |
| -------- | ----------------------- | ------------- |
| **2806** | HDD not found           | 404 Not Found |
| **2813** | HDD Interface not found | 404 Not Found |

### PSU Errors (2901-2999)

| Code     | Message                  | HTTP Status   |
| -------- | ------------------------ | ------------- |
| **2905** | PSU not found            | 404 Not Found |
| **2913** | PCIe Connector not found | 404 Not Found |

### Case Errors (3001-3099)

| Code     | Message        | HTTP Status   |
| -------- | -------------- | ------------- |
| **3008** | Case not found | 404 Not Found |

### Cooler Errors (3101-3199)

| Code     | Message               | HTTP Status   |
| -------- | --------------------- | ------------- |
| **3104** | Cooler not found      | 404 Not Found |
| **3113** | Cooler Type not found | 404 Not Found |

### Form Factor & Case Size Errors (3131-3149)

| Code     | Message               | HTTP Status   |
| -------- | --------------------- | ------------- |
| **3133** | Form Factor not found | 404 Not Found |
| **3143** | Case Size not found   | 404 Not Found |

---

## 💡 Ví dụ sử dụng

### ✅ Case 1: Build tương thích hoàn hảo

**Request:**

```http
POST /builds/check-compatibility
Content-Type: application/json

{
  "cpuId": "uuid-intel-i5-12400f",
  "mainboardId": "uuid-asus-b660m-a",
  "ramId": "uuid-kingston-16gb-ddr4-3200",
  "vgaId": "uuid-rtx-3060-ti",
  "ssdIds": ["uuid-samsung-970-evo-500gb"],
  "psuId": "uuid-corsair-650w",
  "caseId": "uuid-nzxt-h510",
  "coolerId": "uuid-noctua-nh-u12s"
}
```

**Response:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "compatible": true,
    "errors": [],
    "warnings": [
      "Chỉ có 1 thanh RAM - Khuyến nghị dùng 2 thanh để kích hoạt Dual Channel"
    ],
    "recommendedPsuWattage": 550
  }
}
```

---

### ❌ Case 2: Build không tương thích (nhiều lỗi)

**Request:**

```http
POST /builds/check-compatibility
Content-Type: application/json

{
  "cpuId": "uuid-intel-i7-12700k",
  "mainboardId": "uuid-amd-b550-mainboard",
  "ramId": "uuid-ddr5-32gb-6000mhz",
  "vgaId": "uuid-rtx-4090",
  "psuId": "uuid-450w-psu"
}
```

**Response:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "compatible": false,
    "errors": [
      "CPU socket 'LGA1700' không khớp với Mainboard socket 'AM5'",
      "RAM type 'DDR5' không khớp với Mainboard RAM type 'DDR4'",
      "PSU chỉ có 450W, không đủ cho hệ thống (khuyến nghị tối thiểu: 850W)"
    ],
    "warnings": [],
    "recommendedPsuWattage": 850
  }
}
```

---

### ⚠️ Case 3: Build tương thích nhưng có cảnh báo

**Request:**

```http
POST /builds/check-compatibility
Content-Type: application/json

{
  "cpuId": "uuid-amd-ryzen-5-5600x",
  "mainboardId": "uuid-asus-b450m",
  "ramId": "uuid-gskill-8gb-ddr4-3200",
  "vgaId": "uuid-rtx-3070",
  "psuId": "uuid-evga-750w"
}
```

**Response:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "compatible": true,
    "errors": [],
    "warnings": [
      "Chỉ có 1 thanh RAM - Khuyến nghị dùng 2 thanh để kích hoạt Dual Channel",
      "RAM dung lượng thấp (8GB) - Khuyến nghị nâng cấp lên 16GB hoặc cao hơn"
    ],
    "recommendedPsuWattage": 550
  }
}
```

---

### 🔍 Case 4: Kiểm tra một phần build (chỉ CPU + Mainboard)

**Request:**

```http
POST /builds/check-compatibility
Content-Type: application/json

{
  "cpuId": "uuid-amd-ryzen-7-7800x3d",
  "mainboardId": "uuid-asus-x670e-strix"
}
```

**Response:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "compatible": true,
    "errors": [],
    "warnings": [
      "Chưa chọn RAM - Hệ thống cần RAM để hoạt động",
      "Chưa chọn PSU - Hệ thống cần nguồn điện để hoạt động"
    ],
    "recommendedPsuWattage": 150
  }
}
```

---

### ❌ Case 5: Linh kiện không tồn tại

**Request:**

```http
POST /builds/check-compatibility
Content-Type: application/json

{
  "cpuId": "invalid-uuid-12345",
  "mainboardId": "uuid-valid-mainboard"
}
```

**Response:**

```json
{
  "code": 2007,
  "message": "CPU not found",
  "result": null
}
```

---

## 📝 Các quy tắc kiểm tra tương thích

### 1. **CPU ↔ Mainboard**

- ✅ Socket phải khớp (LGA1700, AM5, etc.)
- ✅ TDP của CPU phải <= TDP support của Mainboard
- ✅ PCIe version của CPU tương thích với Mainboard

### 2. **RAM ↔ Mainboard**

- ✅ RAM Type phải khớp (DDR4, DDR5)
- ✅ RAM Bus phải <= RAM Bus Max của Mainboard
- ✅ Số lượng RAM slots không vượt quá Mainboard
- ✅ Tổng dung lượng RAM <= Max Capacity của Mainboard
- ⚠️ Warning nếu chỉ dùng 1 thanh RAM (không dual channel)

### 3. **VGA ↔ Mainboard/Case**

- ✅ PCIe version của VGA tương thích với Mainboard
- ✅ Chiều dài VGA <= Max VGA Length của Case (nếu có)

### 4. **PSU (Nguồn)**

- ✅ Công suất PSU >= Recommended PSU Wattage
- 💡 Recommended = Total TDP × 1.2

### 5. **Cooler ↔ CPU**

- ✅ TDP Support của Cooler >= TDP của CPU
- ✅ Chiều cao Cooler <= Max Cooler Height của Case (nếu có)

### 6. **Storage (SSD/HDD) ↔ Case**

- ✅ Số lượng SSD/HDD 2.5" <= 2.5" Drive Slots
- ✅ Số lượng HDD 3.5" <= 3.5" Drive Slots

### 7. **Case**

- ✅ Form Factor của Mainboard phải phù hợp với Case Size
- ✅ Tất cả linh kiện phải vừa vào Case

---

## 🎨 Hướng dẫn tích hợp Frontend

### 1. **Hiển thị kết quả tương thích**

```javascript
// Xử lý response
if (response.result.compatible) {
  // Hiển thị badge xanh "✅ Build tương thích"
  showSuccessBadge("Build tương thích!");
} else {
  // Hiển thị badge đỏ "❌ Build không tương thích"
  showErrorBadge("Build không tương thích!");
}
```

### 2. **Hiển thị danh sách lỗi**

```javascript
// Hiển thị errors (màu đỏ, icon ❌)
response.result.errors.forEach((error) => {
  addErrorItem(error);
});
```

### 3. **Hiển thị danh sách cảnh báo**

```javascript
// Hiển thị warnings (màu vàng, icon ⚠️)
response.result.warnings.forEach((warning) => {
  addWarningItem(warning);
});
```

### 4. **Hiển thị công suất PSU khuyến nghị**

```javascript
// Hiển thị recommended wattage
const recommendedWattage = response.result.recommendedPsuWattage;
showPsuRecommendation(`Khuyến nghị nguồn: ${recommendedWattage}W`);

// So sánh với PSU đã chọn
if (selectedPsuWattage < recommendedWattage) {
  showWarning("⚠️ Nguồn của bạn không đủ công suất!");
}
```

### 5. **Xử lý error codes**

```javascript
// Xử lý các error codes
switch (response.code) {
  case 1000:
    // Success - hiển thị kết quả
    break;
  case 2007:
    showError("CPU không tồn tại trong hệ thống");
    break;
  case 2111:
    showError("Mainboard không tồn tại trong hệ thống");
    break;
  case 1007:
    redirectToLogin(); // Chưa đăng nhập
    break;
  default:
    showError("Có lỗi xảy ra, vui lòng thử lại");
}
```

### 6. **Real-time validation**

```javascript
// Gọi API mỗi khi user thay đổi linh kiện
function onComponentChange() {
  const buildRequest = {
    cpuId: getSelectedCpuId(),
    mainboardId: getSelectedMainboardId(),
    ramId: getSelectedRamId(),
    vgaId: getSelectedVgaId(),
    ssdIds: getSelectedSsdIds(),
    hddIds: getSelectedHddIds(),
    psuId: getSelectedPsuId(),
    caseId: getSelectedCaseId(),
    coolerId: getSelectedCoolerId(),
  };

  checkCompatibility(buildRequest);
}
```

---

## 🔗 Swagger Documentation

API này được document đầy đủ trên Swagger UI:

```
/swagger-ui/index.html
```

Tìm kiếm: **"Build Controller"** hoặc **/builds/check-compatibility**

---

## 📞 Liên hệ & Hỗ trợ

- **Project Repository:** [GitHub Link]
- **API Base URL:** `20.194.26.75:8080`
- **Swagger UI:** `/swagger-ui/index.html`

---

## 📜 License

Copyright © 2026 Build PC Checker Project

---

**🎉 Chúc bạn phát triển giao diện thành công!**
