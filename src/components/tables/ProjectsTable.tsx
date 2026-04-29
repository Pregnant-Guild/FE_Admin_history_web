"use client";

import Image from "next/image";
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
  user: {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string;
  };
  members?: {
    user_id: string;
    role: string;
    display_name: string;
    avatar_url: string;
  }[];
}

interface ProjectsTableProps {
  data: ProjectItem[];
  onSort: (column: ProjectSortColumn) => void;
  sortBy?: ProjectSortColumn;
  sortOrder?: "asc" | "desc";
  onViewDetails: (id: string) => void;
}

export default function ProjectsTable({
  data,
  onSort,
  sortBy,
  sortOrder,
  onViewDetails,
}: ProjectsTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `Updated on ${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
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

  const SortButton = ({
    column,
    label,
  }: {
    column: ProjectSortColumn;
    label: string;
  }) => {
    const isActive = sortBy === column;
    return (
      <button
        onClick={() => onSort(column)}
        className={`w-20 text-sm font-medium text-left hover:text-blue-500 transition-colors ${
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label} {isActive && (sortOrder === "asc" ? "↑" : "↓")}
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0d1117] min-w-[700px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161b22]">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-40">
        </span>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 w-20">
            Sắp xếp:
          </span>
          <SortButton column="title" label="Tên" />
          <SortButton column="created_at" label="Ngày tạo" />
          <SortButton column="updated_at" label="Cập nhật" />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col p-5 md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors"
            >
              <div className="flex-1 pr-4 max-w-full md:max-w-[75%]">
                <div
                  onClick={() => onViewDetails(item.id)}
                  className="flex items-center gap-2 mb-2 cursor-pointer hover:underline"
                >
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    {item.user?.avatar_url ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800">
                        <Image
                          src={item.user.avatar_url}
                          alt="avatar"
                          fill 
                          className="object-cover rounded-full" 
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 leading-none">
                          {item.user?.display_name?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center max-w-[250px]">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300 truncate">
                      {item.user?.display_name || "Unknown"}
                    </span>
                  </div>

                  <span className="text-lg text-gray-400 dark:text-gray-600 shrink-0">
                    /
                  </span>

                  <h3 className="text-lg font-semibold text-blue-600 dark:text-[#58a6ff] truncate max-w-[300px]">
                    {item.title}
                  </h3>

                  <div className="shrink-0 w-20 flex justify-start">
                    {getStatusBadge(item.project_status)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-[#8b949e] h-5">
                  <span>{formatDate(item.updated_at)}</span>
                </div>
              </div>

              <div className="flex items-center mt-4 md:mt-0 w-[120px] justify-end shrink-0">
                <div className="flex -space-x-2 overflow-hidden">
                  {item.members && item.members.length > 0 ? (
                    <>
                      {item.members.slice(0, 4).map((m, index) =>
                        m.avatar_url ? (
                          <Image
                            key={index}
                            src={m.avatar_url}
                            alt={m.display_name}
                            width={32}
                            height={32}
                            title={m.display_name}
                            className="inline-block w-8 h-8 rounded-full object-cover ring-2 ring-white group-hover:ring-gray-50 dark:ring-[#0d1117] dark:group-hover:ring-[#161b22] transition-colors"
                          />
                        ) : (
                          <div
                            key={index}
                            title={m.display_name}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white group-hover:ring-gray-50 dark:ring-[#0d1117] dark:group-hover:ring-[#161b22] transition-colors"
                          >
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                              {m.display_name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        ),
                      )}

                      {item.members.length > 4 && (
                        <div
                          title="Những người khác"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-white group-hover:ring-gray-50 dark:ring-[#0d1117] dark:group-hover:ring-[#161b22] transition-colors z-10"
                        >
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            +{item.members.length - 4}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-600 italic"></span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 italic">
            Không tìm thấy dự án nào
          </div>
        )}
      </div>
    </div>
  );
}
