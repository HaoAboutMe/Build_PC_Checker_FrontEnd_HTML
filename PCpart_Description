# 📡 PC PARTS API - Frontend Development Guide

## 🎯 Mục Đích

Document này cung cấp đầy đủ thông tin về các API endpoint CRUD cho PC Parts để phát triển giao diện Frontend.

**Base URL:** `http://localhost:8080/identity/`

**Authentication:** Bearer Token (JWT) trong header `Authorization`

---

## 📋 Table of Contents

1. [API Response Format](#api-response-format)
2. [Error Codes](#error-codes)
3. [PC Part Components](#pc-part-components)
   - [CPU](#1-cpu-api)
   - [Mainboard](#2-mainboard-api)
   - [RAM](#3-ram-api)
   - [VGA](#4-vga-api)
   - [PSU](#5-psu-api)
   - [Cooler](#6-cooler-api)
   - [PC Case](#7-pc-case-api)
   - [SSD](#8-ssd-api)
   - [HDD](#9-hdd-api)
4. [Lookup/Reference Entities](#lookup-reference-entities)
   - [Socket](#10-socket-api)
   - [RAM Type](#11-ram-type-api)
   - [PCIe Version](#12-pcie-version-api)
   - [PCIe Connector](#13-pcie-connector-api)
   - [Case Size](#14-case-size-api)
   - [Cooler Type](#15-cooler-type-api)
   - [Form Factor](#16-form-factor-api)
   - [Interface Type](#17-interface-type-api)
   - [SSD Type](#18-ssd-type-api)

---

## 📦 API Response Format

### Success Response

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    /* data object or array */
  }
}
```

### Error Response

```json
{
  "code": 2007,
  "message": "CPU not found"
}
```

### Field Descriptions

- **code**: Integer - Status code (1000 = success, others = error)
- **message**: String - Human-readable message
- **result**: Object/Array - Response data (only on success)

---

## ⚠️ Error Codes

### General Errors (1000-1999)

| Code | Message                   | HTTP Status               |
| ---- | ------------------------- | ------------------------- |
| 1000 | Success                   | 200 OK                    |
| 1007 | Unauthenticated           | 401 Unauthorized          |
| 1008 | You don't have permission | 403 Forbidden             |
| 9999 | Uncategorized error       | 500 Internal Server Error |

### CPU Errors (2001-2099)

| Code | Message                     | HTTP Status     |
| ---- | --------------------------- | --------------- |
| 2001 | CPU name is required        | 400 Bad Request |
| 2002 | Socket ID is required       | 400 Bad Request |
| 2003 | iGPU field is required      | 400 Bad Request |
| 2004 | TDP is required             | 400 Bad Request |
| 2005 | PCIe Version ID is required | 400 Bad Request |
| 2006 | Score is required           | 400 Bad Request |
| 2007 | CPU not found               | 404 Not Found   |
| 2008 | CPU name already exists     | 400 Bad Request |

### Mainboard Errors (2101-2199)

| Code | Message                         | HTTP Status     |
| ---- | ------------------------------- | --------------- |
| 2101 | Mainboard name is required      | 400 Bad Request |
| 2102 | Socket ID is required           | 400 Bad Request |
| 2103 | VRM Phase is required           | 400 Bad Request |
| 2104 | CPU TDP Support is required     | 400 Bad Request |
| 2105 | RAM Type ID is required         | 400 Bad Request |
| 2106 | RAM Bus Max is required         | 400 Bad Request |
| 2107 | RAM Slot is required            | 400 Bad Request |
| 2108 | RAM Max Capacity is required    | 400 Bad Request |
| 2109 | Size is required                | 400 Bad Request |
| 2110 | PCIe VGA Version ID is required | 400 Bad Request |
| 2111 | Mainboard not found             | 404 Not Found   |
| 2112 | Mainboard name already exists   | 400 Bad Request |

### RAM Errors (2201-2299)

| Code | Message                        | HTTP Status     |
| ---- | ------------------------------ | --------------- |
| 2201 | RAM name is required           | 400 Bad Request |
| 2202 | RAM Type ID is required        | 400 Bad Request |
| 2203 | RAM Bus is required            | 400 Bad Request |
| 2204 | RAM CAS is required            | 400 Bad Request |
| 2205 | Capacity per stick is required | 400 Bad Request |
| 2206 | Quantity is required           | 400 Bad Request |
| 2207 | TDP is required                | 400 Bad Request |
| 2208 | RAM not found                  | 404 Not Found   |
| 2209 | RAM name already exists        | 400 Bad Request |

### VGA Errors (2301-2399)

| Code | Message                     | HTTP Status     |
| ---- | --------------------------- | --------------- |
| 2301 | VGA name is required        | 400 Bad Request |
| 2302 | Length is required          | 400 Bad Request |
| 2303 | TDP is required             | 400 Bad Request |
| 2304 | PCIe Version ID is required | 400 Bad Request |
| 2305 | Score is required           | 400 Bad Request |
| 2306 | VGA not found               | 404 Not Found   |
| 2307 | VGA name already exists     | 400 Bad Request |

### PSU Errors (2901-2999)

| Code | Message                              | HTTP Status     |
| ---- | ------------------------------------ | --------------- |
| 2901 | PSU name is required                 | 400 Bad Request |
| 2902 | PSU Wattage is required              | 400 Bad Request |
| 2903 | PSU Efficiency is required           | 400 Bad Request |
| 2904 | PSU SATA Connector count is required | 400 Bad Request |
| 2905 | PSU not found                        | 404 Not Found   |
| 2906 | PSU name already exists              | 400 Bad Request |

### Cooler Errors (3101-3199)

| Code | Message                        | HTTP Status     |
| ---- | ------------------------------ | --------------- |
| 3101 | Cooler name is required        | 400 Bad Request |
| 3102 | Cooler Type ID is required     | 400 Bad Request |
| 3103 | Cooler TDP Support is required | 400 Bad Request |
| 3104 | Cooler not found               | 404 Not Found   |
| 3105 | Cooler name already exists     | 400 Bad Request |

### PC Case Errors (3001-3099)

| Code | Message                                | HTTP Status     |
| ---- | -------------------------------------- | --------------- |
| 3001 | Case name is required                  | 400 Bad Request |
| 3002 | Case Size is required                  | 400 Bad Request |
| 3003 | Case Max VGA Length is required        | 400 Bad Request |
| 3004 | Case Max Cooler Height is required     | 400 Bad Request |
| 3005 | Case Max Radiator Size is required     | 400 Bad Request |
| 3006 | Case 3.5" Drive Slot count is required | 400 Bad Request |
| 3007 | Case 2.5" Drive Slot count is required | 400 Bad Request |
| 3008 | Case not found                         | 404 Not Found   |
| 3009 | Case name already exists               | 400 Bad Request |

### SSD Errors (2701-2799)

| Code | Message                      | HTTP Status     |
| ---- | ---------------------------- | --------------- |
| 2701 | SSD name is required         | 400 Bad Request |
| 2702 | SSD Type ID is required      | 400 Bad Request |
| 2703 | SSD Form Factor is required  | 400 Bad Request |
| 2704 | SSD Interface ID is required | 400 Bad Request |
| 2705 | SSD Capacity is required     | 400 Bad Request |
| 2706 | SSD TDP is required          | 400 Bad Request |
| 2707 | SSD not found                | 404 Not Found   |
| 2708 | SSD name already exists      | 400 Bad Request |

### HDD Errors (2801-2899)

| Code | Message                      | HTTP Status     |
| ---- | ---------------------------- | --------------- |
| 2801 | HDD name is required         | 400 Bad Request |
| 2802 | HDD Form Factor is required  | 400 Bad Request |
| 2803 | HDD Interface ID is required | 400 Bad Request |
| 2804 | HDD Capacity is required     | 400 Bad Request |
| 2805 | HDD TDP is required          | 400 Bad Request |
| 2806 | HDD not found                | 404 Not Found   |
| 2807 | HDD name already exists      | 400 Bad Request |

---

## 🔧 PC Part Components

---

## 1. CPU API

### 📍 Endpoints

#### 1.1. Create CPU

**POST** `/cpus`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Intel Core i9-13900K",
  "socketId": "LGA1700",
  "vrmMin": 16,
  "igpu": true,
  "tdp": 125,
  "pcieVersionId": "PCIE_5",
  "score": 45000,
  "imageUrl": "https://cdn.example.com/cpu/i9-13900k.jpg",
  "description": "High-end gaming CPU"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | CPU name |
| socketId | String | ✅ Yes | Socket ID (e.g., "LGA1700", "AM5") |
| vrmMin | Integer | ❌ No | Minimum VRM phases |
| igpu | Boolean | ✅ Yes | Has integrated GPU |
| tdp | Integer | ✅ Yes | TDP in Watts |
| pcieVersionId | String | ✅ Yes | PCIe version (e.g., "PCIE_5") |
| score | Integer | ✅ Yes | Benchmark score |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "cpu-uuid-123",
    "name": "Intel Core i9-13900K",
    "socket": {
      "id": "LGA1700",
      "name": "LGA 1700"
    },
    "vrmMin": 16,
    "igpu": true,
    "tdp": 125,
    "pcieVersion": {
      "id": "PCIE_5",
      "name": "PCIe 5.0"
    },
    "score": 45000,
    "imageUrl": "https://cdn.example.com/cpu/i9-13900k.jpg",
    "description": "High-end gaming CPU"
  }
}
```

---

#### 1.2. Get All CPUs

**GET** `/cpus`

**Authorization:** Not required (Public)

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": [
    {
      "id": "cpu-uuid-123",
      "name": "Intel Core i9-13900K",
      "socket": {
        "id": "LGA1700",
        "name": "LGA 1700"
      },
      "vrmMin": 16,
      "igpu": true,
      "tdp": 125,
      "pcieVersion": {
        "id": "PCIE_5",
        "name": "PCIe 5.0"
      },
      "score": 45000,
      "imageUrl": "https://cdn.example.com/cpu/i9-13900k.jpg",
      "description": "High-end gaming CPU"
    }
  ]
}
```

---

#### 1.3. Get CPU by ID

**GET** `/cpus/{id}`

**Authorization:** Not required (Public)

**Path Parameters:**

- `id` (String) - CPU UUID

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "cpu-uuid-123",
    "name": "Intel Core i9-13900K",
    "socket": {
      "id": "LGA1700",
      "name": "LGA 1700"
    },
    "vrmMin": 16,
    "igpu": true,
    "tdp": 125,
    "pcieVersion": {
      "id": "PCIE_5",
      "name": "PCIe 5.0"
    },
    "score": 45000,
    "imageUrl": "https://cdn.example.com/cpu/i9-13900k.jpg",
    "description": "High-end gaming CPU"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "code": 2007,
  "message": "CPU not found"
}
```

---

#### 1.4. Update CPU

**PUT** `/cpus/{id}`

**Authorization:** Required (ADMIN role)

**Path Parameters:**

- `id` (String) - CPU UUID

**Request Body:** (All fields optional)

```json
{
  "name": "Intel Core i9-13900KF",
  "socketId": "LGA1700",
  "vrmMin": 18,
  "igpu": false,
  "tdp": 150,
  "pcieVersionId": "PCIE_5",
  "score": 46000,
  "imageUrl": "https://cdn.example.com/cpu/i9-13900kf.jpg",
  "description": "Updated description"
}
```

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "cpu-uuid-123",
    "name": "Intel Core i9-13900KF",
    "socket": {
      "id": "LGA1700",
      "name": "LGA 1700"
    },
    "vrmMin": 18,
    "igpu": false,
    "tdp": 150,
    "pcieVersion": {
      "id": "PCIE_5",
      "name": "PCIe 5.0"
    },
    "score": 46000,
    "imageUrl": "https://cdn.example.com/cpu/i9-13900kf.jpg",
    "description": "Updated description"
  }
}
```

---

#### 1.5. Delete CPU

**DELETE** `/cpus/{id}`

**Authorization:** Required (ADMIN role)

**Path Parameters:**

- `id` (String) - CPU UUID

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "CPU deleted successfully"
}
```

---

## 2. Mainboard API

### 📍 Endpoints

#### 2.1. Create Mainboard

**POST** `/mainboards`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "ASUS ROG STRIX Z790-E GAMING WIFI",
  "socketId": "LGA1700",
  "vrmPhase": 20,
  "cpuTdpSupport": 250,
  "ramTypeId": "DDR5",
  "ramBusMax": 7200,
  "ramSlot": 4,
  "ramMaxCapacity": 128,
  "sizeId": "ATX",
  "pcieVgaVersionId": "PCIE_5",
  "m2Slot": 5,
  "sataSlot": 6,
  "imageUrl": "https://cdn.asus.com/rog-strix-z790-e.jpg",
  "description": "High-end Z790 motherboard"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | Mainboard name |
| socketId | String | ✅ Yes | CPU Socket ID |
| vrmPhase | Integer | ✅ Yes | VRM phases |
| cpuTdpSupport | Integer | ✅ Yes | Max CPU TDP support (W) |
| ramTypeId | String | ✅ Yes | RAM Type (e.g., "DDR4", "DDR5") |
| ramBusMax | Integer | ✅ Yes | Max RAM Bus speed (MHz) |
| ramSlot | Integer | ✅ Yes | Number of RAM slots |
| ramMaxCapacity | Integer | ✅ Yes | Max RAM capacity (GB) |
| sizeId | String | ✅ Yes | Form factor (e.g., "ATX", "mATX") |
| pcieVgaVersionId | String | ✅ Yes | PCIe version for VGA slot |
| m2Slot | Integer | ❌ No | Number of M.2 slots |
| sataSlot | Integer | ❌ No | Number of SATA ports |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "mainboard-uuid-123",
    "name": "ASUS ROG STRIX Z790-E GAMING WIFI",
    "socket": {
      "id": "LGA1700",
      "name": "LGA 1700"
    },
    "vrmPhase": 20,
    "cpuTdpSupport": 250,
    "ramType": {
      "id": "DDR5",
      "name": "DDR5"
    },
    "ramBusMax": 7200,
    "ramSlot": 4,
    "ramMaxCapacity": 128,
    "size": {
      "id": "ATX",
      "name": "ATX"
    },
    "pcieVgaVersion": {
      "id": "PCIE_5",
      "name": "PCIe 5.0"
    },
    "m2Slot": 5,
    "sataSlot": 6,
    "imageUrl": "https://cdn.asus.com/rog-strix-z790-e.jpg",
    "description": "High-end Z790 motherboard"
  }
}
```

#### 2.2. Get All Mainboards

**GET** `/mainboards`

#### 2.3. Get Mainboard by ID

**GET** `/mainboards/{id}`

#### 2.4. Update Mainboard

**PUT** `/mainboards/{id}`

#### 2.5. Delete Mainboard

**DELETE** `/mainboards/{id}`

---

## 3. RAM API

### 📍 Endpoints

#### 3.1. Create RAM

**POST** `/rams`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz",
  "ramTypeId": "DDR5",
  "ramBus": 6000,
  "ramCas": 30,
  "capacityPerStick": 16,
  "quantity": 2,
  "tdp": 10,
  "imageUrl": "https://cdn.gskill.com/trident-z5.jpg",
  "description": "High-performance DDR5 RAM"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | RAM name |
| ramTypeId | String | ✅ Yes | RAM Type (e.g., "DDR4", "DDR5") |
| ramBus | Integer | ✅ Yes | RAM speed (MHz) |
| ramCas | Integer | ✅ Yes | CAS Latency |
| capacityPerStick | Integer | ✅ Yes | Capacity per stick (GB) |
| quantity | Integer | ✅ Yes | Number of sticks |
| tdp | Integer | ✅ Yes | Power consumption (W) |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "ram-uuid-123",
    "name": "G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz",
    "ramType": {
      "id": "DDR5",
      "name": "DDR5"
    },
    "ramBus": 6000,
    "ramCas": 30,
    "capacityPerStick": 16,
    "quantity": 2,
    "tdp": 10,
    "imageUrl": "https://cdn.gskill.com/trident-z5.jpg",
    "description": "High-performance DDR5 RAM"
  }
}
```

#### 3.2. Get All RAMs

**GET** `/rams`

#### 3.3. Get RAM by ID

**GET** `/rams/{id}`

#### 3.4. Update RAM

**PUT** `/rams/{id}`

#### 3.5. Delete RAM

**DELETE** `/rams/{id}`

---

## 4. VGA API

### 📍 Endpoints

#### 4.1. Create VGA

**POST** `/vgas`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "NVIDIA GeForce RTX 4090 24GB",
  "lengthMm": 336,
  "tdp": 450,
  "pcieVersionId": "PCIE_4",
  "powerConnectorId": "12VHPWR",
  "score": 35000,
  "imageUrl": "https://cdn.nvidia.com/rtx-4090.jpg",
  "description": "Flagship graphics card"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | VGA name |
| lengthMm | Integer | ✅ Yes | Card length (mm) |
| tdp | Integer | ✅ Yes | Power consumption (W) |
| pcieVersionId | String | ✅ Yes | PCIe version |
| powerConnectorId | String | ❌ No | Power connector type |
| score | Integer | ✅ Yes | Performance score |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "vga-uuid-123",
    "name": "NVIDIA GeForce RTX 4090 24GB",
    "lengthMm": 336,
    "tdp": 450,
    "pcieVersion": {
      "id": "PCIE_4",
      "name": "PCIe 4.0"
    },
    "powerConnector": {
      "id": "12VHPWR",
      "name": "12VHPWR"
    },
    "score": 35000,
    "imageUrl": "https://cdn.nvidia.com/rtx-4090.jpg",
    "description": "Flagship graphics card"
  }
}
```

#### 4.2. Get All VGAs

**GET** `/vgas`

#### 4.3. Get VGA by ID

**GET** `/vgas/{id}`

#### 4.4. Update VGA

**PUT** `/vgas/{id}`

#### 4.5. Delete VGA

**DELETE** `/vgas/{id}`

---

## 5. PSU API

### 📍 Endpoints

#### 5.1. Create PSU

**POST** `/psus`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Corsair HX1000i 80 Plus Platinum",
  "wattage": 1000,
  "efficiency": "80+ Platinum",
  "pcieConnectorIds": ["2X8PIN", "3X8PIN", "12VHPWR"],
  "sataConnector": 8,
  "imageUrl": "https://cdn.corsair.com/hx1000i.jpg",
  "description": "High-wattage PSU"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | PSU name |
| wattage | Integer | ✅ Yes | Power capacity (W) |
| efficiency | String | ✅ Yes | Efficiency rating |
| pcieConnectorIds | Array[String] | ❌ No | PCIe connector types |
| sataConnector | Integer | ✅ Yes | Number of SATA connectors |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "psu-uuid-123",
    "name": "Corsair HX1000i 80 Plus Platinum",
    "wattage": 1000,
    "efficiency": "80+ Platinum",
    "pcieConnectors": [
      {
        "id": "2X8PIN",
        "name": "2x 8-Pin"
      },
      {
        "id": "3X8PIN",
        "name": "3x 8-Pin"
      },
      {
        "id": "12VHPWR",
        "name": "12VHPWR"
      }
    ],
    "sataConnector": 8,
    "imageUrl": "https://cdn.corsair.com/hx1000i.jpg",
    "description": "High-wattage PSU"
  }
}
```

#### 5.2. Get All PSUs

**GET** `/psus`

#### 5.3. Get PSU by ID

**GET** `/psus/{id}`

#### 5.4. Update PSU

**PUT** `/psus/{id}`

#### 5.5. Delete PSU

**DELETE** `/psus/{id}`

---

## 6. Cooler API

### 📍 Endpoints

#### 6.1. Create Cooler

**POST** `/coolers`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Noctua NH-D15",
  "coolerTypeId": "AIR",
  "radiatorSize": null,
  "heightMm": 165,
  "tdpSupport": 250,
  "imageUrl": "https://cdn.noctua.at/nh-d15.jpg",
  "description": "Premium air cooler"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | Cooler name |
| coolerTypeId | String | ✅ Yes | Type: "AIR" or "AIO" |
| radiatorSize | Integer | ❌ No | Radiator size (120/240/360) for AIO |
| heightMm | Integer | ❌ No | Height (mm) for air coolers |
| tdpSupport | Integer | ✅ Yes | Max TDP support (W) |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "cooler-uuid-123",
    "name": "Noctua NH-D15",
    "coolerType": {
      "id": "AIR",
      "name": "Air Cooler"
    },
    "radiatorSize": null,
    "heightMm": 165,
    "tdpSupport": 250,
    "imageUrl": "https://cdn.noctua.at/nh-d15.jpg",
    "description": "Premium air cooler"
  }
}
```

#### 6.2. Get All Coolers

**GET** `/coolers`

#### 6.3. Get Cooler by ID

**GET** `/coolers/{id}`

#### 6.4. Update Cooler

**PUT** `/coolers/{id}`

#### 6.5. Delete Cooler

**DELETE** `/coolers/{id}`

---

## 7. PC Case API

### 📍 Endpoints

#### 7.1. Create PC Case

**POST** `/cases`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Lian Li O11 Dynamic EVO",
  "sizeId": "ATX",
  "maxVgaLengthMm": 420,
  "maxCoolerHeightMm": 167,
  "maxRadiatorSize": 360,
  "drive35Slot": 2,
  "drive25Slot": 4,
  "imageUrl": "https://cdn.lian-li.com/o11-dynamic-evo.jpg",
  "description": "Popular ATX case"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | Case name |
| sizeId | String | ✅ Yes | Form factor (ATX/mATX/ITX) |
| maxVgaLengthMm | Integer | ✅ Yes | Max VGA length (mm) |
| maxCoolerHeightMm | Integer | ✅ Yes | Max cooler height (mm) |
| maxRadiatorSize | Integer | ✅ Yes | Max radiator size (mm) |
| drive35Slot | Integer | ✅ Yes | Number of 3.5" drive bays |
| drive25Slot | Integer | ✅ Yes | Number of 2.5" drive bays |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "case-uuid-123",
    "name": "Lian Li O11 Dynamic EVO",
    "size": {
      "id": "ATX",
      "name": "ATX"
    },
    "maxVgaLengthMm": 420,
    "maxCoolerHeightMm": 167,
    "maxRadiatorSize": 360,
    "drive35Slot": 2,
    "drive25Slot": 4,
    "imageUrl": "https://cdn.lian-li.com/o11-dynamic-evo.jpg",
    "description": "Popular ATX case"
  }
}
```

#### 7.2. Get All PC Cases

**GET** `/cases`

#### 7.3. Get PC Case by ID

**GET** `/cases/{id}`

#### 7.4. Update PC Case

**PUT** `/cases/{id}`

#### 7.5. Delete PC Case

**DELETE** `/cases/{id}`

---

## 8. SSD API

### 📍 Endpoints

#### 8.1. Create SSD

**POST** `/ssds`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Samsung 990 PRO 2TB",
  "ssdTypeId": "NVME",
  "formFactorId": "M2_2280",
  "interfaceTypeId": "PCIE_4",
  "capacity": 2000,
  "tdp": 7,
  "imageUrl": "https://cdn.samsung.com/990-pro.jpg",
  "description": "High-speed NVMe SSD"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | SSD name |
| ssdTypeId | String | ✅ Yes | Type: "SATA" or "NVME" |
| formFactorId | String | ✅ Yes | Form factor (e.g., "M2_2280", "FF_2_5") |
| interfaceTypeId | String | ✅ Yes | Interface (e.g., "PCIE_4", "SATA_3") |
| capacity | Integer | ✅ Yes | Capacity (GB) |
| tdp | Integer | ✅ Yes | Power consumption (W) |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "ssd-uuid-123",
    "name": "Samsung 990 PRO 2TB",
    "ssdType": {
      "id": "NVME",
      "name": "NVMe"
    },
    "formFactor": {
      "id": "M2_2280",
      "name": "M.2 2280"
    },
    "interfaceType": {
      "id": "PCIE_4",
      "name": "PCIe 4.0 x4"
    },
    "capacity": 2000,
    "tdp": 7,
    "imageUrl": "https://cdn.samsung.com/990-pro.jpg",
    "description": "High-speed NVMe SSD"
  }
}
```

#### 8.2. Get All SSDs

**GET** `/ssds`

#### 8.3. Get SSD by ID

**GET** `/ssds/{id}`

#### 8.4. Update SSD

**PUT** `/ssds/{id}`

#### 8.5. Delete SSD

**DELETE** `/ssds/{id}`

---

## 9. HDD API

### 📍 Endpoints

#### 9.1. Create HDD

**POST** `/hdds`

**Authorization:** Required (ADMIN role)

**Request Body:**

```json
{
  "name": "Seagate Barracuda 4TB",
  "formFactorId": "FF_3_5",
  "interfaceTypeId": "SATA_3",
  "capacity": 4000,
  "tdp": 6,
  "imageUrl": "https://cdn.seagate.com/barracuda-4tb.jpg",
  "description": "Large capacity HDD"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | ✅ Yes | HDD name |
| formFactorId | String | ✅ Yes | Form factor ("FF_2_5" or "FF_3_5") |
| interfaceTypeId | String | ✅ Yes | Interface (e.g., "SATA_3", "SAS") |
| capacity | Integer | ✅ Yes | Capacity (GB) |
| tdp | Integer | ✅ Yes | Power consumption (W) |
| imageUrl | String | ❌ No | Product image URL |
| description | String | ❌ No | Description |

**Success Response (200 OK):**

```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "hdd-uuid-123",
    "name": "Seagate Barracuda 4TB",
    "formFactor": {
      "id": "FF_3_5",
      "name": "3.5\""
    },
    "interfaceType": {
      "id": "SATA_3",
      "name": "SATA III"
    },
    "capacity": 4000,
    "tdp": 6,
    "imageUrl": "https://cdn.seagate.com/barracuda-4tb.jpg",
    "description": "Large capacity HDD"
  }
}
```

#### 9.2. Get All HDDs

**GET** `/hdds`

#### 9.3. Get HDD by ID

**GET** `/hdds/{id}`

#### 9.4. Update HDD

**PUT** `/hdds/{id}`

#### 9.5. Delete HDD

**DELETE** `/hdds/{id}`

---

## 📚 Lookup Reference Entities

These are supporting entities that provide options for the main PC Parts.

---

## 10. Socket API

### 📍 Endpoints

#### 10.1. Create Socket

**POST** `/sockets`

**Request Body:**

```json
{
  "id": "AM5",
  "name": "AMD AM5"
}
```

#### 10.2. Get All Sockets

**GET** `/sockets`

**Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "LGA1700",
      "name": "LGA 1700"
    },
    {
      "id": "AM5",
      "name": "AMD AM5"
    },
    {
      "id": "AM4",
      "name": "AMD AM4"
    }
  ]
}
```

#### 10.3. Get Socket by ID

**GET** `/sockets/{id}`

#### 10.4. Update Socket

**PUT** `/sockets/{id}`

#### 10.5. Delete Socket

**DELETE** `/sockets/{id}`

---

## 11. RAM Type API

### 📍 Endpoints

**Base Path:** `/ram-types`

**Available Values:**

- `DDR3` - DDR3
- `DDR4` - DDR4
- `DDR5` - DDR5

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "DDR4",
      "name": "DDR4"
    },
    {
      "id": "DDR5",
      "name": "DDR5"
    }
  ]
}
```

---

## 12. PCIe Version API

### 📍 Endpoints

**Base Path:** `/pcie-versions`

**Available Values:**

- `PCIE_3` - PCIe 3.0
- `PCIE_4` - PCIe 4.0
- `PCIE_5` - PCIe 5.0

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "PCIE_3",
      "name": "PCIe 3.0"
    },
    {
      "id": "PCIE_4",
      "name": "PCIe 4.0"
    },
    {
      "id": "PCIE_5",
      "name": "PCIe 5.0"
    }
  ]
}
```

---

## 13. PCIe Connector API

### 📍 Endpoints

**Base Path:** `/pcie-connectors`

**Available Values:**

- `2X8PIN` - 2x 8-Pin
- `3X8PIN` - 3x 8-Pin
- `12VHPWR` - 12VHPWR (New standard)
- `16PIN` - 16-Pin

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "2X8PIN",
      "name": "2x 8-Pin"
    },
    {
      "id": "3X8PIN",
      "name": "3x 8-Pin"
    },
    {
      "id": "12VHPWR",
      "name": "12VHPWR"
    }
  ]
}
```

---

## 14. Case Size API

### 📍 Endpoints

**Base Path:** `/case-sizes`

**Available Values:**

- `ATX` - ATX
- `mATX` - Micro ATX
- `ITX` - Mini ITX

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "ATX",
      "name": "ATX"
    },
    {
      "id": "mATX",
      "name": "Micro ATX"
    },
    {
      "id": "ITX",
      "name": "Mini ITX"
    }
  ]
}
```

---

## 15. Cooler Type API

### 📍 Endpoints

**Base Path:** `/cooler-types`

**Available Values:**

- `AIR` - Air Cooler
- `AIO` - All-in-One Liquid Cooler

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "AIR",
      "name": "Air Cooler"
    },
    {
      "id": "AIO",
      "name": "All-in-One Liquid"
    }
  ]
}
```

