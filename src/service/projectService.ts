import api from "@/config/config";
import { API } from "../../api";
import { ProjectMemberPayload, ChangeOwnerPayload, CreateCommitPayload, GetProjectsParams, Project, RestoreCommitPayload, UpdateProjectPayload } from "@/interface/project";
import { CommonResponse, CursorPaginatedResponse, PaginatedResponse } from "@/interface/common";

export const getProjects = async (params: GetProjectsParams): Promise<PaginatedResponse<Project>> => {
  const response = await api.get(API.Project.GET_ALL, { params });
  return response?.data;
};

export const getProjectDetailByID = async (id: string): Promise<CommonResponse<Project>> => {
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

export const addProjectMember = async (id: string, payload: ProjectMemberPayload): Promise<CommonResponse> => {
  const response = await api.post(API.Project.ADD_MEMBER(id), payload);
  return response?.data;
};

export const updateProjectMemberRole = async (id: string, userId: string, payload: ProjectMemberPayload): Promise<CommonResponse> => {
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

export const getProjectCommits = async (id: string): Promise<CommonResponse> => {
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