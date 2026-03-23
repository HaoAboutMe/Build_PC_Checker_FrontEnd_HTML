// admin_community.js

const API_BASE_URL = "http://localhost:8080/identity";

// Entities Configuration (Based on root admin_pcparts.js + Community additions)
const ENTITIES = {
  cpu: {
    url: "/cpus",
    title: "CPU",
    subtitle: "Quản lý danh sách CPU trong hệ thống",
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
    subtitle: "Quản lý danh sách Mainboard trong hệ thống",
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
    subtitle: "Quản lý danh sách RAM trong hệ thống",
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
    subtitle: "Quản lý danh sách VGA trong hệ thống",
    fields: [
      { k: "name", l: "Tên VGA", t: "text", req: true },
      { k: "vramGb", l: "VRAM (GB)", t: "number" },
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
    subtitle: "Quản lý danh sách PSU trong hệ thống",
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
    subtitle: "Quản lý danh sách Tản nhiệt trong hệ thống",
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
  "pc-case": {
    url: "/cases",
    title: "PC Case",
    subtitle: "Quản lý danh sách Case trong hệ thống",
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
    subtitle: "Quản lý danh sách SSD trong hệ thống",
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
    subtitle: "Quản lý danh sách HDD trong hệ thống",
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
  game: {
    url: "/games",
    title: "Game Library",
    subtitle: "Quản lý thư viện Game và yêu cầu cấu hình",
    fields: [
      { k: "name", l: "Tên Game", t: "text", req: true },
      { k: "genre", l: "Thể loại", t: "text" },
      { k: "coverImageUrl", l: "Ảnh Cover", t: "text" },
      { k: "description", l: "Mô tả", t: "textarea" },
      { k: "releaseYear", l: "Năm phát hành", t: "number" },
      { k: "minCpuScore", l: "Điểm CPU Tối thiểu", t: "number", req: true },
      { k: "minGpuScore", l: "Điểm GPU Tối thiểu", t: "number", req: true },
      { k: "recCpuScore", l: "Điểm CPU Đề nghị", t: "number", req: true },
      { k: "recGpuScore", l: "Điểm GPU Đề nghị", t: "number", req: true },
      { k: "minRamGb", l: "RAM Tối thiểu (GB)", t: "number", req: true },
      { k: "recRamGb", l: "RAM Đề nghị (GB)", t: "number", req: true },
      { k: "minVramGb", l: "VRAM Tối thiểu (GB)", t: "number", req: true },
      { k: "recVramGb", l: "VRAM Đề nghị (GB)", t: "number", req: true },
      { k: "minStorageGb", l: "SSD Tối thiểu (GB)", t: "number", req: true },
      { k: "recStorageGb", l: "SSD Đề nghị (GB)", t: "number", req: true },
      { k: "baseFpsLow", l: "FPS Cơ bản (Thấp)", t: "number" },
      { k: "baseFpsMedium", l: "FPS Cơ bản (Trung bình)", t: "number" },
      { k: "baseFpsHigh", l: "FPS Cơ bản (Cao)", t: "number" },
    ],
  },

  // Community / System
  user: {
    url: "/users",
    title: "User Management",
    subtitle: "Quản lý người dùng và tài khoản hệ thống",
    fields: [
      { k: "username", l: "Username", t: "text", req: true },
      { k: "email", l: "Email", t: "text", req: true },
      { k: "firstname", l: "First Name", t: "text" },
      { k: "lastname", l: "Last Name", t: "text" },
      { k: "enabled", l: "Enabled", t: "checkbox" },
    ],
  },
  role: {
    url: "/roles",
    title: "Roles",
    subtitle: "Định nghĩa vai trò và phân quyền",
    fields: [
      { k: "name", l: "Tên Vai trò", t: "text", req: true },
      { k: "description", l: "Mô tả", t: "text" },
      {
        k: "permissions",
        l: "Quyền hạn",
        t: "lookup-multi",
        ref: "permission",
      },
    ],
  },

  // Lookups
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
  permission: {
    url: "/permissions",
    title: "Permission",
    isLookup: true,
    fields: [
      { k: "id", l: "ID", t: "text", req: true },
      { k: "name", l: "Tên", t: "text", req: true },
    ],
  },
};

// State
let currentEntity = "user";
let dataList = [];
let lookups = {};
let currentPage = 1;
const itemsPerPage = 8;
let isEditing = false;

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  setupSidebar();
  setupModals();
  setupSearch();

  // Header Actions
  document
    .getElementById("refresh-data-btn")
    .addEventListener("click", () => loadEntity(currentEntity));
  document.getElementById("admin-logout-btn").addEventListener("click", () => {
    if (confirm("Bạn có muốn đăng xuất không?")) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  });

  await prefetchLookups();

  // Check URL params for deep linking
  const urlParams = new URLSearchParams(window.location.search);
  const targetEntity = urlParams.get("entity") || "user";

  // Activate correct sidebar item UI
  const sidebarItem = document.querySelector(
    `.nav-item[data-entity="${targetEntity}"]`,
  );
  if (sidebarItem) {
    document
      .querySelectorAll(".nav-item")
      .forEach((i) => i.classList.remove("active"));
    sidebarItem.classList.add("active");
  }

  // Check auth and display username
  try {
    const me = await apiCall("/users/me");
    const user = me.result || me;
    
    // Check for ADMIN role explicitly
    const roles = (user.roles || []).map(r => r.name || r);
    if (!roles.includes('ADMIN')) {
        window.location.href = '403.html';
        return;
    }

    const displayName = document.getElementById("admin-display-name");
    if (displayName)
      displayName.textContent = `Admin: ${user.username || "Admin Hảo"}`;
  } catch (e) {
    console.error("Auth reveal failed", e);
  }

  loadEntity(targetEntity);
});

// Sidebar Logic
function setupSidebar() {
  const items = document.querySelectorAll(".nav-item[data-entity]");
  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const entityKey = item.getAttribute("data-entity");
      loadEntity(entityKey);
    });
  });
}

