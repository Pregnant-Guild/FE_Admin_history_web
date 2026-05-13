export interface ErrorResponse {
  failed_field: string;
  tag: string;
  value: string;
  message: string;
}

export interface CommonResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
  errors?: ErrorResponse[]; // Or a more specific error type
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
  errors?: ErrorResponse[];
}

export interface CursorPaginatedResponse<T> {
  status: boolean;
  message: string;
  data: {
    items: T[];
    next_cursor_id?: string;
  };
  errors?: ErrorResponse[];
}