import { Profile, UserRole } from "@/interface/user";

export interface getUserDto {
  cursor?: string;
  limit: number;
  is_deleted?: boolean;
  order?: "asc" | "desc";
  role_ids?: string[];
  search?: string;  
  sort?: "created_at" | "updated_at" | "display_name" | "email";
}

export interface fullDataUser {
  auth_provider: string;
  id: string;
  email: string;
  google_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  password_hash: string;
  roles: UserRole[];
  profile: Profile;
  token_version: number;
}