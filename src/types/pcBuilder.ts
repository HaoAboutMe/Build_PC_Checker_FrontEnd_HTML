export interface BaseComponent {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  brand?: string;
}

export interface CPU extends BaseComponent {
  socketId: string;
  socket?: { id: string; name: string };
  tdp: number;
  coreCount: number;
  threadCount: number;
  baseClock?: string;
  boostClock?: string;
  hasIntegratedGraphics: boolean;
}

export interface Mainboard extends BaseComponent {
  socketId: string;
  socket?: { id: string; name: string };
  ramTypeId: string;
  ramType?: { id: string; name: string };
  ramSlot: number;
  ramMaxCapacity: number;
  sizeId: string;
  size?: { id: string; name: string };
  m2Slot: number;
  sataSlot: number;
  cpuTdpSupport: number;
}

export interface RAM extends BaseComponent {
  ramTypeId: string;
  ramType?: { id: string; name: string };
  ramBus: number;
  capacityPerStick: number;
  stickCount: number;
  casLatency?: string;
}

export interface VGA extends BaseComponent {
  vramGb: number;
  lengthMm: number;
  recommendedPsuWattage: number;
  powerConnector?: string;
  pcieVersion?: string;
}

export interface PSU extends BaseComponent {
  wattage: number;
  efficiencyRating?: string;
  modularType?: string;
}

export interface Storage extends BaseComponent {
  capacity: number;
  formFactor?: string;
  interfaceType?: string;
  readSpeed?: number;
  writeSpeed?: number;
  type: "SSD" | "HDD";
}

export interface Case extends BaseComponent {
  sizeId: string;
  size?: { id: string; name: string };
  maxGpuLength: number;
  maxCpuCoolerHeight: number;
}

export interface Cooler extends BaseComponent {
  coolerType: string;
  radiatorSize?: number;
  heightMm: number;
  tdpSupport: number;
}

export type PCComponent = CPU | Mainboard | RAM | VGA | PSU | Storage | Case | Cooler;

export interface PCBuild {
  id?: string;
  name: string;
  cpu?: CPU;
  mainboard?: Mainboard;
  ram?: RAM;
  vga?: VGA;
  psu?: PSU;
  cooler?: Cooler;
  pcCase?: Case;
  ssds: Storage[];
  hdds: Storage[];
  totalWattage: number;
}
