import { create } from "zustand";
import { CPU, Mainboard, RAM, VGA, PSU, Storage, Case, Cooler, PCBuild } from "@/types/pcBuilder";

interface BuildState {
  currentBuild: PCBuild;
  
  // Actions
  setComponent: (category: string, component: any) => void;
  removeComponent: (category: string, id?: string) => void;
  resetBuild: () => void;
  
  // Totals
  calculateTotals: () => void;
}

const initialBuild: PCBuild = {
  name: "Cấu hình mới",
  ssds: [],
  hdds: [],
  totalWattage: 0,
};

export const useBuildStore = create<BuildState>((set, get) => ({
  currentBuild: initialBuild,

  setComponent: (category, component) => {
    set((state) => {
      const newBuild = { ...state.currentBuild };
      
      switch (category) {
        case "cpu": newBuild.cpu = component as CPU; break;
        case "mainboard": newBuild.mainboard = component as Mainboard; break;
        case "ram": newBuild.ram = component as RAM; break;
        case "vga": newBuild.vga = component as VGA; break;
        case "psu": newBuild.psu = component as PSU; break;
        case "cooler": newBuild.cooler = component as Cooler; break;
        case "case": newBuild.pcCase = component as Case; break;
        case "ssd": 
          if (!newBuild.ssds.find(s => s.id === component.id)) {
            newBuild.ssds = [...newBuild.ssds, component as Storage];
          }
          break;
        case "hdd":
          if (!newBuild.hdds.find(h => h.id === component.id)) {
            newBuild.hdds = [...newBuild.hdds, component as Storage];
          }
          break;
      }
      
      return { currentBuild: newBuild };
    });
    get().calculateTotals();
  },

  removeComponent: (category, id) => {
    set((state) => {
      const newBuild = { ...state.currentBuild };
      
      switch (category) {
        case "cpu": delete newBuild.cpu; break;
        case "mainboard": delete newBuild.mainboard; break;
        case "ram": delete newBuild.ram; break;
        case "vga": delete newBuild.vga; break;
        case "psu": delete newBuild.psu; break;
        case "cooler": delete newBuild.cooler; break;
        case "case": delete newBuild.pcCase; break;
        case "ssd": newBuild.ssds = newBuild.ssds.filter(s => s.id !== id); break;
        case "hdd": newBuild.hdds = newBuild.hdds.filter(h => h.id !== id); break;
      }
      
      return { currentBuild: newBuild };
    });
    get().calculateTotals();
  },

  resetBuild: () => {
    set({ currentBuild: initialBuild });
  },

  calculateTotals: () => {
    const { currentBuild } = get();
    let wattage = 0;

    const components = [
      currentBuild.cpu, 
      currentBuild.mainboard, 
      currentBuild.ram, 
      currentBuild.vga, 
      currentBuild.psu, 
      currentBuild.cooler, 
      currentBuild.pcCase,
      ...currentBuild.ssds,
      ...currentBuild.hdds
    ];

    components.forEach(comp => {
      if (comp) {
        // Wattage logic (CPU TDP + VGA TDP + etc.)
        if ('tdp' in comp) wattage += (comp as any).tdp || 0;
        else if ('wattage' in comp && (comp as any).type !== 'PSU') wattage += (comp as any).wattage || 0;
      }
    });

    set((state) => ({
      currentBuild: {
        ...state.currentBuild,
        totalWattage: wattage
      }
    }));
  }
}));
