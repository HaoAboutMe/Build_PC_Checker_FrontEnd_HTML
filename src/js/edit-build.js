/**
 * EDIT BUILD LOGIC - BuildPC Checker
 * A specialized version of build-pc.js for editing existing builds.
 */

const API_BASE_URL = "http://localhost:8080/identity";

let isRefreshing = false;
let refreshPromise = null;

// Global State
const buildState = {
  cpuId: null,
  mainboardId: null,
  ramId: null,
  vgaId: null,
  ssdIds: [],
  hddIds: [],
  psuId: null,
  caseId: null,
  coolerId: null,
  selectedGameIds: [],
  selectedGames: [],

  // Edit-specific metadata
  buildId: null,
  initialData: null,
};

// Filter Mapping
const FILTERS_CONFIG = {
  cpu: [{ key: "socketId", label: "Socket", api: "/sockets" }],
  mainboard: [
    { key: "socketId", label: "Socket", api: "/sockets" },
    { key: "ramTypeId", label: "Loại RAM", api: "/ram-types" },
    { key: "sizeId", label: "Kích cỡ", api: "/case-sizes" },
  ],
  ram: [{ key: "ramTypeId", label: "Loại RAM", api: "/ram-types" }],
  vga: [{ key: "pcieVersionId", label: "Chuẩn PCIe", api: "/pcie-versions" }],
  psu: [{ key: "efficiency", label: "Hiệu suất" }],
  ssd: [
    { key: "ssdTypeId", label: "Loại SSD", api: "/ssd-types" },
    { key: "formFactorId", label: "Kích thước", api: "/form-factors" },
  ],
  hdd: [{ key: "formFactorId", label: "Kích thước", api: "/form-factors" }],
  cooler: [{ key: "coolerTypeId", label: "Loại tản", api: "/cooler-types" }],
  case: [{ key: "sizeId", label: "Kích cỡ Case", api: "/case-sizes" }],
};

let activeFilters = {};

// Component Definitions
const componentsConfig = [
  { id: "cpu", name: "Bộ xử lý (CPU)", api: "/cpus", icon: "fas fa-microchip" },
  {
    id: "mainboard",
    name: "Bo mạch chủ (Mainboard)",
    api: "/mainboards",
    icon: "fas fa-square",
  },
  { id: "ram", name: "Bộ nhớ RAM", api: "/rams", icon: "fas fa-memory" },
  { id: "vga", name: "Card đồ họa (VGA)", api: "/vgas", icon: "fas fa-video" },
  {
    id: "ssd",
    name: "Ổ cứng SSD",
    api: "/ssds",
    multi: true,
    icon: "fas fa-hdd",
  },
  {
    id: "hdd",
    name: "Ổ cứng HDD",
    api: "/hdds",
    multi: true,
    icon: "fas fa-compact-disc",
  },
  {
    id: "psu",
    name: "Nguồn máy tính (PSU)",
    api: "/psus",
    icon: "fas fa-plug",
  },
  {
    id: "cooler",
    name: "Tản nhiệt (Cooler)",
    api: "/coolers",
    icon: "fas fa-fan",
  },
  { id: "case", name: "Vỏ máy tính (Case)", api: "/cases", icon: "fas fa-box" },
];

const LABEL_MAP = {
  socket: "Socket",
  tdp: "Công suất (TDP)",
  tdpSupport: "Hỗ trợ TDP",
  pcieVersion: "PCIe",
  vrmMin: "VRM Min",
  igpu: "iGPU",
  ramType: "Loại RAM",
  ramBusMax: "Bus MAX",
  vramGb: "VRAM",
  capacity: "Dung lượng",
  wattage: "Công suất",
  efficiency: "Chuẩn",
  busWidth: "Băng thông",
  memoryType: "Dòng bộ nhớ",
  clockSpeed: "Xung nhịp",
  coreCount: "Số nhân",
  threadCount: "Số luồng",
  lithography: "Tiến trình",
  l3Cache: "L3 Cache",
  socketId: "Socket",
  ramTypeId: "Loại RAM",
  pcieVersionId: "PCIe",
  sizeId: "Kích cỡ",
  coolerTypeId: "Loại tản",
  ssdTypeId: "Loại SSD",
  formFactorId: "Kích thước",
};