---

## 16. Form Factor API

### 📍 Endpoints

**Base Path:** `/form-factors`

**Available Values:**

- `FF_2_5` - 2.5"
- `FF_3_5` - 3.5"
- `M2_2280` - M.2 2280
- `M2_2260` - M.2 2260
- `M2_2242` - M.2 2242

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "FF_2_5",
      "name": "2.5\""
    },
    {
      "id": "FF_3_5",
      "name": "3.5\""
    },
    {
      "id": "M2_2280",
      "name": "M.2 2280"
    }
  ]
}
```

---

## 17. Interface Type API

### 📍 Endpoints

**Base Path:** `/interface-types`

**Available Values:**

- `SATA_3` - SATA III
- `SAS` - SAS
- `PCIE_3` - PCIe 3.0 x4
- `PCIE_4` - PCIe 4.0 x4
- `PCIE_5` - PCIe 5.0 x4

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "SATA_3",
      "name": "SATA III"
    },
    {
      "id": "PCIE_4",
      "name": "PCIe 4.0 x4"
    },
    {
      "id": "PCIE_5",
      "name": "PCIe 5.0 x4"
    }
  ]
}
```

---

## 18. SSD Type API

### 📍 Endpoints

**Base Path:** `/ssd-types`

**Available Values:**

- `SATA` - SATA SSD
- `NVME` - NVMe SSD

