"use client";

import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";

export type SubmissionSortColumn = "id" | "status" | "created_at" | "reviewed_at";

export interface SubmissionItem {
  id: string;
  project_id: string;
  commit_id: string;
  user_id: string;
  created_at: string;
  status: string;
  project_title: string;
  project_description: string;
  content?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_note?: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
  };
  reviewer?: {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface SubmissionsTableProps {
  data: SubmissionItem[];
  onSort: (column: SubmissionSortColumn) => void;
  sortBy?: SubmissionSortColumn;
  sortOrder?: "asc" | "desc";
  onViewDetails: (id: string) => void;
  onActionClick: (item: SubmissionItem) => void;
}

export default function SubmissionsTable({
  data,
  onSort,
  sortBy,
  sortOrder,
  onViewDetails,
  onActionClick,
}: SubmissionsTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "SUCCESS":
        return (
          <Badge size="sm" variant="light" color="success">
            {status}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge size="sm" variant="light" color="warning">
            {status}
          </Badge>
        );
      case "REJECTED":
      case "FAILED":
        return (
          <Badge size="sm" variant="light" color="error">
            {status}
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
    align = "left",
  }: {
    column: SubmissionSortColumn;
    label: string;
    align?: "left" | "right" | "center";
  }) => {
    const isActive = sortBy === column;
    // Căn lề chuẩn xác cho text và icon bên trong button
    const alignClass =
      align === "right"
        ? "justify-end text-right ml-auto"
        : align === "center"
        ? "justify-center text-center mx-auto"
        : "justify-start text-left";

    return (
      <button
        onClick={() => onSort(column)}
        className={`text-sm font-medium hover:text-blue-500 transition-colors flex items-center gap-1 w-full ${alignClass} ${
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {isActive && (
          <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
        )}
      </button>
    );
  };

  const AvatarWithTooltip = ({
    user,
  }: {
    user?: { display_name: string; avatar_url?: string };
  }) => {
    if (!user) return <span className="text-gray-400 text-xs italic">-</span>;

    return (
      <div className="group/avatar relative flex justify-center items-center">
        <div className="w-8 h-8 shrink-0 flex items-center justify-center cursor-default">
          {user.avatar_url ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 ring-2 ring-transparent group-hover/avatar:ring-blue-100 dark:group-hover/avatar:ring-blue-900 transition-all">
              <Image
                src={user.avatar_url}
                alt="avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 ring-2 ring-transparent group-hover/avatar:ring-blue-100 dark:group-hover/avatar:ring-blue-900 transition-all">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-300 leading-none">
                {user.display_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>

        <div className="invisible opacity-0 group-hover/avatar:visible group-hover/avatar:opacity-100 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-lg shadow-xl whitespace-normal border border-gray-100 dark:border-gray-700 transition-all duration-200">
          {user.display_name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="">

          <div className="flex items-center px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#161b22]">
            <div className="w-[220px] shrink-0 pr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tên
              </span>
            </div>

            <div className="flex-1 min-w-[150px] pr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Dự án
              </span>
            </div>

            <div className="w-[120px] shrink-0">
              <SortButton column="status" label="Trạng thái" />
            </div>

            <div className="w-[180px] shrink-0 pr-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ghi chú
              </span>
            </div>

            <div className="w-[140px] shrink-0">
              <SortButton column="reviewed_at" label="Cập nhật" align="right" />
            </div>

            <div className="w-[100px] shrink-0 text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Người duyệt
              </span>
            </div>

            <div className="w-[140px] shrink-0">
              <SortButton column="created_at" label="Ngày tạo" align="right" />
            </div>

            <div className="w-[100px] shrink-0 text-right">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Thao tác
              </span>
            </div>
          </div>

          {/* =========== BODY =========== */}
          <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
            {data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col p-5 md:flex-row md:items-center hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors gap-3 md:gap-0"
                >
                  <div className="w-[220px] shrink-0 pr-4 flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      {item.user?.avatar_url ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image
                            src={item.user.avatar_url}
                            alt="avatar"
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-300 leading-none">
                            {item.user?.display_name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">
                      {item.user?.display_name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-[150px] pr-4 flex items-center">
                    <div
                      onClick={() => onViewDetails(item.id)}
                      className="flex flex-col cursor-pointer hover:underline min-w-0"
                    >
                      <h3 className="text-[14px] font-semibold text-blue-600 dark:text-[#58a6ff] truncate">
                        {item.project_title}
                      </h3>
                      <span className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {item.id.split("-")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="w-[120px] shrink-0 flex items-center justify-start">
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="w-[180px] shrink-0 pr-4 flex items-center">
                    <div className="group/note relative text-xs text-gray-500 dark:text-gray-400">
                      <div className="truncate cursor-default">
                        {item.review_note || "-"}
                      </div>

                      {item.review_note && (
                        <div className="invisible opacity-0 group-hover/note:visible group-hover/note:opacity-100 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] p-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-lg shadow-xl whitespace-normal break-words border border-gray-100 dark:border-gray-700 transition-all duration-200">
                          {item.review_note}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white dark:border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-[140px] shrink-0 flex items-center justify-end text-right text-xs text-gray-500 dark:text-[#8b949e]">
                    <span>{formatDate(item.reviewed_at)}</span>
                  </div>

                  <div className="w-[100px] shrink-0 flex items-center justify-center">
                    <AvatarWithTooltip user={item.reviewer} />
                  </div>

                  <div className="w-[140px] shrink-0 flex items-center justify-end text-right text-xs text-gray-500 dark:text-[#8b949e]">
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  <div className="w-[100px] shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => onActionClick(item)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Đánh giá
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400 italic">
                Không tìm thấy yêu cầu nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}