function formatLabel(key) {
  return LABEL_MAP[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

const UNIT_MAP = {
  tdp: "W",
  tdpSupport: "W",
  wattage: "W",
  ramBus: "MHz",
  vramGb: "GB",
  capacity: "GB",
};

/**
 * INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 0. Immediate Token Check
  const token = localStorage.getItem("token");
  console.log("[Edit-Build] Checking token...", token ? "Found" : "Missing");

  if (!token || token === "undefined" || token === "null") {
    window.location.href = "login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  buildState.buildId = urlParams.get("id");

  if (!buildState.buildId) {
    triggerToast("Không tìm thấy mã cấu hình", "error");
    setTimeout(() => (window.location.href = "my-builds.html"), 1500);
    return;
  }

  // 1. UI Setup
  initBuildSlots();
  setupCoreEvents();
  setupGameEvents();

  // 2. Load User Profile
  console.log("[Edit-Build] Loading User Info...");
  await loadUserInfo();

  // 3. Load Existing Build Data
  console.log("[Edit-Build] Loading Build Data...");
  await loadBuildToEdit();
});

async function loadBuildToEdit() {
  console.log("[Edit-Build] Fetching build ID:", buildState.buildId);
  const res = await apiCall(`/builds/${buildState.buildId}`);
  console.log("[Edit-Build] Load Data Response:", res);

  if ((res.code === 0 || res.code === 1000) && res.result) {
    const build = res.result;
    buildState.initialData = JSON.parse(JSON.stringify(build));

    // Set Top Info
    document.getElementById("edit-build-name").value = build.name || "";
    document.getElementById("edit-build-desc").value = build.description || "";

    // Map Parts to Internal State & UI
    const parts = build.parts || {};
    // Ensure case-insensitivity by supporting both versions
    const keyMap = {
      cpu: "cpu", cpu: "cpu",
      mainboard: "mainboard", mainboard: "mainboard",
      ram: "ram", ram: "ram",
      vga: "vga", vga: "vga", gpu: "vga",
      psu: "psu", psu: "psu",
      case: "case", case: "case",
      cooler: "cooler", cooler: "cooler",
      ssd: "ssd", ssd: "ssd",
      hdd: "hdd", hdd: "hdd",
      CPU: "cpu", MAINBOARD: "mainboard", RAM: "ram", 
      VGA: "vga", GPU: "vga", PSU: "psu", CASE: "case", 
      COOLER: "cooler", SSD: "ssd", HDD: "hdd"
    };

    console.log("[Edit-Build] Mapping parts:", parts);
    for (const [partKey, partData] of Object.entries(parts)) {
      if (!partData) continue;
      
      const configId = keyMap[partKey];
      if (!configId) {
         console.warn("[Edit-Build] No mapping for part key:", partKey);
         continue;
      }

      const comp = componentsConfig.find((c) => c.id === configId);
      if (comp.multi) {
        buildState[`${configId}Ids`] = [partData.id];
      } else {
        buildState[`${configId}Id`] = partData.id;
      }

      // Render Slot
      const slotEl = document.getElementById(`slot-${configId}`);
      if (slotEl) {
          renderSlotContent(slotEl, comp, partData);
      }
    }

    // Initial check once loaded
    checkCompatibility();
  } else {
    console.error("[Edit-Build] Error loading build:", res.message || "No data");
    triggerToast(`Lỗi tải dữ liệu: ${res.message || "Dữ liệu trống"}`, "error");
    if (res.code === 1005 || res.code === 403) {
         localStorage.removeItem("token");
         window.location.href = "login.html";
    }
  }
}

/**
 * CORE EVENTS (Copied from build-pc.js)
 */
function setupCoreEvents() {
  document.getElementById("close-picker-btn").onclick = closePicker;
  document.getElementById("restore-original-btn").onclick = restoreOriginal;
  document.getElementById("check-bottleneck-btn").onclick = analyzeBottleneck;
  document.getElementById("update-build-btn").onclick = handleUpdateBuild;

  // Search & Pagination in Picker
  document.getElementById("picker-search").oninput = (e) => {
    pickerPage = 1;
    applyFilters();
  };

  document.getElementById("page-prev-btn").onclick = () => {
    if (pickerPage > 1) {
      pickerPage--;
      renderPickerPage();
      document.getElementById("picker-items").scrollTop = 0;
    }
  };
  document.getElementById("page-next-btn").onclick = () => {
    if (pickerPage < Math.ceil(filteredItems.length / 8)) {
      pickerPage++;
      renderPickerPage();
      document.getElementById("picker-items").scrollTop = 0;
    }
  };

  document.getElementById("detail-back-btn").onclick = () => {
    document.getElementById("picker-list-view").style.display = "block";
    document.getElementById("picker-detail-view").style.display = "none";
  };

  document.getElementById("logout-btn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  };
}

/**
 * BUILD UI LOGIC
 */
function initBuildSlots() {
  const list = document.getElementById("build-components-list");
  list.innerHTML = "";
  componentsConfig.forEach((comp) => {
    const slot = document.createElement("div");
    slot.className = "component-slot";
    slot.id = `slot-${comp.id}`;
    renderSlotContent(slot, comp, null);
    list.appendChild(slot);
  });
}

function renderSlotContent(el, comp, partData) {
  const isFilled = partData !== null;
  if (isFilled) {
    el.classList.add("filled");
    const img = partData.imageUrl || "https://via.placeholder.com/80?text=Part";
    el.innerHTML = `
            <div class="part-icon-wrap">
                <img src="${img}" alt="${partData.name}">
            </div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-name" title="${partData.name}">${partData.name}</div>
            </div>
            <div class="part-actions">
                <button class="btn-mini" style="padding: 6px 12px; border-radius: 6px; border:none; background:#f1f5f9; cursor:pointer;" onclick="openPicker('${comp.id}')">Đổi</button>
                <button class="btn-remove-part" style="width:32px; height:32px; border-radius:6px; border:1px solid #fee2e2; background:#fef2f2; color:#ef4444; cursor:pointer;" onclick="removePart('${comp.id}')" title="Gỡ bỏ">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
  } else {
    el.classList.remove("filled");
    el.innerHTML = `
            <div class="part-icon-wrap"><i class="${comp.icon}" style="color:var(--secondary)"></i></div>
            <div class="part-info">
                <div class="part-category">${comp.name}</div>
                <div class="part-empty-text">Chưa chọn linh kiện</div>
            </div>
            <div class="part-actions">
                <button class="btn-primary" style="background:var(--primary); color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;" onclick="openPicker('${comp.id}')">
                    <i class="fas fa-plus"></i> Chọn
                </button>
            </div>
        `;
  }
  updatePartsCount();
}

function updatePartsCount() {
  let count = 0;
  if (buildState.cpuId) count++;
  if (buildState.mainboardId) count++;
  if (buildState.ramId) count++;
  if (buildState.vgaId) count++;
  if (buildState.psuId) count++;
  if (buildState.caseId) count++;
  if (buildState.coolerId) count++;
  count += buildState.ssdIds.length + buildState.hddIds.length;
  document.getElementById("parts-count").innerText = `${count}/9 linh kiện`;
}

/**
 * PICKER LOGIC
 */
let currentPickerComp = null;
let pickerItems = [];
let filteredItems = [];
let pickerPage = 1;

async function openPicker(compId) {
  const comp = componentsConfig.find((c) => c.id === compId);
  currentPickerComp = comp;
  pickerPage = 1;
  activeFilters = {}; // Reset filters

  document.getElementById("picker-title").innerText = `Chọn ${comp.name}`;
  document.getElementById("picker-search").value = "";
  document.getElementById("picker-filters").innerHTML = ""; // Clear filters UI
  document.getElementById("picker-items").innerHTML =
    '<div class="w-100 text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>';
  document.getElementById("picker-modal").classList.add("active");
  document.getElementById("picker-list-view").style.display = "block";
  document.getElementById("picker-detail-view").style.display = "none";

  // Fetch filters lookups (non-blocking for main list)
  renderFilters(compId);

  const res = await apiCall(comp.api);
  if (res.code === 1000) {
    pickerItems = res.result.data || res.result || [];
    applyFilters();
  } else {
    triggerToast("Không thể tải danh sách", "error");
  }
}

async function renderFilters(compId) {
  const filters = FILTERS_CONFIG[compId] || [];
  const container = document.getElementById("picker-filters");
  container.innerHTML = "";

  if (filters.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

  for (const f of filters) {
    const group = document.createElement("div");
    group.className = "filter-group";
    group.innerHTML = `<label>${f.label}</label><select id="filter-${f.key}"><option value="">Tất cả</option></select>`;
    container.appendChild(group);

    const select = group.querySelector("select");

    // Dynamic fetch if api exists
    if (f.api) {
      apiCall(f.api).then((res) => {
        if (res.code === 1000) {
          const list = res.result.data || res.result || [];
          list.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.id || item.name;
            opt.innerText = item.name || item;
            select.appendChild(opt);
          });
        }
      });
    } else if (f.key === "efficiency") {
      [
        "80 Plus",
        "80 Plus Bronze",
        "80 Plus Silver",
        "80 Plus Gold",
        "80 Plus Platinum",
        "80 Plus Titanium",
      ].forEach((val) => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.innerText = val;
        select.appendChild(opt);
      });
    }

    select.addEventListener("change", (e) => {
      activeFilters[f.key] = e.target.value;
      pickerPage = 1;
      applyFilters();
    });
  }
}

function applyFilters() {
  const searchQuery = document
    .getElementById("picker-search")
    .value.toLowerCase()
    .trim();

  filteredItems = pickerItems.filter((item) => {
    // 1. Search Query
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery))
      return false;

    // 2. Active Filters
    for (const [key, val] of Object.entries(activeFilters)) {
      if (!val) continue;

      let itemVal = item[key];
      // Fallback: If key is 'socketId', check for 'socket' object
      if (itemVal === undefined && key.endsWith("Id")) {
        const altKey = key.slice(0, -2);
        itemVal = item[altKey];
      }

      let actualVal = itemVal;
      if (typeof itemVal === "object" && itemVal !== null) {
        actualVal = itemVal.id || itemVal.name;
      }

      if (String(actualVal) !== String(val)) return false;
    }

    return true;
  });

  renderPickerPage();
}

function renderPickerPage() {
  const totalPages = Math.ceil(filteredItems.length / 8) || 1;
  document.getElementById("page-info").innerText =
    `Trang ${pickerPage} / ${totalPages}`;
  document.getElementById("page-prev-btn").disabled = pickerPage <= 1;
  document.getElementById("page-next-btn").disabled = pickerPage >= totalPages;

  const start = (pickerPage - 1) * 8;
  const items = filteredItems.slice(start, start + 8);
  const container = document.getElementById("picker-items");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML =
      '<div class="w-100 text-center py-5 text-muted">Không tìm thấy linh kiện nào</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.innerHTML = `
        <img src="${item.imageUrl || "https://via.placeholder.com/150"}" class="part-card-img">
        <div class="part-card-title">${item.name}</div>
        <div class="card-footer-actions" style="display:flex; gap:8px; margin-top:12px;">
            <button class="btn-primary flex-1 btn-card-select" style="background:var(--primary); color:white; border:none; padding:6px; border-radius:6px; font-size:12px; cursor:pointer;">Chọn</button>
            <button class="btn-secondary flex-1 btn-card-detail" style="background:#f1f5f9; border:none; padding:6px; border-radius:6px; font-size:12px; cursor:pointer;">Chi tiết</button>
        </div>
    `;
    card.querySelector(".btn-card-select").onclick = (e) => {
      e.stopPropagation();
      selectPart(item);
    };
    card.querySelector(".btn-card-detail").onclick = (e) => {
      e.stopPropagation();
      showDetail(item);
    };
    container.appendChild(card);
  });
}

function showDetail(item) {
  document.getElementById("picker-list-view").style.display = "none";
  document.getElementById("picker-detail-view").style.display = "block";
  const content = document.getElementById("detail-content");

  // Construct Specs Grid dynamically
  let specsHtml = "";
  const excludedFields = [
    "score",
    "id",
    "imageUrl",
    "coverImageUrl",
    "name",
    "description",
    "enabled",
    "deleted",
    "code",
    "result",
    "message",
  ];

  Object.entries(item).forEach(([key, value]) => {
    if (excludedFields.includes(key) || value === null || value === undefined)
      return;

    let displayValue = value;
    if (typeof value === "object") {
      displayValue = value.name || value.title || JSON.stringify(value);
    } else if (typeof value === "boolean") {
      displayValue = value ? "Có" : "Không";
    }

    // Apply Units
    if (
      UNIT_MAP[key] &&
      (typeof displayValue === "number" ||
        (!isNaN(displayValue) && displayValue !== ""))
    ) {
      displayValue = `${displayValue} ${UNIT_MAP[key]}`;
    }

    specsHtml += `
            <div class="spec-item-box">
                <span class="spec-label">${formatLabel(key)}</span>
                <span class="spec-value">${displayValue}</span>
            </div>
        `;
  });

  content.innerHTML = `
        <div class="item-details-layout">
            <!-- Col 1: Visual -->
            <div class="item-visual-col">
                 <div class="item-image-wrapper">
                      <img src="${item.imageUrl || "https://via.placeholder.com/300"}" alt="${item.name}">
                 </div>
            </div>

            <!-- Col 2: Info & Description -->
            <div class="item-info-col">
                <div class="item-header-meta">
                    <span class="item-badge-cat">${currentPickerComp.name}</span>
                    <h2 class="item-name-heading">${item.name}</h2>
                    <div class="item-desc-section">
                        <h4 class="mini-title">Mô tả sản phẩm</h4>
                        <div class="item-desc-text">${item.description || "Sản phẩm chưa có mô tả chi tiết từ nhà sản xuất."}</div>
                    </div>
                </div>
            </div>

            <!-- Col 3: Technical Specs -->
            <div class="item-specs-col">
                <h4 class="specs-heading">Thông số kỹ thuật</h4>
                <div class="item-specs-grid">
                    ${specsHtml || '<p class="text-muted">Không có thông số kỹ thuật chi tiết.</p>'}
                </div>
            </div>
        </div>
    `;

  document.getElementById("detail-select-btn").onclick = () => selectPart(item);
}

function selectPart(item) {
  const comp = currentPickerComp;
  if (comp.multi) buildState[`${comp.id}Ids`] = [item.id];
  else buildState[`${comp.id}Id`] = item.id;
  renderSlotContent(document.getElementById(`slot-${comp.id}`), comp, item);
  closePicker();
  checkCompatibility();
}

function removePart(compId) {
  const comp = componentsConfig.find((c) => c.id === compId);
  if (comp.multi) buildState[`${comp.id}Ids`] = [];
  else buildState[`${comp.id}Id`] = null;
  renderSlotContent(document.getElementById(`slot-${comp.id}`), comp, null);
  checkCompatibility();
}

function closePicker() {
  document.getElementById("picker-modal").classList.remove("active");
}

/**
 * COMPATIBILITY & ANALYSIS
 */
async function checkCompatibility() {
  const payload = {};
  if (buildState.cpuId) payload.cpuId = buildState.cpuId;
  if (buildState.mainboardId) payload.mainboardId = buildState.mainboardId;
  if (buildState.ramId) payload.ramId = buildState.ramId;
  if (buildState.vgaId) payload.vgaId = buildState.vgaId;
  if (buildState.psuId) payload.psuId = buildState.psuId;
  if (buildState.caseId) payload.caseId = buildState.caseId;
  if (buildState.coolerId) payload.coolerId = buildState.coolerId;
  if (buildState.ssdIds.length > 0) payload.ssdIds = buildState.ssdIds;
  if (buildState.hddIds.length > 0) payload.hddIds = buildState.hddIds;

  if (Object.keys(payload).length === 0) {
    resetSummaryView();
    return;
  }

  const res = await apiCall("/builds/check-compatibility", "POST", payload);
  if (res.code === 1000 && res.result) {
    updateSummaryView(res.result);
  }
}

function resetSummaryView() {
  const stat = document.getElementById("compat-status");
  stat.className = "analysis-card status-card neutral";
  document.getElementById("compat-status-title").innerText = "Bắt đầu lựa chọn";
  document.getElementById("psu-recommend-value").innerText = "0W";
  document.getElementById("error-group").style.display = "none";
  document.getElementById("warning-group").style.display = "none";
}

function updateSummaryView(result) {
  const stat = document.getElementById("compat-status");
  const title = document.getElementById("compat-status-title");
  const desc = document.getElementById("compat-status-desc");

  if (result.errors?.length > 0) {
    stat.className = "analysis-card status-card error";
    title.innerText = "Không tương thích";
    desc.innerText = "Vui lòng xem lỗi phía dưới.";
  } else if (result.warnings?.length > 0) {
    stat.className = "analysis-card status-card warning";
    title.innerText = "Tương thích (Cảnh báo)";
    desc.innerText = "Có các lưu ý về tối ưu cấu hình.";
  } else {
    stat.className = "analysis-card status-card success";
    title.innerText = "Tương thích hoàn hảo";
    desc.innerText = "Mọi linh kiện đã khớp nhau!";
  }
  document.getElementById("psu-recommend-value").innerText =
    `${result.recommendedPsuWattage || 0}W`;

  const eGrp = document.getElementById("error-group");
  const eList = document.getElementById("error-list");
  if (result.errors?.length > 0) {
    eList.innerHTML = result.errors.map((m) => `<li>${m}</li>`).join("");
    eGrp.style.display = "block";
  } else eGrp.style.display = "none";

  const wGrp = document.getElementById("warning-group");
  const wList = document.getElementById("warning-list");
  if (result.warnings?.length > 0) {
    wList.innerHTML = result.warnings.map((m) => `<li>${m}</li>`).join("");
    wGrp.style.display = "block";
  } else wGrp.style.display = "none";
}

async function analyzeBottleneck() {
  if (!buildState.cpuId || !buildState.vgaId) {
    triggerToast("Thiếu linh kiện trọng yếu (CPU/VGA)", "error");
    return;
  }

  const btn = document.getElementById("check-bottleneck-btn");
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';
  btn.disabled = true;

  const res = await apiCall("/builds/analyze", "POST", {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    gpuId: buildState.vgaId,
  });

  btn.innerHTML = '<i class="fas fa-search"></i> Phân tích';
  btn.disabled = false;

  if (res.code === 1000 && res.result) {
    document.getElementById("bottleneck-empty").style.display = "none";
    document.getElementById("bottleneck-results-content").style.display =
      "block";

    const data = res.result.results;
    const colorMap = {
      NONE: "#10b981",
      LOW: "#63b3ed",
      MEDIUM: "#f6ad55",
      HIGH: "#f56565",
    };

    const resDisplay = (key, id) => {
      const el = document.getElementById(id);
      const val = data[key] || { severity: "NONE" };
      el.innerText = val.severity === "NONE" ? "Tốt" : val.severity;
      el.style.color = colorMap[val.severity] || "inherit";
    };

    resDisplay("1080p", "bottleneck-1080p");
    resDisplay("2k", "bottleneck-2k");
    resDisplay("4k", "bottleneck-4k");

    document.getElementById("bottleneck-message").innerHTML = `
            <p><strong>Cân bằng:</strong> ${data["1080p"].message}</p>
        `;
  }
}

/**
 * UPDATE BUILD (PUT)
 */
async function handleUpdateBuild() {
  const name = document.getElementById("edit-build-name").value.trim();
  if (!name) {
    triggerToast("Vui lòng nhập tên", "warning");
    return;
  }

  const btn = document.getElementById("update-build-btn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';

  const parts = {};
  if (buildState.cpuId) parts.cpu = buildState.cpuId;
  if (buildState.mainboardId) parts.mainboard = buildState.mainboardId;
  if (buildState.ramId) parts.ram = buildState.ramId;
  if (buildState.vgaId) parts.gpu = buildState.vgaId;
  if (buildState.psuId) parts.psu = buildState.psuId;
  if (buildState.caseId) parts.case = buildState.caseId;
  if (buildState.coolerId) parts.cooler = buildState.coolerId;
  if (buildState.ssdIds.length > 0) parts.ssd = buildState.ssdIds[0];
  if (buildState.hddIds.length > 0) parts.hdd = buildState.hddIds[0];

  const payload = {
    name: name,
    description: document.getElementById("edit-build-desc").value,
    parts: parts,
  };

  const res = await apiCall(`/builds/${buildState.buildId}`, "PUT", payload);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Cập nhật ngay';

  if (res.code === 1000 || res.code === 0) {
    triggerToast("Cập nhật thành công!", "success");
  } else {
    triggerToast(res.message || "Lỗi cập nhật", "error");
  }
}

/**
 * GAME COMPATIBILITY LOGIC
 */
let allGames = [];
let tempSelectedGameIds = [];
let gamePage = 1;
const G_PER_PAGE = 12;

function setupGameEvents() {
  document
    .getElementById("view-game-list-btn")
    .addEventListener("click", openGamePicker);
  document
    .getElementById("close-game-picker-btn")
    .addEventListener("click", () =>
      document.getElementById("game-picker-modal").classList.remove("active"),
    );
  document
    .getElementById("close-game-compat-list-btn")
    .addEventListener("click", () =>
      document.getElementById("game-compat-list-modal").classList.remove("active"),
    );
  document
    .getElementById("close-fps-btn")
    .addEventListener("click", () =>
      document.getElementById("fps-modal").classList.remove("active"),
    );
  document
    .getElementById("close-compat-error-btn")
    .addEventListener("click", () =>
      document.getElementById("compat-error-modal").classList.remove("active"),
    );
  document
    .getElementById("confirm-compat-error-btn")
    .addEventListener("click", () =>
      document.getElementById("compat-error-modal").classList.remove("active"),
    );
  document
    .getElementById("confirm-game-selection-btn")
    .addEventListener("click", confirmGameSelection);

  document.getElementById("game-page-prev").addEventListener("click", () => {
    if (gamePage > 1) {
      gamePage--;
      renderGamePage();
    }
  });
  document.getElementById("game-page-next").addEventListener("click", () => {
    if (gamePage < Math.ceil(allGames.length / G_PER_PAGE)) {
      gamePage++;
      renderGamePage();
    }
  });

  // Check buttons
  document
    .getElementById("check-multi-compat-btn")
    .addEventListener("click", checkMultiCompatibility);
  document
    .getElementById("check-multi-fps-btn")
    .addEventListener("click", estimateMultiFPS);
  document
    .getElementById("check-all-games-btn")
    .addEventListener("click", checkAllGames);

  document
    .getElementById("game-picker-search")
    .addEventListener("input", (e) => {
      gamePage = 1;
      renderGamePage(e.target.value);
    });

  renderSelectedGamesList();
}

async function openGamePicker() {
  document.getElementById("game-picker-modal").classList.add("active");
  tempSelectedGameIds = [...buildState.selectedGameIds];
  updateGameSelCount();

  if (allGames.length === 0) {
    document.getElementById("game-picker-items").innerHTML =
      '<div class="w-100 text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    const res = await apiCall("/games?size=200");
    allGames = res.result?.content || res.result?.data || res.result || [];
    renderGamePage();
  } else {
    renderGamePage();
  }
}

function renderGamePage(query = "") {
  const list = document.getElementById("game-picker-items");
  list.innerHTML = "";
  const filtered = allGames.filter((g) => {
    const name = (g.name || g.gameName || "").toLowerCase();
    return name.includes(query.toLowerCase());
  });
  const totalPages = Math.ceil(filtered.length / G_PER_PAGE) || 1;
  document.getElementById("game-page-info").innerText =
    `Trang ${gamePage} / ${totalPages}`;

  const start = (gamePage - 1) * G_PER_PAGE;
  const items = filtered.slice(start, start + G_PER_PAGE);

  items.forEach((game) => {
    const isSelected = tempSelectedGameIds.includes(game.id);
    const card = document.createElement("div");
    card.className = "game-card-mini";
    card.innerHTML = `
            <div class="game-checkbox-overlay ${isSelected ? "active" : ""}">
                <i class="fas fa-check"></i>
            </div>
            <img src="${game.coverImageUrl || "https://via.placeholder.com/150x200"}" alt="${game.name || game.gameName}">
            <div class="game-name-label">${game.name || game.gameName || "N/A"}</div>
        `;
    card.onclick = () => toggleGameTempSelection(game.id);
    list.appendChild(card);
  });
}

function toggleGameTempSelection(gameId) {
  const idx = tempSelectedGameIds.indexOf(gameId);
  if (idx > -1) tempSelectedGameIds.splice(idx, 1);
  else tempSelectedGameIds.push(gameId);
  renderGamePage();
  updateGameSelCount();
}

function updateGameSelCount() {
  document.getElementById("game-sel-count").innerText =
    `Đã chọn ${tempSelectedGameIds.length} game`;
}

function confirmGameSelection() {
  buildState.selectedGameIds = [...tempSelectedGameIds];
  buildState.selectedGames = allGames.filter((g) =>
    buildState.selectedGameIds.includes(g.id),
  );
  document.getElementById("game-picker-modal").classList.remove("active");
  renderSelectedGamesList();
}

function renderSelectedGamesList() {
  const container = document.getElementById("selected-games-list");
  const actions = document.getElementById("game-actions");
  const resWrap = document.getElementById("resolution-selector-wrap");
  const btnText = document.getElementById("view-game-list-btn");

  btnText.innerHTML = `<i class="fas fa-plus"></i> Chọn Games (${buildState.selectedGames.length})`;

  if (buildState.selectedGames.length === 0) {
    container.innerHTML =
      '<div class="empty-games-placeholder">Chưa có game nào được chọn</div>';
    actions.style.display = "none";
    resWrap.style.display = "none";
    return;
  }
  actions.style.display = "flex";
  resWrap.style.display = "block";

  container.innerHTML = buildState.selectedGames
    .map(
      (game) => `
        <div class="selected-game-item" id="sel-game-${game.id}">
            <img src="${game.coverImageUrl || "https://via.placeholder.com/32"}" alt="${game.name || game.gameName}">
            <div class="game-name">${game.name || game.gameName || "N/A"}</div>
            <div class="game-status-badge" id="status-badge-${game.id}"></div>
            <button class="remove-game" onclick="removeSelectedGame('${game.id}')"><i class="fas fa-times"></i></button>
        </div>
    `,
    )
    .join("");
}

function removeSelectedGame(id) {
  buildState.selectedGameIds = buildState.selectedGameIds.filter(
    (gid) => gid !== id,
  );
  buildState.selectedGames = buildState.selectedGames.filter(
    (g) => g.id !== id,
  );
  renderSelectedGamesList();
}

async function checkMultiCompatibility() {
  if (!buildState.cpuId) {
    triggerToast("Bạn chưa chọn CPU để kiểm tra tương thích!", "error");
    return;
  }
  if (!buildState.vgaId) {
    triggerToast("Bạn chưa chọn Card đồ họa (VGA) để kiểm tra tương thích!", "error");
    return;
  }
  if (!buildState.ramId) {
    triggerToast("Bạn chưa chọn RAM để kiểm tra tương thích!", "error");
    return;
  }

  if (buildState.selectedGames.length === 0) {
    triggerToast("Vui lòng chọn ít nhất một game", "warning");
    return;
  }

  triggerToast("Đang kiểm tra độ tương thích...", "info");
  for (const game of buildState.selectedGames) {
    const badge = document.getElementById(`status-badge-${game.id}`);
    badge.innerText = "⌛";
    badge.style.background = "#e2e8f0";
    const res = await apiCall(`/games/${game.id}/check-compatibility`, "POST", {
      cpuId: buildState.cpuId,
      vgaId: buildState.vgaId,
      ramId: buildState.ramId,
    });
    if (res.code === 1000 && res.result) {
      const compatibility =
        res.result.compatibility || res.result.data?.compatibility;
      const isRec = compatibility === "RECOMMENDED";
      badge.innerText = isRec ? "REC" : "MIN";
      badge.style.background = isRec ? "var(--success)" : "var(--accent)";
      badge.style.color = "white";
    } else {
      badge.innerText = "Error";
      badge.style.background = "var(--danger)";
    }
  }
}

async function estimateMultiFPS() {
  if (!buildState.cpuId) {
    triggerToast("Bạn chưa chọn CPU để ước tính FPS!", "error");
    return;
  }
  if (!buildState.vgaId) {
    triggerToast("Bạn chưa chọn Card đồ họa (VGA) để ước tính FPS!", "error");
    return;
  }

  const resInput = document.querySelector('input[name="res-choice"]:checked');
  if (!resInput) {
    triggerToast("Vui lòng chọn độ phân giải", "warning");
    return;
  }
  const resolution = resInput.value;

  triggerToast(`Đang dự toán FPS (${resolution})...`, "info");
  for (const game of buildState.selectedGames) {
    const badge = document.getElementById(`status-badge-${game.id}`);
    badge.innerText = "FPS...";
    badge.style.background = "#e2e8f0";
    const res = await apiCall(`/games/${game.id}/estimate-fps`, "POST", {
      cpuId: buildState.cpuId,
      vgaId: buildState.vgaId,
      resolution: resolution,
    });
    if (res.code === 1000 && res.result) {
      const fpsData = res.result.fpsEstimates;
      badge.innerHTML = `
                <div class="fps-multi-wrap">
                    <div class="fps-tag low" title="${fpsData.low.message}">
                        <span class="label">Low</span>
                        <span class="value">${fpsData.low.estimatedFps}</span>
                    </div>
                    <div class="fps-tag med" title="${fpsData.medium.message}">
                        <span class="label">Med</span>
                        <span class="value">${fpsData.medium.estimatedFps}</span>
                    </div>
                    <div class="fps-tag high" title="${fpsData.high.message}">
                        <span class="label">High</span>
                        <span class="value">${fpsData.high.estimatedFps}</span>
                    </div>
                </div>
            `;
      badge.style.background = "transparent";
      badge.style.padding = "0";
    } else {
      badge.innerText = "Lỗi";
      badge.style.background = "var(--danger)";
    }
  }
}

async function checkAllGames() {
  if (!buildState.cpuId) {
    triggerToast("Bạn chưa chọn CPU để kiểm tra tương thích!", "error");
    return;
  }
  if (!buildState.vgaId) {
    triggerToast("Bạn chưa chọn Card đồ họa (VGA) để kiểm tra tương thích!", "error");
    return;
  }
  if (!buildState.ramId) {
    triggerToast("Bạn chưa chọn RAM để kiểm tra tương thích!", "error");
    return;
  }

  const modal = document.getElementById("game-compat-list-modal");
  modal.classList.add("active");
  const list = document.getElementById("game-compat-results");
  list.innerHTML =
    '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang kiểm tra...</p></div>';

  const res = await apiCall("/games/check-compatible", "POST", {
    cpuId: buildState.cpuId,
    vgaId: buildState.vgaId,
    ramId: buildState.ramId,
  });

  if (res.code === 1000) {
    document.getElementById("pc-spec-summary").innerHTML = `
            <div class="summary-spec-card"><span class="label">CPU Score</span><span class="value">${res.result.pcSummary.cpuScore}</span></div>
            <div class="summary-spec-card"><span class="label">GPU Score</span><span class="value">${res.result.pcSummary.gpuScore}</span></div>
            <div class="summary-spec-card"><span class="label">RAM</span><span class="value">${res.result.pcSummary.totalRamGb}GB</span></div>
        `;
    list.innerHTML = res.result.results
      .map((g) => {
        const statusClass = g.status.toLowerCase();
        return `
            <div class="game-res-card">
                <img src="${g.coverImageUrl}" alt="${g.gameName}">
                <div class="game-res-info">
                    <div class="game-res-name">${g.gameName || g.name || "N/A"}</div>
                    <div class="game-res-detail">${g.detail}</div>
                </div>
                <span class="status-tag ${statusClass}">${g.status}</span>
            </div>
        `;
      })
      .join("");
  }
}

function showConfirm(title, message, onOk) {
  const modal = document.getElementById("custom-confirm-modal");
  document.getElementById("confirm-title").innerText = title;
  document.getElementById("confirm-message").innerText = message;

  modal.classList.add("active");

  const okBtn = document.getElementById("confirm-ok-btn");
  const cancelBtn = document.getElementById("confirm-cancel-btn");

  okBtn.onclick = () => {
    modal.classList.remove("active");
    if (onOk) onOk();
  };

  cancelBtn.onclick = () => {
    modal.classList.remove("active");
  };
}

function restoreOriginal() {
  showConfirm(
    "Khôi phục cấu hình",
    "Bạn có chắc chắn muốn hủy bỏ mọi thay đổi và quay lại linh kiện ban đầu không?",
    () => {
      loadBuildToEdit().then(() =>
        triggerToast("Đã khôi phục cấu hình gốc", "info"),
      );
    },
  );
}

/**
 * SHARED UTILITIES
 */
async function loadUserInfo() {
  const token = localStorage.getItem("token");
  const userBrief = document.getElementById("user-brief");
  const adminNav = document.getElementById("admin-nav-item");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await apiCall("/users/me");
    if (res.code === 1000 && res.result) {
      const u = res.result;
      const displayName = u.username || u.firstname || "Người dùng";
      const init = displayName.substring(0, 1).toUpperCase();
      userBrief.innerHTML = `
                <div class="user-avatar">${init}</div>
                <div class="user-info">
                    <b>${displayName}</b><br>
                    <span>Thành viên</span>
                </div>`;

      const roles = (u.roles || []).map((r) => r.name || r);
      if (adminNav && roles.includes("ADMIN")) {
        adminNav.style.display = "block";
      }
    } else {
      console.error("[Edit-Build] Auth failed:", res.code);
      if (res.code !== 1007) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    }
  } catch (e) {
    console.error("[Edit-Build] User loading error", e);
  }
}

async function apiCall(endpoint, method = "GET", body = null, retryCount = 0) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

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
        return apiCall(endpoint, method, body, retryCount + 1);
      } catch (err) {
        return data;
      }
    }

    return data;
  } catch (e) {
    console.error("[Edit-Build] apiCall Error:", e);
    return { code: 9999, message: "Lỗi kết nối máy chủ" };
  }
}

async function refreshToken() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token to refresh");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (data.code === 1000 && data.result.token) {
      localStorage.setItem("token", data.result.token);
      return data.result.token;
    } else {
      throw new Error("Refresh failed");
    }
  } catch (error) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
    throw error;
  }
}

function triggerToast(msg, type = "success") {
  if (window.showToast) window.showToast(msg, type);
  else alert(msg);
}