**Example Response:**

```json
{
  "code": 1000,
  "result": [
    {
      "id": "SATA",
      "name": "SATA"
    },
    {
      "id": "NVME",
      "name": "NVMe"
    }
  ]
}
```

---

## 🔐 Authentication

### Authorization Header

Tất cả các endpoint CREATE, UPDATE, DELETE cần authentication với JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting Token

Sử dụng endpoint authentication đã có sẵn để lấy token:

**POST** `/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "code": 1000,
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authenticated": true
  }
}
```

---

## 📊 Summary Table

### Main PC Parts

| Component | Endpoint Base | Create | Read | Update | Delete | Auth Required        |
| --------- | ------------- | ------ | ---- | ------ | ------ | -------------------- |
| CPU       | `/cpus`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| Mainboard | `/mainboards` | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| RAM       | `/rams`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| VGA       | `/vgas`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| PSU       | `/psus`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| Cooler    | `/coolers`    | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| PC Case   | `/cases`      | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| SSD       | `/ssds`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |
| HDD       | `/hdds`       | ✅     | ✅   | ✅     | ✅     | Create/Update/Delete |

### Lookup/Reference Entities

| Entity         | Endpoint Base      | Description              |
| -------------- | ------------------ | ------------------------ |
| Socket         | `/sockets`         | CPU/Mainboard sockets    |
| RAM Type       | `/ram-types`       | DDR3/DDR4/DDR5           |
| PCIe Version   | `/pcie-versions`   | PCIe 3.0/4.0/5.0         |
| PCIe Connector | `/pcie-connectors` | Power connectors for VGA |
| Case Size      | `/case-sizes`      | ATX/mATX/ITX             |
| Cooler Type    | `/cooler-types`    | Air/AIO                  |
| Form Factor    | `/form-factors`    | 2.5"/3.5"/M.2 sizes      |
| Interface Type | `/interface-types` | SATA/PCIe interfaces     |
| SSD Type       | `/ssd-types`       | SATA/NVMe                |

