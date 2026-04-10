"use client";

import React from "react";
import styles from "./ComponentDetail.module.css";
import { PCComponent } from "@/types/pcBuilder";

interface ComponentDetailProps {
  item: PCComponent;
  categoryName: string;
  onSelect: () => void;
  onBack: () => void;
}

const EXCLUDED_FIELDS = [
  "id", "imageUrl", "coverImageUrl", "name", "description", 
  "enabled", "deleted", "code", "result", "message", "brand",
  "cpuScore", "gpuScore", "score"
];

const LABEL_MAP: Record<string, string> = {
  socketId: "Socket",
  tdp: "Công suất tiêu thụ (TDP)",
  ramTypeId: "Loại RAM",
  ramType: "Loại RAM",
  ramSlot: "Số khe RAM",
  ramMaxCapacity: "Dung lượng RAM tối đa",
  m2Slot: "Số khe M.2",
  sataSlot: "Số khe SATA",
  vramGb: "Dung lượng VRAM",
  lengthMm: "Chiều dài",
  wattage: "Công suất",
  capacity: "Dung lượng",
  maxGpuLength: "Hỗ trợ VGA tối đa",
  maxCpuCoolerHeight: "Hỗ trợ tản CPU tối đa",
  coolerType: "Loại tản nhiệt",
  pcieVersion: "PCIe",
  vrmMin: "VRM tối thiểu",
  vrmPhase: "Số pha VRM",
  cpuTdpSupport: "Hỗ trợ TDP CPU",
  ramBusMax: "Bus RAM tối đa",
  pcieVgaVersion: "Chuẩn PCIe VGA",
  size: "Kích thước",
  coreCount: "Số nhân",
  threadCount: "Số luồng",
  baseClock: "Xung cơ bản",
  boostClock: "Xung Boost",
  hasIntegratedGraphics: "Có VGA tích hợp",
  stickCount: "Số thanh RAM",
  capacityPerStick: "Dung lượng mỗi thanh",
  ramBus: "Bus RAM",
  ramCas: "Ram Cas",
  casLatency: "Độ trễ CAS",
  quantity: "Số lượng thanh",
  powerConnector: "Đầu cấp nguồn",
  radiatorSize: "Kích thước Radiator",
  heightMm: "Chiều cao",
  readSpeed: "Tốc độ đọc",
  writeSpeed: "Tốc độ ghi",
  interfaceType: "Chuẩn giao tiếp",
  formFactor: "Kích thước",
  efficiencyRating: "Chuẩn hiệu suất",
  modularType: "Chuẩn Modular",
  sizeId: "Kích thước",
  brand: "Thương hiệu",
  sku: "Mã sản phẩm",
  ssdType: "Loại SSD"
};

const UNIT_MAP: Record<string, string> = {
  tdp: "W",
  wattage: "W",
  ramMaxCapacity: "GB",
  vramGb: "GB",
  lengthMm: "mm",
  capacity: "GB",
  capacityPerStick: "GB",
  maxGpuLength: "mm",
  maxCpuCoolerHeight: "mm",
  ramBus: "MHz",
  ramBusMax: "MHz",
  readSpeed: "MB/s",
  writeSpeed: "MB/s",
  heightMm: "mm",
  cpuTdpSupport: "W",
};

export default function ComponentDetail({ item, categoryName, onSelect, onBack }: ComponentDetailProps) {
  
  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "N/A";

    if (key === "vrmMin" || key === "vrmPhase") {
      return `${value} phase`;
    }
    
    let displayValue = value;
    if (typeof value === "object") {
      displayValue = value.name || value.title || JSON.stringify(value);
    } else if (typeof value === "boolean") {
      displayValue = value ? "Có" : "Không";
    }

    if (UNIT_MAP[key] && !isNaN(Number(displayValue))) {
      displayValue = `${displayValue} ${UNIT_MAP[key]}`;
    }

    return displayValue;
  };

  const formatLabel = (key: string) => {
    if (LABEL_MAP[key]) return LABEL_MAP[key];
    const cleanerKey = key.endsWith("Id") ? key.slice(0, -2) : key;
    if (LABEL_MAP[cleanerKey]) return LABEL_MAP[cleanerKey];
    
    const result = cleanerKey.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  return (
    <div className={styles.detailLayout}>
      <div className={styles.visualCol}>
        <div className={styles.imageWrapper}>
          <img src={item.imageUrl || "https://via.placeholder.com/400"} alt={item.name} />
        </div>
        <button className="btn-primary w-100 py-3" onClick={onSelect}>
          Chọn linh kiện này
        </button>
      </div>

      <div className={styles.infoCol}>
        <div className={styles.headerMeta}>
          <span className={styles.categoryBadge}>{categoryName}</span>
          <h2 className={styles.nameHeading}>{item.name}</h2>
        </div>

        <div className={styles.descriptionSection}>
          <h4>Mô tả sản phẩm</h4>
          <div className={styles.descriptionText}>
            {item.description || "Sản phẩm chưa có mô tả chi tiết từ nhà sản xuất."}
          </div>
        </div>
      </div>

      <div className={styles.specsCol}>
        <h4 className={styles.specsHeading}>
          <i className="fas fa-barcode"></i> Thông số kỹ thuật
        </h4>
        <div className={styles.specsGrid}>
          {Object.entries(item).map(([key, value]) => {
            if (EXCLUDED_FIELDS.includes(key) || value === null || value === undefined) return null;
            return (
              <div key={key} className={styles.specItem}>
                <span className={styles.specLabel}>{formatLabel(key)}</span>
                <span className={styles.specValue}>{renderValue(key, value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
