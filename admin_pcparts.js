// admin_pcparts.js

const API_BASE_URL = "http://localhost:8080/identity";

// Entities Map
const ENTITIES = {
  cpu: {
    url: "/cpus",
    title: "CPU",
    fields: [
      { k: "name", l: "Tên CPU", t: "text", req: true },
      { k: "socketId", l: "Socket", t: "lookup", ref: "socket", req: true },
      { k: "vrmMin", l: "VRM Min", t: "number" },
      { k: "igpu", l: "Có iGPU", t: "checkbox" },
      { k: "tdp", l: "TDP (W)", t: "number", req: true },
      {
        k: "pcieVersionId",
        l: "PCIe Version",
        t: "lookup",
        ref: "pcie-version",
        req: true,
      },
      { k: "score", l: "Điểm", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  mainboard: {
    url: "/mainboards",
    title: "Mainboard",
    fields: [
      { k: "name", l: "Tên MB", t: "text", req: true },
      { k: "socketId", l: "Socket", t: "lookup", ref: "socket", req: true },
      { k: "vrmPhase", l: "VRM Phase", t: "number", req: true },
      { k: "cpuTdpSupport", l: "Hỗ trợ TDP CPU", t: "number", req: true },
      {
        k: "ramTypeId",
        l: "Loại RAM",
        t: "lookup",
        ref: "ram-type",
        req: true,
      },
      { k: "ramBusMax", l: "RAM Bus Max", t: "number", req: true },
      { k: "ramSlot", l: "Khe RAM", t: "number", req: true },
      { k: "ramMaxCapacity", l: "RAM Max (GB)", t: "number", req: true },
      { k: "sizeId", l: "Kích cỡ", t: "lookup", ref: "case-size", req: true },
      {
        k: "pcieVgaVersionId",
        l: "PCIe VGA",
        t: "lookup",
        ref: "pcie-version",
        req: true,
      },
      { k: "m2Slot", l: "M2 Slot", t: "number" },
      { k: "sataSlot", l: "SATA Slot", t: "number" },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  ram: {
    url: "/rams",
    title: "RAM",
    fields: [
      { k: "name", l: "Tên RAM", t: "text", req: true },
      {
        k: "ramTypeId",
        l: "Loại RAM",
        t: "lookup",
        ref: "ram-type",
        req: true,
      },
      { k: "ramBus", l: "RAM Bus", t: "number", req: true },
      { k: "ramCas", l: "CAS", t: "number", req: true },
      { k: "capacityPerStick", l: "Dung (GB/cây)", t: "number", req: true },
      { k: "quantity", l: "Số lượng cây", t: "number", req: true },
      { k: "tdp", l: "TDP", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  vga: {
    url: "/vgas",
    title: "VGA",
    fields: [
      { k: "name", l: "Tên VGA", t: "text", req: true },
      { k: "lengthMm", l: "Độ dài (mm)", t: "number", req: true },
      { k: "tdp", l: "TDP", t: "number", req: true },
      {
        k: "pcieVersionId",
        l: "PCIe Version",
        t: "lookup",
        ref: "pcie-version",
        req: true,
      },
      {
        k: "powerConnectorId",
        l: "Nguồn phụ",
        t: "lookup",
        ref: "pcie-connector",
      },
      { k: "score", l: "Điểm", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  psu: {
    url: "/psus",
    title: "PSU",
    fields: [
      { k: "name", l: "Tên PSU", t: "text", req: true },
      { k: "wattage", l: "Công suất (W)", t: "number", req: true },
      { k: "efficiency", l: "Hiệu suất", t: "text", req: true },
      {
        k: "pcieConnectorIds",
        l: "Đầu nối PCIe",
        t: "lookup-multi",
        ref: "pcie-connector",
      },
      { k: "sataConnector", l: "Cổng SATA", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  cooler: {
    url: "/coolers",
    title: "Cooler",
    fields: [
      { k: "name", l: "Tên Cooler", t: "text", req: true },
      {
        k: "coolerTypeId",
        l: "Loại Tản",
        t: "lookup",
        ref: "cooler-type",
        req: true,
      },
      { k: "radiatorSize", l: "Kích cỡ Radiator", t: "number" },
      { k: "heightMm", l: "Chiều cao (mm)", t: "number" },
      { k: "tdpSupport", l: "TDP Hỗ trợ", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  case: {
    url: "/cases",
    title: "PC Case",
    fields: [
      { k: "name", l: "Tên Case", t: "text", req: true },
      { k: "sizeId", l: "Kích cỡ", t: "lookup", ref: "case-size", req: true },
      { k: "maxVgaLengthMm", l: "VGA Dài tối đa", t: "number", req: true },
      { k: "maxCoolerHeightMm", l: "Tản nhiệt tối đa", t: "number", req: true },
      { k: "maxRadiatorSize", l: "Radiator tối đa", t: "number", req: true },
      { k: "drive35Slot", l: 'Khe HDD 3.5"', t: "number", req: true },
      { k: "drive25Slot", l: 'Khe SSD 2.5"', t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  ssd: {
    url: "/ssds",
    title: "SSD",
    fields: [
      { k: "name", l: "Tên SSD", t: "text", req: true },
      {
        k: "ssdTypeId",
        l: "Loại SSD",
        t: "lookup",
        ref: "ssd-type",
        req: true,
      },
      {
        k: "formFactorId",
        l: "Form Factor",
        t: "lookup",
        ref: "form-factor",
        req: true,
      },
      {
        k: "interfaceTypeId",
        l: "Interface",
        t: "lookup",
        ref: "interface-type",
        req: true,
      },
      { k: "capacity", l: "Dung lượng (GB)", t: "number", req: true },
      { k: "tdp", l: "TDP", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },
  hdd: {
    url: "/hdds",
    title: "HDD",
    fields: [
      { k: "name", l: "Tên HDD", t: "text", req: true },
      {
        k: "formFactorId",
        l: "Form Factor",
        t: "lookup",
        ref: "form-factor",
        req: true,
      },
      {
        k: "interfaceTypeId",
        l: "Interface",
        t: "lookup",
        ref: "interface-type",
        req: true,
      },
      { k: "capacity", l: "Dung lượng (GB)", t: "number", req: true },
      { k: "tdp", l: "TDP", t: "number", req: true },
      { k: "imageUrl", l: "URL Hình Ảnh", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
    ],
  },

  // Lookups endpoints
  socket: {
    url: "/sockets",
    title: "Socket",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "ram-type": {
    url: "/ram-types",
    title: "RAM Type",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "pcie-version": {
    url: "/pcie-versions",
    title: "PCIe Version",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "pcie-connector": {
    url: "/pcie-connectors",
    title: "PCIe Connector",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "case-size": {
    url: "/case-sizes",
    title: "Case Size",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "cooler-type": {
    url: "/cooler-types",
    title: "Cooler Type",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "form-factor": {
    url: "/form-factors",
    title: "Form Factor",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "interface-type": {
    url: "/interface-types",
    title: "Interface Type",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
  "ssd-type": {
    url: "/ssd-types",
    title: "SSD Type",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
};

// Global state
let currentEntityKey = "cpu";
let currentDataList = [];
let lookupsData = {};
let isEditing = false;
let currentSortOrder = "asc";

// 1. Token Mgmt
const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html"; // Protect page

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  const currentToken = localStorage.getItem("token");
  if (!currentToken) throw new Error("No token to refresh");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: currentToken }),
    });

    const data = await response.json();

    if (data.code === 1000 && data.result.token) {
      localStorage.setItem("token", data.result.token);
      return data.result.token;
    } else {
      throw new Error("Refresh token failed");
    }
  } catch (error) {
    localStorage.removeItem("token");
    throw error;
  }
}

async function apiCall(endpoint, options = {}, retryCount = 0) {
  const currentToken = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
      ...options.headers,
    },
  });

  // Check if 204 layout (Delete might return no content)
  if (res.status === 204) {
    return { code: 1000 };
  }

  const data = await res.json();

  if (data.code === 1007 && retryCount === 0) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    try {
      await refreshPromise;
      return await apiCall(endpoint, options, retryCount + 1);
    } catch (refreshError) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      throw refreshError;
    }
  }

  if (data.code === 1007) {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }

  if (data.code && data.code !== 1000) {
    throw new Error(data.message || "Error occurred");
  }
  return data.result || data;
}

// 2. Fetch lookups
async function preFetchLookups() {
  const keys = Object.keys(ENTITIES).filter((k) => ENTITIES[k].isLookup);
  await Promise.all(
    keys.map(async (k) => {
      try {
        const data = await apiCall(ENTITIES[k].url, { method: "GET" });
        lookupsData[k] = Array.isArray(data) ? data : data.result || [];
      } catch (e) {
        console.error(`Failed loading ${k}`, e);
      }
    }),
  );
}

// 3. UI interactions
document.addEventListener("DOMContentLoaded", async () => {
  // Setup sidebars
  document.querySelectorAll(".pc-sidebar-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".pc-sidebar-btn")
        .forEach((b) => b.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");

      currentEntityKey = target.dataset.part;

      const entity = ENTITIES[currentEntityKey];
      document.getElementById("page-title").textContent = entity.title;
      document.getElementById("page-subtitle").textContent =
        `Quản lý danh sách ${entity.title} trong hệ thống`;

      loadTableData();
    });
  });

  document
    .getElementById("refresh-btn")
    .addEventListener("click", loadTableData);
  document
    .getElementById("create-btn")
    .addEventListener("click", () => openModal(null));
  document
    .getElementById("close-part-modal")
    .addEventListener("click", closeModal);
  document
    .getElementById("cancel-part-btn")
    .addEventListener("click", closeModal);
  document
    .getElementById("part-modal-overlay")
    .addEventListener("click", closeModal);

  document
    .getElementById("close-delete-modal")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("cancel-delete-btn")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-modal-overlay")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", confirmDelete);

  document
    .getElementById("part-form")
    .addEventListener("submit", handleFormSubmit);
  document
    .getElementById("search-input")
    .addEventListener("input", (e) => filterTable(e.target.value));

  // Wait for lookups then load initial table
  await preFetchLookups();
  loadTableData();

  // Try to load user profile mapping
  try {
    const me = await apiCall("/users/me", { method: "GET" });
    if (me && me.username) {
      document.getElementById("navbar-username").textContent =
        `Admin: ${me.username}`;
    }
  } catch (e) {}
});

function showToast(title, msg, isError = false) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-title").textContent = title;
  document.getElementById("toast-message").textContent = msg;

  toast.style.borderColor = isError ? "#f56565" : "#48bb78";

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// 4. Data Loading
async function loadTableData() {
  const tbody = document.getElementById("parts-table-body");
  tbody.innerHTML = `<tr><td colspan="3" class="loading-row"><div class="pc-spinner"></div>Đang tải...</td></tr>`;

  const entity = ENTITIES[currentEntityKey];
  try {
    const data = await apiCall(entity.url, { method: "GET" });
    currentDataList = Array.isArray(data) ? data : data.result || [];
    renderTable(currentDataList);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3" class="error-row" style="text-align:center;color:#e53e3e;padding:1.5rem;">Lỗi: ${e.message}</td></tr>`;
    showToast("Lỗi", `Không thể tải dữ liệu ${entity.title}`, true);
  }
}

function renderTable(dataToRender) {
  const tbody = document.getElementById("parts-table-body");
  const count = document.getElementById("table-count");
  count.textContent = `${dataToRender.length} mục`;

  if (dataToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;color:#a0aec0;">Không có dữ liệu</td></tr>`;
    return;
  }

  const entity = ENTITIES[currentEntityKey];

  tbody.innerHTML = dataToRender
    .map((item) => {
      let details = "";
      if (entity.isLookup) {
        details = `<span class="pc-chip chip-primary">ID: ${item.id}</span>`;
      } else {
        const ignoreList = ["id", "name", "imageUrl", "description"];
        const pieces = Object.keys(item)
          .filter((k) => !ignoreList.includes(k) && item[k] !== null)
          .map((k) => {
            let val = item[k];
            if (typeof val === "object" && val !== null)
              val = val.name || val.id;
            if (Array.isArray(item[k]))
              val = item[k].map((i) => i.name || i.id).join(", ");
            if (typeof val === "boolean")
              return `<span class="badge-bool-${val}">${k}: ${val ? "Có" : "Không"}</span>`;
            return `<span class="pc-chip chip-primary">${k}: ${val}</span>`;
          })
          .slice(0, 5);
        details = pieces.join(" ");
      }

      const nameStr = item.name || item.id || "N/A";
      const imgHtml =
        !entity.isLookup && item.imageUrl
          ? `<img src="${item.imageUrl}" class="pc-img-thumb" alt="img" onerror="this.style.display='none'">`
          : "";
      const desc = item.description
        ? item.description.replace(/"/g, "&quot;")
        : "";

      return `
            <tr title="${!entity.isLookup ? desc : ""}">
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        ${imgHtml}
                        <div class="pc-part-name">${nameStr}</div>
                    </div>
                </td>
                <td><div class="pc-info-chips">${details}</div></td>
                <td>
                    <div class="pc-row-actions">
                        <button class="btn-edit" onclick="editItem('${item.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Sửa
                        </button>
                        <button class="btn-delete" onclick="openDeleteModal('${item.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

function filterTable(query) {
  query = query.toLowerCase();
  const filtered = currentDataList.filter((item) => {
    const name = (item.name || item.id || "").toLowerCase();
    return name.includes(query);
  });
  renderTable(filtered);
}

// 5. Modal Forms
function openModal(itemId) {
  isEditing = !!itemId;
  const entity = ENTITIES[currentEntityKey];

  document.getElementById("part-modal-title").textContent = isEditing
    ? `Sửa ${entity.title}`
    : `Thêm mới ${entity.title}`;

  const formFields = document.getElementById("part-form-fields");
  formFields.innerHTML = "";

  // Build fields
  entity.fields.forEach((f) => {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const label = `<label>${f.l} <span class="required-star">${f.req ? "*" : ""}</span></label>`;
    let inputHtml = "";

    if (f.t === "text" || f.t === "number") {
      const readOnly = f.k === "id" && isEditing;
      let style = readOnly ? 'style="opacity: 0.6; pointer-events: none;"' : "";
      inputHtml = `<input type="${f.t}" id="field-${f.k}" ${f.req ? "required" : ""} ${readOnly ? "readonly" : ""} ${style}>`;
      if (f.k === "imageUrl") {
        inputHtml += `<div class="pc-img-preview-wrap"><img id="preview-${f.k}" class="pc-img-preview" src="" alt="Preview" style="display:none; margin-top:0.5rem; max-height:100px; border-radius:4px;"></div>`;
      }
    } else if (f.t === "textarea") {
      inputHtml = `<textarea id="field-${f.k}" ${f.req ? "required" : ""} rows="3"></textarea>`;
    } else if (f.t === "checkbox") {
      inputHtml = `<label class="pc-toggle-option"><input type="checkbox" id="field-${f.k}"> <span>${f.l} (Bật/Tắt)</span></label>`;
    } else if (f.t === "lookup") {
      const opts = (lookupsData[f.ref] || [])
        .map((opt) => `<option value="${opt.id}">${opt.name}</option>`)
        .join("");
      inputHtml = `<select id="field-${f.k}" ${f.req ? "required" : ""}>
                <option value="">Chọn ${f.l}...</option>
                ${opts}
            </select>`;
    } else if (f.t === "lookup-multi") {
      const opts = (lookupsData[f.ref] || [])
        .map(
          (opt) => `
                <label class="pc-checkbox-item">
                    <input type="checkbox" name="field-${f.k}" value="${opt.id}"> ${opt.name}
                </label>
            `,
        )
        .join("");
      inputHtml = `<div class="pc-checkbox-group" id="field-${f.k}">${opts}</div>`;
    }

    formGroup.innerHTML = label + inputHtml;
    formFields.appendChild(formGroup);
  });

  const imgInput = document.getElementById("field-imageUrl");
  if (imgInput) {
    imgInput.addEventListener("input", (e) => {
      const preview = document.getElementById("preview-imageUrl");
      if (e.target.value) {
        preview.src = e.target.value;
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    });
  }

  if (isEditing) {
    document.getElementById("part-id").value = itemId;
    const item = currentDataList.find((i) => i.id === itemId);
    const flatItem = flattenItemData(item, entity);

    entity.fields.forEach((f) => {
      const val = flatItem[f.k];
      if (f.t === "checkbox") {
        document.getElementById(`field-${f.k}`).checked = !!val;
      } else if (f.t === "lookup-multi") {
        const arr = Array.isArray(val) ? val : [];
        document
          .querySelectorAll(`input[name="field-${f.k}"]`)
          .forEach((cb) => {
            cb.checked = arr.includes(cb.value);
          });
      } else {
        const el = document.getElementById(`field-${f.k}`);
        if (el) {
          el.value = val !== undefined && val !== null ? val : "";
          if (f.k === "imageUrl") {
            const preview = document.getElementById("preview-imageUrl");
            if (preview && val) {
              preview.src = val;
              preview.style.display = "block";
            }
          }
        }
      }
    });
  } else {
    document.getElementById("part-id").value = "";
  }

  document.getElementById("part-modal").classList.add("active");
}

function flattenItemData(item, entity) {
  let res = { ...item };
  entity.fields.forEach((f) => {
    if (f.t === "lookup") {
      const objKey = f.k.replace("Id", "");
      if (item[objKey] && item[objKey].id) res[f.k] = item[objKey].id;
    } else if (f.t === "lookup-multi") {
      const objKey = f.k.replace("Ids", "s");
      if (Array.isArray(item[objKey])) res[f.k] = item[objKey].map((i) => i.id);
    }
  });
  return res;
}

function closeModal() {
  document.getElementById("part-modal").classList.remove("active");
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("save-part-btn");
  btn.classList.add("loading");
  btn.disabled = true;

  const entity = ENTITIES[currentEntityKey];
  const data = {};

  entity.fields.forEach((f) => {
    if (f.t === "checkbox") {
      data[f.k] = document.getElementById(`field-${f.k}`).checked;
    } else if (f.t === "lookup-multi") {
      const cbs = document.querySelectorAll(
        `input[name="field-${f.k}"]:checked`,
      );
      data[f.k] = Array.from(cbs).map((cb) => cb.value);
    } else {
      const v = document.getElementById(`field-${f.k}`).value;
      if (f.t === "number") {
        data[f.k] = v === "" ? null : parseFloat(v);
      } else {
        data[f.k] = v === "" ? null : v;
      }
    }
  });

  const isLookupForm = !!entity.isLookup;
  let submitId = document.getElementById("part-id").value;

  if (isLookupForm && !isEditing) {
    submitId = data.id;
  }

  try {
    if (isEditing) {
      await apiCall(`${entity.url}/${submitId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      showToast("Thành công", "Đã cập nhật mục này.");
    } else {
      await apiCall(entity.url, {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast("Thành công", "Đã thêm mới thành công.");
    }
    closeModal();
    if (isLookupForm) {
      await preFetchLookups();
    }
    loadTableData();
  } catch (err) {
    showToast("Lỗi", err.message, true);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// 6. Delete
function openDeleteModal(id) {
  document.getElementById("delete-item-id").value = id;
  document.getElementById("delete-modal").classList.add("active");
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("active");
}

async function confirmDelete() {
  const btn = document.getElementById("confirm-delete-btn");
  btn.classList.add("loading");
  btn.disabled = true;

  const id = document.getElementById("delete-item-id").value;
  const entity = ENTITIES[currentEntityKey];

  try {
    await apiCall(`${entity.url}/${id}`, { method: "DELETE" });
    showToast("Thành công", "Đã xóa mục thành công.");
    closeDeleteModal();
    if (entity.isLookup) {
      await preFetchLookups();
    }
    loadTableData();
  } catch (err) {
    showToast("Lỗi", err.message, true);
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

function sortByName() {
  if (currentSortOrder === "asc") {
    currentDataList.sort((a, b) => {
      const nameA = (a.name || a.id || "").toString().toLowerCase();
      const nameB = (b.name || b.id || "").toString().toLowerCase();
      return nameB.localeCompare(nameA);
    });
    currentSortOrder = "desc";
  } else {
    currentDataList.sort((a, b) => {
      const nameA = (a.name || a.id || "").toString().toLowerCase();
      const nameB = (b.name || b.id || "").toString().toLowerCase();
      return nameA.localeCompare(nameB);
    });
    currentSortOrder = "asc";
  }

  const query = document.getElementById("search-input")?.value || "";
  if (query) {
    filterTable(query);
  } else {
    renderTable(currentDataList);
  }
}

window.editItem = openModal;
window.openDeleteModal = openDeleteModal;
window.sortByName = sortByName;
// end admin_pcparts.js
