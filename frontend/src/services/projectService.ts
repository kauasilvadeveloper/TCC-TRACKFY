// src/services/projectService.ts

import { api } from "@/src/services/api";
import { ApiProjeto } from "@/src/types/project";

export const projectService = {
  async getProjects(): Promise<ApiProjeto[]> {
    const response = await api.get<ApiProjeto[]>("/project");
    return response.data;
  },
};
