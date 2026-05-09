export interface StatisticResponse {
  id: string;
  date: string;
  total_users: number;
  total_projects: number;
  total_commits: number;
  total_submissions: number;
  total_medias: number;
  total_wikis: number;
  total_entities: number;
  total_geometries: number;
  total_storage_bytes: number;
  new_users: number;
  new_projects: number;
  new_commits: number;
  new_submissions: number;
  new_medias: number;
  new_wikis: number;
  new_entities: number;
  new_geometries: number;
  new_storage_bytes: number;
  created_at: string;
}

export interface GetStatisticsParams {
  start_date?: string;
  end_date?: string;
}
