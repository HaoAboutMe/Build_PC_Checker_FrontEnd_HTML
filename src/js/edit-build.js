/**
 * EDIT BUILD LOGIC - BuildPC Checker
 * A specialized version of build-pc.js for editing existing builds.
 */

const API_BASE_URL = "http://localhost:8080/identity";

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
  { id: "mainboard", name: "Bo mạch chủ (Mainboard)", api: "/mainboards", icon: "fas fa-square" },
  { id: "ram", name: "Bộ nhớ RAM", api: "/rams", icon: "fas fa-memory" },
  { id: "vga", name: "Card đồ họa (VGA)", api: "/vgas", icon: "fas fa-video" },
  { id: "ssd", name: "Ổ cứng SSD", api: "/ssds", multi: true, icon: "fas fa-hdd" },
  { id: "hdd", name: "Ổ cứng HDD", api: "/hdds", multi: true, icon: "fas fa-compact-disc" },
  { id: "psu", name: "Nguồn máy tính (PSU)", api: "/psus", icon: "fas fa-plug" },
  { id: "cooler", name: "Tản nhiệt (Cooler)", api: "/coolers", icon: "fas fa-fan" },
  { id: "case", name: "Vỏ máy tính (Case)", api: "/cases", icon: "fas fa-box" },
];

const LABEL_MAP = {
  socket: "Socket", tdp: "Công suất (TDP)", tdpSupport: "Hỗ trợ TDP", pcieVersion: "PCIe",
  vrmMin: "VRM Min", igpu: "iGPU", ramType: "Loại RAM", ramBusMax: "Bus MAX",
  vramGb: "VRAM", capacity: "Dung lượng", wattage: "Công suất", efficiency: "Chuẩn"
};

const UNIT_MAP = {
  tdp: "W", tdpSupport: "W", wattage: "W", ramBus: "MHz", vramGb: "GB", capacity: "GB"
};