// Data Fetching
async function loadEntity(key, page = 1) {
  currentEntity = key;
  currentPage = page;
  const config = ENTITIES[key];

  // Update UI Header
  const titleEl = document.getElementById("entity-title");
  const subtitleEl = document.getElementById("entity-subtitle");
  if (titleEl) titleEl.textContent = config.title;
  if (subtitleEl)
    subtitleEl.textContent =
      config.subtitle || "Quản trị danh sách trong hệ thống";

  const tbody = document.getElementById("admin-table-body");
  const paginationContainer = document.getElementById("pagination-container");
  tbody.innerHTML =
    '<tr><td colspan="3" style="text-align:center; padding: 40px;">Đang tải dữ liệu...</td></tr>';
  if (paginationContainer) paginationContainer.innerHTML = "";

  try {
    const response = await apiCall(config.url);
    dataList = Array.isArray(response)
      ? response
      : response.result || response.content || [];

    // Client-side pagination
    const totalItems = dataList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = dataList.slice(startIndex, startIndex + itemsPerPage);

    renderTable(pageData);
    renderPagination(totalPages);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 40px; color: #ef4444;">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderPagination(totalPages) {
  const container = document.getElementById("pagination-container");
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML =
      '<span style="color:#64748b; font-size:13px;">Hiển thị 1 trang</span>';
    return;
  }

  let html = `
        <button class="p-btn" id="prev-page" ${currentPage === 1 ? "disabled" : ""}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
    `;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="p-btn ${i === currentPage ? "active" : ""}" onclick="loadEntity(currentEntity, ${i})">${i}</button>`;
  }

  html += `
        <button class="p-btn" id="next-page" ${currentPage === totalPages ? "disabled" : ""}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
    `;

  container.innerHTML = html;

  document
    .getElementById("prev-page")
    ?.addEventListener("click", () =>
      loadEntity(currentEntity, currentPage - 1),
    );
  document
    .getElementById("next-page")
    ?.addEventListener("click", () =>
      loadEntity(currentEntity, currentPage + 1),
    );
}

function renderTable(data) {
  const tbody = document.getElementById("admin-table-body");
  const config = ENTITIES[currentEntity];

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center; padding: 40px; color: #64748b;">No items found.</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map((item) => {
      let name = item.name || item.username || item.id || "N/A";
      let email = item.email || "";

      // Dynamic info chips
      const info = config.fields
        .filter(
          (f) =>
            ![
              "name",
              "username",
              "email",
              "imageUrl",
              "description",
              "coverImageUrl",
            ].includes(f.k),
        )
        .map((f) => {
          let val = item[f.k];
          if (f.t === "lookup" && val) val = val.name || val.id || val;
          if (f.t === "lookup-multi" && Array.isArray(val))
            val = val.map((v) => v.name || v.id || v).join(", ");
          if (typeof val === "boolean") {
            const statusClass = val ? "chip-green" : "chip-red";
            const statusText = val ? "Có" : "Không";
            return `<span class="pc-chip ${statusClass}">${f.l}: ${statusText}</span>`;
          }
          return val !== undefined && val !== null
            ? `<span class="pc-chip chip-blue"><strong>${f.l}:</strong> ${val}</span>`
            : null;
        })
        .filter((v) => v)
        .slice(0, 5)
        .join(" ");

      const avatar =
        item.imageUrl ||
        item.coverImageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      return `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-wrapper">
                            <img src="${avatar}" alt="" class="user-avatar" onerror="this.src='https://via.placeholder.com/40'">
                        </div>
                        <div class="user-info">
                            <h4>${name}</h4>
                            <p>${email}</p>
                        </div>
                    </div>
                </td>
                <td><div class="info-chips-wrap" style="display:flex; flex-wrap:wrap; gap:4px;">${info}</div></td>
                <td>
                    <div class="action-btns">
                        <button class="icon-btn btn-edit-v2" onclick="editItem('${item.id || item.name}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Sửa
                        </button>
                        <button class="icon-btn btn-delete-v2" onclick="deleteItem('${item.id || item.name}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

// Modal & Forms
function setupModals() {
  const modal = document.getElementById("entity-modal");
  const closeBtns = document.querySelectorAll(".close-modal");

  closeBtns.forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("active")),
  );

  document.getElementById("add-entity-btn").addEventListener("click", () => {
    openEditor(null);
  });

  document
    .getElementById("entity-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      saveEntry();
    });
}

