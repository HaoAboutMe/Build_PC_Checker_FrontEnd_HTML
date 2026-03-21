# Game Controller API Documentation

Tài liệu này mô tả chi tiết các endpoints trong `GameController`. Các endpoints này cung cấp chức năng quản lý game (CRUD), kiểm tra tương thích cấu hình máy tính với game, và ước tính FPS.

Mỗi response thành công thường được bao bọc trong cấu trúc `ApiResponse` chuẩn:

```json
{
  "code": 1000,
  "message": "Success", // Hoặc thông báo khác
  "result": { ... }     // Dữ liệu trả về
}
```

---

## 1. Tạo mới Game (Create Game)

- **URL:** `/games`
- **Method:** `POST`
- **Auth:** Required (Admin only - thường là vậy với chức năng tạo mới)
- **Mô tả:** Tạo một game mới trong hệ thống với các yêu cầu cấu hình tối thiểu và khuyến nghị.

### Request Body (`GameCreationRequest`)

```json
{
  "name": "string (Required)", // Tên game, không được để trống
  "genre": "string", // Thể loại game
  "coverImageUrl": "string", // URL hình ảnh bìa
  "description": "string", // Mô tả game
  "releaseYear": "integer", // Năm phát hành

  // Điểm số Benchmark
  "minCpuScore": "integer (positive)", // Điểm CPU tối thiểu
  "minGpuScore": "integer (positive)", // Điểm GPU tối thiểu
  "recCpuScore": "integer (positive)", // Điểm CPU khuyến nghị
  "recGpuScore": "integer (positive)", // Điểm GPU khuyến nghị

  // Dung lượng (GB)
  "minRamGb": "integer (positive)", // RAM tối thiểu (GB)
  "recRamGb": "integer (positive)", // RAM khuyến nghị (GB)
  "minStorageGb": "integer (positive)", // Dung lượng lưu trữ tối thiểu
  "minVramGb": "integer (positive)", // VRAM tối thiểu
  "recStorageGb": "integer (positive)", // Dung lượng lưu trữ khuyến nghị
  "recVramGb": "integer (positive)" // VRAM khuyến nghị
}
```

### Response (`ApiResponse<GameResponse>`)

```json
{
  "code": 1000,
  "result": {
    "id": "uuid-string",
    "name": "Game Name",
    "genre": "Genre",
    "coverImageUrl": "url",
    "description": "Description",
    "releaseYear": 2024,
    "minCpuScore": 1000,
    "minGpuScore": 2000,
    // ... các trường khác tương tự request
    "baseFpsLow": 0,
    "baseFpsMedium": 0,
    "baseFpsHigh": 0
  }
}
```

---

## 2. Lấy danh sách Games (Get Games)

- **URL:** `/games`
- **Method:** `GET`
- **Params:**
  - `genre` (optional): Lọc theo thể loại game.
  - `page` (default: 0): Số trang hiện tại.
  - `size` (default: 20): Số lượng phần tử mỗi trang.
- **Mô tả:** Lấy danh sách game có phân trang, có thể lọc theo thể loại.

### Response (`ApiResponse<PageResponse<GameSummaryResponse>>`)

```json
{
  "code": 1000,
  "result": {
    "currentPage": 0,
    "totalPages": 5,
    "pageSize": 20,
    "totalElements": 100,
    "data": [
      {
        "id": "uuid-string",
        "name": "Game Name",
        "genre": "RPG",
        "coverImageUrl": "http://example.com/image.jpg"
      }
      // ... thêm các game khác
    ]
  }
}
```

---

## 3. Lấy chi tiết Game (Get Game By ID)

- **URL:** `/games/{id}`
- **Method:** `GET`
- **Mô tả:** Lấy thông tin chi tiết của một game dựa trên ID.

### Response (`ApiResponse<GameResponse>`)

```json
{
  "code": 1000,
  "result": {
    "id": "uuid-string",
    "name": "Cyberpunk 2077",
    "genre": "Action RPG",
    "coverImageUrl": "...",
    "description": "Open world game...",
    "releaseYear": 2020,
    "minCpuScore": 8000,
    "minGpuScore": 9000,
    "recCpuScore": 15000,
    "recGpuScore": 16000,
    "minRamGb": 8,
    "recRamGb": 16,
    "minStorageGb": 70,
    "minVramGb": 3,
    "recStorageGb": 70,
    "recVramGb": 6,
    "baseFpsLow": 45,
    "baseFpsMedium": 60,
    "baseFpsHigh": 80
  }
}
```

---

## 4. Cập nhật Game (Update Game)

- **URL:** `/games/{id}`
- **Method:** `PUT`
- **Auth:** Required (Admin only)
- **Mô tả:** Cập nhật thông tin game.

### Request Body (`GameUpdateRequest`)

Các trường tương tự như **Create Game**, nhưng tất cả đều có thể null (để cập nhật từng phần) hoặc đầy đủ.

```json
{
  "name": "New Name",
  "minCpuScore": 12000,
  // ... các trường cần update
  "baseFpsLow": 60,
  "baseFpsMedium": 90
}
```

### Response (`ApiResponse<GameResponse>`)

Trả về object `GameResponse` đã được cập nhật.

---