---

## 💡 Frontend Implementation Tips

### 1. API Service Setup

```typescript
// api/config.ts
export const API_BASE_URL = "http://localhost:8080";

export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
```

### 2. CPU Service Example

```typescript
// services/cpuService.ts
import axios from "axios";
import { API_BASE_URL, getAuthHeaders } from "./config";

export const cpuService = {
  // Get all CPUs (public)
  getAllCpus: async () => {
    const response = await axios.get(`${API_BASE_URL}/cpus`);
    return response.data.result;
  },

  // Get CPU by ID (public)
  getCpuById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/cpus/${id}`);
    return response.data.result;
  },

  // Create CPU (requires auth)
  createCpu: async (data: CpuCreateRequest) => {
    const response = await axios.post(`${API_BASE_URL}/cpus`, data, {
      headers: getAuthHeaders(),
    });
    return response.data.result;
  },

  // Update CPU (requires auth)
  updateCpu: async (id: string, data: CpuUpdateRequest) => {
    const response = await axios.put(`${API_BASE_URL}/cpus/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data.result;
  },

  // Delete CPU (requires auth)
  deleteCpu: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/cpus/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
```

### 3. Error Handling

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    const { code, message } = error.response.data;

    switch (code) {
      case 1007:
        // Unauthenticated - redirect to login
        window.location.href = "/login";
        break;
      case 1008:
        // Unauthorized - show permission error
        alert("You don't have permission for this action");
        break;
      case 2007:
        // CPU not found
        alert("CPU not found");
        break;
      default:
        alert(message || "An error occurred");
    }
  }
};
```

### 4. TypeScript Interfaces

```typescript
// types/cpu.ts
export interface CpuResponse {
  id: string;
  name: string;
  socket: {
    id: string;
    name: string;
  };
  vrmMin?: number;
  igpu: boolean;
  tdp: number;
  pcieVersion: {
    id: string;
    name: string;
  };
  score: number;
  imageUrl?: string;
  description?: string;
}