async function openEditor(itemId) {
  isEditing = !!itemId;
  const config = ENTITIES[currentEntity];
  const modal = document.getElementById("entity-modal");
  const title = document.getElementById("modal-title");
  const fieldsContainer = document.getElementById("form-fields");
  const idInput = document.getElementById("entity-id");

  idInput.value = itemId || "";
  title.textContent = itemId ? `Edit ${config.title}` : `New ${config.title}`;
  fieldsContainer.innerHTML = "";

  let existingData = {};
  if (isEditing) {
    try {
      // Fetch full details for the specific item before editing
      const response = await apiCall(`${config.url}/${itemId}`);
      existingData = response.result || response;
      existingData = flattenItemData(existingData, config);
    } catch (err) {
      console.warn("Detailed fetch failed, using list data:", err);
      existingData = dataList.find((i) => (i.id || i.name) == itemId) || {};
      existingData = flattenItemData(existingData, config);
    }
  }

  config.fields.forEach((f) => {
    const div = document.createElement("div");
    div.className = "form-group";
    const val =
      existingData[f.k] !== undefined && existingData[f.k] !== null
        ? existingData[f.k]
        : "";

    let inputHtml = "";
    if (f.k.toLowerCase().includes("imageurl") || f.k.toLowerCase().includes("coverimageurl")) {
      inputHtml = `
                    <input type="hidden" id="field-${f.k}" value="${val}" ${f.req ? "required" : ""}>
                    <label class="image-upload-label">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        <span id="upload-status-${f.k}">${val ? "Thay đổi ảnh" : "Bấm vào đây để chọn ảnh"}</span>
                        <input type="file" id="upload-${f.k}" accept="image/*" style="display:none;" onchange="handleFileUpload(this, '${f.k}')">
                    </label>
                    <img id="preview-${f.k}" src="${val}" class="preview-img" style="display:${val ? "block" : "none"};">
                `;
    } else if (f.t === "textarea") {
      inputHtml = `<textarea id="field-${f.k}" ${f.req ? "required" : ""}>${val}</textarea>`;
    } else if (f.t === "lookup") {
      const opts = (lookups[f.ref] || [])
        .map(
          (o) =>
            `<option value="${o.id}" ${o.id == val ? "selected" : ""}>${o.name}</option>`,
        )
        .join("");
      inputHtml = `<select id="field-${f.k}" ${f.req ? "required" : ""}><option value="">Select...</option>${opts}</select>`;
    } else if (f.t === "lookup-multi") {
      const currentIds = Array.isArray(val) ? val : [];
      const opts = (lookups[f.ref] || [])
        .map(
          (o) => `
                <label style="display:block; font-weight: 400; margin-bottom:4px;">
                    <input type="checkbox" name="field-${f.k}" value="${o.id}" ${currentIds.includes(o.id) ? "checked" : ""}> ${o.name}
                </label>
             `,
        )
        .join("");
      inputHtml = `<div class="form-scroll-area" style="max-height: 120px; border: 1px solid #edeeef; padding: 10px; border-radius: 6px;">${opts}</div>`;
    } else if (f.t === "checkbox") {
      inputHtml = `
                <label class="checkbox-toggle-wrap">
                    <span>${f.l} (Bật/Tắt)</span>
                    <input type="checkbox" id="field-${f.k}" ${val ? "checked" : ""}>
                </label>
      `;
    } else {
      inputHtml = `<input type="${f.t}" id="field-${f.k}" value="${val}" ${f.req ? "required" : ""}>`;
    }

    div.innerHTML = `<label>${f.l} ${f.req ? '<span class="required-star">*</span>' : ""}</label>${inputHtml}`;
    fieldsContainer.appendChild(div);
  });

  modal.classList.add("active");
}

