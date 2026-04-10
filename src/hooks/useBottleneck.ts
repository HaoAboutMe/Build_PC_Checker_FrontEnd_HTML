import { useMutation } from "@tanstack/react-query";
import apiClient from "@/services/api";

export interface BottleneckResult {
  severity: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  message: string;
}

export interface BottleneckResponse {
  "1080p": BottleneckResult;
  "2k": BottleneckResult;
  "4k": BottleneckResult;
}

export const useBottleneck = () => {
  return useMutation({
    mutationFn: async ({ cpuId, vgaId }: { cpuId: string; vgaId: string }) => {
      const response = await apiClient.post("/builds/analyze", {
        cpuId,
        vgaId,
        gpuId: vgaId, // Backend might expect gpuId as well
      });
      return response.data.result.results as BottleneckResponse;
    },
  });
};