## 5. Xóa Game (Delete Game)

- **URL:** `/games/{id}`
- **Method:** `DELETE`
- **Auth:** Required (Admin only)
- **Mô tả:** Xóa game khỏi hệ thống.

### Response

```json
{
  "code": 1000,
  "message": "Game deleted successfully"
}
```

---

## 6. Kiểm tra tương thích danh sách Game (Check Compatible Games)

- **URL:** `/games/check-compatible`
- **Method:** `POST`
- **Mô tả:** Kiểm tra xem cấu hình máy tính hiện tại (CPU, GPU, RAM) có thể chơi được những game nào trong hệ thống. Trả về danh sách game kèm trạng thái tương thích.

### Request Body (`GameCompatCheckRequest`)

```json
{
  "cpuId": "uuid-cpu (Required)",
  "vgaId": "uuid-gpu (Required)",
  "ramId": "uuid-ram (Required)",
  "ramQuantity": 2 // Số thanh ram, optional (null thì lấy default của RAM entity)
}
```

### Response (`ApiResponse<GameCompatListResponse>`)

```json
{
  "code": 1000,
  "result": {
    "pcSummary": {
      "cpuName": "Intel Core i5-12400F",
      "cpuScore": 19500,
      "gpuName": "NVIDIA RTX 3060",
      "gpuScore": 17000,
      "totalRamGb": 16
    },
    "results": [
      {
        "gameId": "uuid-game-1",
        "gameName": "League of Legends",
        "genre": "MOBA",
        "coverImageUrl": "...",
        "status": "RECOMMENDED", // RECOMMENDED | MINIMUM | NOT_SUPPORTED
        "detail": "Chơi mượt mà ở cấu hình đề nghị."
      },
      {
        "gameId": "uuid-game-2",
        "gameName": "Black Myth: Wukong",
        "genre": "Action",
        "coverImageUrl": "...",
        "status": "MINIMUM",
        "detail": "Đạt cấu hình tối thiểu."
      }
    ]
  }
}
```

---

## 7. Kiểm tra tương thích với 1 Game cụ thể (Check Single Game Compatibility)

- **URL:** `/games/{id}/check-compatibility`
- **Method:** `POST`
- **Mô tả:** Kiểm tra chi tiết cấu hình máy tính xem có đáp ứng được một game cụ thể không.

### Request Body (`GameCompatibilityRequest`)

```json
{
  "cpuId": "uuid-cpu (Required)",
  "vgaId": "uuid-gpu (Required)",
  "ramId": "uuid-ram (Optional)" // Nếu không có, có thể hệ thống sẽ bỏ qua check RAM hoặc lấy mặc định
}
```

### Response (`ApiResponse<GameCompatibilityResponse>`)

```json
{
  "code": 1000,
  "result": {
    "game": {
      "id": "uuid-game",
      "name": "Cyberpunk 2077"
    },
    "pcSummary": {
      "cpuName": "Ryzen 5 5600",
      "cpuScore": 22000,
      "gpuName": "RTX 3060",
      "gpuScore": 16747,
      "ramGb": 16
    },
    "compatibility": "RECOMMENDED", // RECOMMENDED | MINIMUM | NOT_SUPPORTED
    "message": "Cấu hình của bạn đạt mức Recommended cho game này."
  }
}
```

---

## 8. Ước tính FPS (Estimate FPS)

- **URL:** `/games/{id}/estimate-fps`
- **Method:** `POST`
- **Mô tả:** Ước tính số FPS (Frames Per Second) khi chơi game cụ thể với cấu hình máy tính và độ phân giải màn hình đã chọn.

### Request Body (`FpsEstimateRequest`)

```json
{
  "cpuId": "uuid-cpu (Required)",
  "vgaId": "uuid-gpu (Required)",
  "resolution": "1080p" // 1080p | 2k | 4k
}
```

### Response (`ApiResponse<FpsEstimateResponse>`)

```json
{
  "code": 1000,
  "result": {
    "game": {
      "id": "uuid-game",
      "name": "Cyberpunk 2077"
    },
    "pcSummary": {
      "cpuName": "Ryzen 5 5600",
      "cpuScore": 22000,
      "gpuName": "RTX 3060",
      "gpuScore": 16747,
      "limitingComponent": "GPU" // Thành phần nào là cổ chai (bottle neck): CPU | GPU
    },
    "resolution": "1080p",
    "fpsEstimates": {
      "low": {
        "estimatedFps": 95,
        "verdict": "EXCELLENT", // Đánh giá: EXCELLENT, PLAYABLE, BELOW_TARGET
        "message": "Chơi rất tốt ở low."
      },
      "medium": {
        "estimatedFps": 58,
        "verdict": "PLAYABLE",
        "message": "Chơi ổn ở medium. Có thể cần tối ưu một số tuỳ chọn."
      },
      "high": {
        "estimatedFps": 35,
        "verdict": "BELOW_TARGET",
        "message": "FPS hơi thấp ở high. Khuyến nghị giảm setting hoặc nâng cấp phần cứng."
      }
    },
    "upgradeAdvice": "GPU RTX 3060 là điểm giới hạn chính. Nâng GPU sẽ cải thiện FPS rõ rệt."
  }
}
```