export interface CpuCreateRequest {
  name: string;
  socketId: string;
  vrmMin?: number;
  igpu: boolean;
  tdp: number;
  pcieVersionId: string;
  score: number;
  imageUrl?: string;
  description?: string;
}

export interface CpuUpdateRequest {
  name?: string;
  socketId?: string;
  vrmMin?: number;
  igpu?: boolean;
  tdp?: number;
  pcieVersionId?: string;
  score?: number;
  imageUrl?: string;
  description?: string;
}
```

### 5. React Component Example

```typescript
// components/CpuList.tsx
import { useEffect, useState } from 'react';
import { cpuService } from '../services/cpuService';
import { CpuResponse } from '../types/cpu';

export const CpuList = () => {
  const [cpus, setCpus] = useState<CpuResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCpus();
  }, []);

  const loadCpus = async () => {
    try {
      const data = await cpuService.getAllCpus();
      setCpus(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this CPU?')) {
      try {
        await cpuService.deleteCpu(id);
        loadCpus(); // Reload list
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  return (
    <div>
      <h1>CPU List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Socket</th>
              <th>TDP</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cpus.map(cpu => (
              <tr key={cpu.id}>
                <td>
                  {cpu.imageUrl && (
                    <img src={cpu.imageUrl} alt={cpu.name} width="50" />
                  )}
                </td>
                <td>{cpu.name}</td>
                <td>{cpu.socket.name}</td>
                <td>{cpu.tdp}W</td>
                <td>{cpu.score}</td>
                <td>
                  <button onClick={() => handleDelete(cpu.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

---

## 📝 Notes

1. **All GET endpoints are public** - không cần authentication
2. **POST/PUT/DELETE endpoints require ADMIN role** - cần JWT token
3. **imageUrl field is optional** - có thể null hoặc không gửi
4. **All IDs are UUIDs** - generate bởi backend, không cần gửi khi create
5. **Foreign key fields** - cần gửi ID (string), nhận về object đầy đủ trong response

---

## 🚀 Quick Start Checklist

- [ ] Setup API base URL và authentication headers
- [ ] Implement error handling với error codes
- [ ] Tạo TypeScript interfaces cho tất cả entities
- [ ] Implement services cho từng PC Part
- [ ] Tạo forms cho Create/Update operations
- [ ] Tạo list views với delete functionality
- [ ] Load lookup entities (Socket, RAM Type, etc.) cho dropdowns
- [ ] Implement image upload/display với imageUrl
- [ ] Add loading states và error messages
- [ ] Test với Postman hoặc frontend đã build

---

**Version:** 1.5.0 (with imageUrl support)  
**Last Updated:** March 2, 2026  
**Document Status:** ✅ Complete & Ready for Frontend Development