async function handleFileUpload(input, fieldKey) {
  const file = input.files[0];
  if (!file) return;

  const statusEl = document.getElementById(`upload-status-${fieldKey}`);
  const previewEl = document.getElementById(`preview-${fieldKey}`);
  const hiddenInput = document.getElementById(`field-${fieldKey}`);

  statusEl.textContent = "Đang tải...";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity", currentEntity || "common");

  try {
    const currentToken = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${currentToken}` },
      body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    const res = await response.json();
    const url =
      typeof res === "string" ? res : res.url || res.result || res.imageUrl;

    if (url) {
      hiddenInput.value = url;
      previewEl.src = url;
      previewEl.style.display = "block";
      statusEl.textContent = "Đã tải lên!";
    }
  } catch (err) {
    statusEl.textContent = "Lỗi!";
    showToast("Tải ảnh thất bại: " + err.message, "error");
  }
}

function flattenItemData(item, config) {
  let res = { ...item };
  config.fields.forEach((f) => {
    if (f.t === "lookup") {
      const objKey = f.k.replace("Id", "");
      if (item[objKey] && (item[objKey].id || item[objKey].name)) {
        res[f.k] = item[objKey].id || item[objKey].name;
      }
    } else if (f.t === "lookup-multi") {
      const objKey = f.k.replace("Ids", "s");
      if (Array.isArray(item[objKey])) {
        res[f.k] = item[objKey].map((i) => i.id || i.name);
      }
    }
  });
  return res;
}

async function saveEntry() {
  const config = ENTITIES[currentEntity];
  const itemId = document.getElementById("entity-id").value;
  const body = {};

  config.fields.forEach((f) => {
    if (f.t === "lookup-multi") {
      const selected = Array.from(
        document.querySelectorAll(`input[name="field-${f.k}"]:checked`),
      ).map((cb) => cb.value);
      body[f.k] = selected;
    } else if (f.t === "checkbox") {
      body[f.k] = document.getElementById(`field-${f.k}`).checked;
    } else {
      const val = document.getElementById(`field-${f.k}`).value;
      body[f.k] =
        f.t === "number" ? (val === "" ? null : parseFloat(val)) : val;
    }
  });

  const isLookup = !!config.isLookup;
  let finalId = itemId;
  if (isLookup && !isEditing) finalId = body.id;

  try {
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${config.url}/${finalId}` : config.url;
    await apiCall(url, { method, body });

    document.getElementById("entity-modal").classList.remove("active");
    if (isLookup) await prefetchLookups();
    loadEntity(currentEntity);
    showToast("Đã lưu dữ liệu thành công!", "success");
  } catch (err) {
    showToast("Không thể lưu: " + err.message, "error");
  }
}

async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  const config = ENTITIES[currentEntity];
  try {
    await apiCall(`${config.url}/${id}`, { method: "DELETE" });
    if (config.isLookup) await prefetchLookups();
    loadEntity(currentEntity);
    showToast("Đã xóa mục thành công!", "success");
  } catch (err) {
    showToast("Lỗi khi xóa: " + err.message, "error");
  }
}

// Search Logic
function setupSearch() {
  const input = document.getElementById("admin-search");
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = dataList.filter((item) => {
      const name = (item.name || item.username || item.id || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
    renderTable(filtered);
  });
}

// Prefetch Lookups
async function prefetchLookups() {
  const keys = Object.keys(ENTITIES).filter((k) => ENTITIES[k].isLookup);
  for (const key of keys) {
    try {
      const config = ENTITIES[key];
      const response = await apiCall(config.url);
      lookups[key] = Array.isArray(response)
        ? response
        : response.result || response.content || [];
    } catch (e) {
      console.error(`Failed to fetch lookup: ${key}`, e);
    }
  }
}

// API Wrapper
async function apiCall(endpoint, options = {}, retryCount = 0) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: { ...headers, ...options.headers },
  };
  if (config.body && typeof config.body === "object")
    config.body = JSON.stringify(config.body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (response.status === 204) return { code: 1000 };

  const data = await response.json();
  if (data.code === 1007 && retryCount === 0) {
    await refreshToken();
    return apiCall(endpoint, options, retryCount + 1);
  }

  // Handle Forbidden (User is logged in but has no permission)
  if (data.code === 1008) {
    window.location.href = '403.html';
    return;
  }

  if (data.code && data.code !== 1000)
    throw new Error(data.message || "API Error");
  return data.result || data;
}

async function refreshToken() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (data.code === 1000) {
    localStorage.setItem("token", data.result.token);
    return data.result.token;
  }
  window.location.href = "login.html";
  throw new Error("Session expired");
}

window.editItem = openEditor;
window.deleteItem = deleteItem;
window.handleFileUpload = handleFileUpload;
