export interface MediaDto {
  id: string;
  storage_key: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface ApplicationDto {
  id: string;
  user_id: string;
  // Sửa từ number thành string | number
  verify_type: string | number | string[] | number[]; 
  content: string;
  is_deleted: boolean;
  // Sửa status để nhận cả 1,2,3 hoặc PENDING, APPROVED...
  status: string | number; 
  reviewed_by: string;
  review_note: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at?: string;
  media: any[];
}


export interface GetApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  statuses?: string[];
  verify_types?: string[];
  created_from?: string;
  created_to?: string;
  reviewed_by?: string;
}

export interface ApplicationResponse {
  status: boolean;
  message: string;
  data: ApplicationDto[];
  pagination: {
    current_page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}