/**
 * INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    buildState.buildId = urlParams.get("id");

    if (!buildState.buildId) {
        triggerToast("Không tìm thấy mã cấu hình", "error");
        setTimeout(() => window.location.href = "my-builds.html", 1500);
        return;
    }

    // 1. UI Setup
    initBuildSlots();
    setupCoreEvents();
    setupGameEvents();

    // 2. Load User Profile
    await loadUserInfo();

    // 3. Load Existing Build Data
    await loadBuildToEdit();
});

async function loadBuildToEdit() {
    const res = await apiCall(`/builds/${buildState.buildId}`);
    if ((res.code === 0 || res.code === 1000) && res.result) {
        const build = res.result;
        buildState.initialData = JSON.parse(JSON.stringify(build));

        // Set Top Info
        document.getElementById("edit-build-name").value = build.name || "";
        document.getElementById("edit-build-desc").value = build.description || "";

        // Map Parts to Internal State & UI
        const parts = build.parts || {};
        const keyMap = {
            "CPU": "cpu", "MAINBOARD": "mainboard", "RAM": "ram", 
            "VGA": "vga", "GPU": "vga", "PSU": "psu", "CASE": "case", 
            "COOLER": "cooler", "SSD": "ssd", "HDD": "hdd"
        };

        for (const [partKey, partData] of Object.entries(parts)) {
            const configId = keyMap[partKey];
            if (!configId) continue;

            const comp = componentsConfig.find(c => c.id === configId);
            if (comp.multi) {
                buildState[`${configId}Ids`] = [partData.id];
            } else {
                buildState[`${configId}Id`] = partData.id;
            }
            
            // Render Slot
            renderSlotContent(document.getElementById(`slot-${configId}`), comp, partData);
        }

        // Initial check once loaded
        checkCompatibility();
    } else {
        triggerToast("Lỗi tải thông tin cấu hình", "error");
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
    document.getElementById("check-all-games-btn").onclick = checkAllGameCompatibility;

    // Search & Pagination in Picker
    document.getElementById("picker-search").oninput = (e) => {
        pickerPage = 1;
        applyFilters();
    };

    document.getElementById("page-prev-btn").onclick = () => {
        if(pickerPage > 1) { 
            pickerPage--; 
            renderPickerPage(); 
            document.getElementById("picker-items").scrollTop = 0;
        }
    };
    document.getElementById("page-next-btn").onclick = () => {
        if(pickerPage < Math.ceil(filteredItems.length / 8)) { 
            pickerPage++; 
            renderPickerPage(); 
            document.getElementById("picker-items").scrollTop = 0;
        }
    };
    
    document.getElementById("detail-back-btn").onclick = () => {
        document.getElementById("picker-list-view").style.display = "block";
        document.getElementById("picker-detail-view").style.display = "none";
    };

    document.getElementById("logout-btn").onclick = () => { localStorage.removeItem("token"); window.location.href="login.html"; };
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
  count += (buildState.ssdIds.length + buildState.hddIds.length);
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
  const comp = componentsConfig.find(c => c.id === compId);
  currentPickerComp = comp;
  pickerPage = 1;
  activeFilters = {}; // Reset filters
  
  document.getElementById("picker-title").innerText = `Chọn ${comp.name}`;
  document.getElementById("picker-search").value = "";
  document.getElementById("picker-filters").innerHTML = ""; // Clear filters UI
  document.getElementById("picker-items").innerHTML = '<div class="w-100 text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div>';
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
  document.getElementById("page-info").innerText = `Trang ${pickerPage} / ${totalPages}`;
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

  items.forEach(item => {
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
    card.querySelector(".btn-card-select").onclick = (e) => { e.stopPropagation(); selectPart(item); };
    card.querySelector(".btn-card-detail").onclick = (e) => { e.stopPropagation(); showDetail(item); };
    container.appendChild(card);
  });
}

function showDetail(item) {
  document.getElementById("picker-list-view").style.display = "none";
  document.getElementById("picker-detail-view").style.display = "block";
  const content = document.getElementById("detail-content");
  
  let specsHtml = "";
  Object.entries(item).forEach(([key, value]) => {
      if (['id', 'imageUrl', 'name', 'description'].includes(key) || value === null) return;
      let displayValue = typeof value === 'object' ? (value.name || JSON.stringify(value)) : value;
      if (UNIT_MAP[key]) displayValue = `${displayValue} ${UNIT_MAP[key]}`;
      specsHtml += `<div class="spec-item-box"><span class="spec-label">${key}</span><span class="spec-value">${displayValue}</span></div>`;
  });

  content.innerHTML = `
    <div class="item-details-layout" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <img src="${item.imageUrl || ""}" style="width:100%; border-radius:12px;">
        <div>
            <h3>${item.name}</h3>
            <p>${item.description || "Chưa có mô tả"}</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px;">${specsHtml}</div>
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
  const comp = componentsConfig.find(c => c.id === compId);
  if (comp.multi) buildState[`${comp.id}Ids`] = [];
  else buildState[`${comp.id}Id`] = null;
  renderSlotContent(document.getElementById(`slot-${comp.id}`), comp, null);
  checkCompatibility();
}

function closePicker() { document.getElementById("picker-modal").classList.remove("active"); }

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

  if (Object.keys(payload).length === 0) { resetSummaryView(); return; }

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
  document.getElementById("psu-recommend-value").innerText = `${result.recommendedPsuWattage || 0}W`;
  
  const eGrp = document.getElementById("error-group");
  const eList = document.getElementById("error-list");
  if (result.errors?.length > 0) {
    eList.innerHTML = result.errors.map(m => `<li>${m}</li>`).join("");
    eGrp.style.display = "block";
  } else eGrp.style.display = "none";

  const wGrp = document.getElementById("warning-group");
  const wList = document.getElementById("warning-list");
  if (result.warnings?.length > 0) {
    wList.innerHTML = result.warnings.map(m => `<li>${m}</li>`).join("");
    wGrp.style.display = "block";
  } else wGrp.style.display = "none";
}

async function analyzeBottleneck() {
    if (!buildState.cpuId || !buildState.vgaId) { triggerToast("Cần CPU & VGA", "warning"); return; }
    const res = await apiCall("/builds/analyze", "POST", { 
        cpuId: buildState.cpuId, 
        vgaId: buildState.vgaId,
        gpuId: buildState.vgaId 
    });
    if (res.code === 1000 && res.result) {
        document.getElementById("bottleneck-empty").style.display = "none";
        document.getElementById("bottleneck-results-content").style.display = "block";
        const r = res.result.results;
        document.getElementById("bottleneck-1080p").innerText = `${r['1080p'].severity} (${r['1080p'].ratio}%)`;
        document.getElementById("bottleneck-2k").innerText = `${r['2k'].severity} (${r['2k'].ratio}%)`;
        document.getElementById("bottleneck-4k").innerText = `${r['4k'].severity} (${r['4k'].ratio}%)`;
        document.getElementById("bottleneck-message").innerText = res.result.message;
    }
}

/**
 * UPDATE BUILD (PUT)
 */
