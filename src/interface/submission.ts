export interface getSubmissionPayload {
  created_from: string;
  created_to: string;
  limit: number;
  order: "asc" | "desc";
  page: number;
  search: string;
  sort: "id" | "status" | "created_at" | "reviewed_at";
  project_id: string;
  reviewed_by: string;
  statuses: string[];
  user_ids: string[];
}

export interface updateSubmissionPayload {
  review_note: string;
  status: string;
}


