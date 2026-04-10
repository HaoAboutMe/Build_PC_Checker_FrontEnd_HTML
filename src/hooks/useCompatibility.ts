import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import { PCBuild } from "@/types/pcBuilder";

export const useCompatibility = (build: PCBuild) => {
  const partsCount = [
    build.cpu,
    build.mainboard,
    build.ram,
    build.vga,
    build.psu,
    build.cooler,
    build.pcCase,
    ...build.ssds,
    ...build.hdds,
  ].filter(Boolean).length;

  return useQuery({
    queryKey: ["compatibility", build],
    queryFn: async () => {
      const payload: any = {};
      if (build.cpu) payload.cpuId = build.cpu.id;
      if (build.mainboard) payload.mainboardId = build.mainboard.id;
      if (build.ram) payload.ramId = build.ram.id;
      if (build.vga) payload.vgaId = build.vga.id;
      if (build.psu) payload.psuId = build.psu.id;
      if (build.cooler) payload.coolerId = build.cooler.id;
      if (build.pcCase) payload.caseId = build.pcCase.id;
      
      if (build.ssds.length > 0) payload.ssdIds = build.ssds.map(s => s.id);
      if (build.hdds.length > 0) payload.hddIds = build.hdds.map(h => h.id);

      if (Object.keys(payload).length === 0) return null;

      const response = await apiClient.post("/builds/check-compatibility", payload);
      return response.data.result;
    },
    enabled: partsCount > 0,
    staleTime: 0, // Always fresh for compatibility
  });
};
