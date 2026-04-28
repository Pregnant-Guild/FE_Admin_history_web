import api from "@/config/config";
import { API } from "../../api";
import { Project } from "@/interface/project";
import { CommonResponse, CursorPaginatedResponse, PaginatedResponse } from "@/interface/common";

// ==========================================
// TYPES & INTERFACES (Cơ bản theo logic chuẩn)
// ==========================================

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "created_at" | "updated_at" | "title";
  order?: "asc" | "desc";
  statuses?: string; // comma-separated
  user_ids?: string; // comma-separated
  created_from?: string; // ISO date string
  created_to?: string; // ISO date string
}


export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  status?: "PRIVATE" | "PUBLIC" | "ARCHIVE";
}

export interface AddMemberPayload {
  user_id: string;
  role: "EDITOR" | "VIEWER";
}

export interface UpdateMemberRolePayload {
  role: "EDITOR" | "VIEWER";
}

export interface ChangeOwnerPayload {
  new_owner_id: string;
}

export interface CreateCommitPayload {
  edit_summary: string;
  snapshot_json: number[]; 
}

export interface RestoreCommitPayload {
  commit_id: string;
}

// ==========================================
// 1. NHÓM: QUẢN LÝ DỰ ÁN (PROJECTS)
// ==========================================

export const getProjects = async (params: GetProjectsParams): Promise<PaginatedResponse<Project>> => {
  const response = await api.get(API.Project.GET_ALL, { params });
  return response?.data;
};

export const getProjectDetail = async (id: string): Promise<CommonResponse<Project>> => {
  const response = await api.get(API.Project.GET_DETAIL(id));
  return response?.data;
};

export const updateProject = async (id: string, payload: UpdateProjectPayload): Promise<CommonResponse<Project>> => {
  const response = await api.put(API.Project.UPDATE(id), payload);
  return response?.data;
};

export const deleteProject = async (id: string): Promise<CommonResponse> => {
  const response = await api.delete(API.Project.DELETE(id));
  return response?.data;
};

export const transferProjectOwnership = async (id: string, payload: ChangeOwnerPayload): Promise<CommonResponse> => {
  const response = await api.put(API.Project.CHANGE_OWNER(id), payload);
  return response?.data;
};

// ==========================================
// 2. NHÓM: QUẢN LÝ THÀNH VIÊN (MEMBERS)
// ==========================================

export const addProjectMember = async (id: string, payload: AddMemberPayload): Promise<CommonResponse> => {
  const response = await api.post(API.Project.ADD_MEMBER(id), payload);
  return response?.data;
};

export const updateProjectMemberRole = async (id: string, userId: string, payload: UpdateMemberRolePayload): Promise<CommonResponse> => {
  const response = await api.put(API.Project.UPDATE_MEMBER(id, userId), payload);
  return response?.data;
};

export const removeProjectMember = async (id: string, userId: string): Promise<CommonResponse> => {
  const response = await api.delete(API.Project.REMOVE_MEMBER(id, userId));
  return response?.data;
};

// ==========================================
// 3. NHÓM: LỊCH SỬ BẢN LƯU (COMMITS)
// ==========================================

export const createProjectCommit = async (id: string, payload: CreateCommitPayload): Promise<CommonResponse> => {
  const response = await api.post(API.Project.CREATE_COMMIT(id), payload);
  return response?.data;
};

export const getProjectCommits = async (id: string): Promise<CommonResponse> => { // Assuming it returns a list of commits
  const response = await api.get(API.Project.GET_COMMITS(id));
  return response?.data;
};

export const restoreProjectCommit = async (id: string, payload: RestoreCommitPayload): Promise<CommonResponse> => {
  const response = await api.post(API.Project.RESTORE_COMMIT(id), payload);
  return response?.data;
};

export const getCurrentProject = async (params?: { cursor_id?: string; limit?: number }): Promise<CursorPaginatedResponse<Project>> => {
  const response = await api.get(API.Project.GET_CURRENT_PROJECT, { params });
  return response?.data;
};

// ==========================================
// 4. NHÓM: LẤY DỰ ÁN QUA USER
// ==========================================

export const getUserProjects = async (userId: string, params?: { cursor_id?: string; limit?: number }): Promise<CursorPaginatedResponse<Project>> => {
  const response = await api.get(API.Project.GET_CURRENT_PROJECT, { params });
  return response?.data;
};