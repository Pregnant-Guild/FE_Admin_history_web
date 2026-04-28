"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export type ProjectSortColumn = "created_at" | "updated_at" | "title";

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  project_status: "PRIVATE" | "PUBLIC" | "ARCHIVE";
  owner_id: string;
  created_at: string;
  updated_at: string;
  user:{
    id: string;
    display_name: string;
    email:string;
    avatar_url:string;
  }
}

interface ProjectsTableProps {
  data: ProjectItem[];
  onSort: (column: ProjectSortColumn) => void;
  sortBy?: ProjectSortColumn;
  sortOrder?: "asc" | "desc";
  onUpdate: (item: ProjectItem) => void;
  onDelete: (id: string) => void;
  onTransferOwner: (item: ProjectItem) => void;
  onViewDetails: (id: string) => void; // Để xem commits, members...
}

export default function ProjectsTable({
  data,
  onSort,
  sortBy,
  sortOrder,
  onUpdate,
  onDelete,
  onTransferOwner,
  onViewDetails,
}: ProjectsTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ProjectItem["project_status"]) => {
    switch (status) {
      case "PUBLIC":
        return (
          <Badge size="sm" variant="light" color="success">
            PUBLIC
          </Badge>
        );
      case "PRIVATE":
        return (
          <Badge size="sm" variant="light" color="warning">
            PRIVATE
          </Badge>
        );
      case "ARCHIVE":
        return (
          <Badge size="sm" variant="light" color="light">
            ARCHIVE
          </Badge>
        );
      default:
        return (
          <Badge size="sm" variant="light" color="dark">
            {status}
          </Badge>
        );
    }
  };

  const SortIcon = ({ column }: { column: ProjectSortColumn }) => {
    const isActive = sortBy === column;
    return (
      <div className="flex flex-col ml-2 opacity-50 cursor-pointer hover:opacity-100">
        <svg
          className={`w-3 h-3 ${isActive && sortOrder === "asc" ? "text-blue-700 opacity-100" : "text-gray-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
        <svg
          className={`w-3 h-3 -mt-1 ${isActive && sortOrder === "desc" ? "text-blue-700 opacity-100" : "text-gray-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer select-none" onClick={() => onSort("title")}>
                    Tiêu đề <SortIcon column="title" />
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Trạng thái</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Chủ sở hữu</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer select-none" onClick={() => onSort("created_at")}>
                    Ngày tạo <SortIcon column="created_at" />
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer select-none" onClick={() => onSort("updated_at")}>
                    Cập nhật <SortIcon column="updated_at" />
                  </div>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-center text-gray-500 text-theme-xs dark:text-gray-400 min-w-[200px]">Thao tác</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-theme-sm truncate max-w-[250px]">{item.title}</TableCell>
                    <TableCell className="px-5 py-4 text-start">{getStatusBadge(item.project_status)}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">{item.user?.display_name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-400">{formatDate(item.created_at)}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-400">{formatDate(item.updated_at)}</TableCell>
                    <TableCell className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => onViewDetails(item.id)} title="Chi tiết" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => onUpdate(item)} title="Cập nhật" className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => onTransferOwner(item)} title="Chuyển quyền sở hữu" className="text-green-500 hover:text-green-700 dark:hover:text-green-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button onClick={() => onDelete(item.id)} title="Xóa" className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-20 text-center text-gray-500 italic">
                    Không tìm thấy dự án nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}