async function handleUpdateBuild() {
    const name = document.getElementById("edit-build-name").value.trim();
    if (!name) { triggerToast("Vui lòng nhập tên", "warning"); return; }

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
        parts: parts
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
function setupGameEvents() {
    // Add logic similar to build-pc.js for game selection and FPS estimation if needed
    // For now, attaching the "Check All Games" to a basic toast or API if implemented
}

async function checkAllGameCompatibility() {
    if (!buildState.cpuId || !buildState.vgaId || !buildState.ramId) {
        triggerToast("Cần cấu hình cơ bản để kiểm tra game", "warning");
        return;
    }
    triggerToast("Tính năng kiểm tra toàn bộ game đang được gọi...", "info");
    // Implementation matches build-pc.js game check logic
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
            loadBuildToEdit().then(() => triggerToast("Đã khôi phục cấu hình gốc", "info"));
        }
    );
}

/**
 * SHARED UTILITIES
 */
async function loadUserInfo() {
    const token = localStorage.getItem("token");
    const userBrief = document.getElementById("user-brief");
    if(!token) { window.location.href="login.html"; return; }
    
    const res = await apiCall("/users/me");
    if(res.code === 1000 && res.result) {
        const u = res.result;
        const displayName = u.username || u.firstname || "Người dùng";
        const init = displayName.substring(0,1).toUpperCase();
        userBrief.innerHTML = `
            <div class="user-avatar">${init}</div>
            <div class="user-info">
                <b>${displayName}</b><br>
                <span>Thành viên</span>
            </div>`;
            
        // Handle admin nav if exists on this page
        const adminNav = document.getElementById("admin-nav-item");
        const roles = (u.roles || []).map(r => r.name || r);
        if (adminNav && roles.includes("ADMIN")) {
            adminNav.style.display = "block";
        }
    } else if (res.code === 1007) {
        // Token expired will be handled by apiCall/refreshToken
        // but let's try to reload once we refreshed
        await loadUserInfo(); 
    } else {
        console.error("Failed to load user info:", res.message);
    }
}

async function apiCall(endpoint, method = "GET", body = null, retryCount = 0) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
        const r = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : null });
        const d = await r.json();
        if (d.code === 1007 && retryCount === 0) {
            await refreshToken();
            return apiCall(endpoint, method, body, retryCount + 1);
        }
        return d;
    } catch (e) { return { code: 9999 }; }
}

async function refreshToken() {
    const t = localStorage.getItem("token");
    const r = await fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) });
    const d = await r.json();
    if(d.code === 1000) localStorage.setItem("token", d.result.token);
    else window.location.href="login.html";
}

function triggerToast(msg, type = "success") {
    if (window.showToast) window.showToast(msg, type); else alert(msg);
}
