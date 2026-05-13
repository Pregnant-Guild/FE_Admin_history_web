export interface CommitSimpleResponse {
  id: string;
  edit_summary: string;
}

export interface MemberSimpleResponse {
  user_id: string;
  role: string;
  display_name: string;
  avatar_url: string;
}

export interface SubmissionSimpleResponse {
  id: string;
  status: string;
}

export interface UserSimpleResponse {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  latest_commit_id?: string | null;
  project_status: "PRIVATE" | "PUBLIC" | "ARCHIVE" | string;
  locked_by?: string | null;
  is_deleted: boolean;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;

  user?: UserSimpleResponse | null;

  commits: CommitSimpleResponse[];
  submissions: SubmissionSimpleResponse[];
  members: MemberSimpleResponse[];
}

export interface ProjectsResponse<T = Project> {
  status: boolean;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export interface UpdateProjectPayload {
  title: string;
  description: string;
  status: "PRIVATE" | "PUBLIC" | "ARCHIVE";
}

export interface ChangeOwnerPayload {
  new_owner_id: string;
}

export interface ProjectMemberPayload {
  user_id?: string;
  role: "EDITOR" | "VIEWER" | "ADMIN";
}

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
export interface CreateCommitPayload {
  edit_summary: string;
  snapshot_json: number[]; 
}
export interface RestoreCommitPayload {
  commit_id: string;
}