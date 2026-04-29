"use client";

import { useEffect, useState, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { toast } from "sonner";
import ProjectsTable, {
  ProjectItem,
  ProjectSortColumn,
} from "@/components/tables/ProjectsTable";

import {
  getProjects,
  updateProject,
  deleteProject,
  transferProjectOwnership,
} from "@/service/projectService";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { LIMIT_ITEM_TABLE } from "../../../../../../constant";
import { ProjectsResponse } from "@/interface/project";

const formatDateTimeToISO = (
  dateStr: string,
  timeStr: string,
  isEndOfDay: boolean = false,
): string | undefined => {
  if (!dateStr) return undefined;
  const time = timeStr || (isEndOfDay ? "23:59" : "00:00");
  return `${dateStr}T${time}:00.000000+07:00`;
};

export default function ProjectsPage(_props: {
  params: unknown;
  searchParams: unknown;
}) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>(
    LIMIT_ITEM_TABLE.toString(),
  );

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [userIdsFilter, setUserIdsFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: LIMIT_ITEM_TABLE,
    statuses: "",
    userIds: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
  });

  const [tableData, setTableData] = useState<ProjectsResponse<ProjectItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<ProjectSortColumn>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setUserIdsFilter("");
    setLimitInput(LIMIT_ITEM_TABLE.toString());
    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");
    setPage(1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams({
        search: searchTerm,
        limit: parseInt(limitInput) || LIMIT_ITEM_TABLE,
        statuses: statusFilter,
        userIds: userIdsFilter,
        fromDate,
        fromTime,
        toDate,
        toTime,
      });
      setPage(1);
    }, 100);
    return () => clearTimeout(handler);
  }, [
    searchTerm,
    limitInput,
    statusFilter,
    userIdsFilter,
    fromDate,
    fromTime,
    toDate,
    toTime,
  ]);

  const fetchProjectsData = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        sort: sortBy,
        order: sortOrder,
        statuses: debouncedParams.statuses || undefined,
        user_ids: debouncedParams.userIds || undefined,
      };

      const createdFrom = formatDateTimeToISO(debouncedParams.fromDate, debouncedParams.fromTime);
      if (createdFrom) payload.created_from = createdFrom;
      const createdTo = formatDateTimeToISO(debouncedParams.toDate, debouncedParams.toTime, true);
      if (createdTo) payload.created_to = createdTo;
      
      const response = await getProjects(payload);

      if (response?.status) {
        setTableData(response as unknown as ProjectsResponse<ProjectItem>);
      }
    } catch (err) {
      toast.error("Lỗi lấy danh sách dự án");
      console.error("Lỗi lấy danh sách dự án:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, sortBy, sortOrder]);

  useEffect(() => {
    fetchProjectsData();
  }, [fetchProjectsData]);

  const handleSort = (column: ProjectSortColumn) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };


  const handleViewDetails = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const pagination = tableData?.pagination;

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý dự án" />

      <div className="space-y-6">
        <ComponentCard
          title="Bộ lọc tìm kiếm"
          headerAction={
            <button onClick={handleReset} className="flex items-center px-3 py-1.5 text-xs text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <input type="text" placeholder="Tên dự án, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg cursor-pointer outline-none focus:border-brand-500">
              <option value="">Tất cả trạng thái</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
              <option value="ARCHIVE">ARCHIVE</option>
            </select>
            <input type="text" placeholder="IDs người dùng (cách nhau bởi dấu phẩy)" value={userIdsFilter} onChange={(e) => setUserIdsFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
            <div className="flex gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
              <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
            </div>
            <div className="flex gap-2">
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
              <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
            </div>
            <input type="number" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500" />
          </div>
        </ComponentCard>

        <ComponentCard
          title="Danh sách dự án"
        >
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-10 h-10 border-4 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            )}

            <ProjectsTable
              data={tableData?.data || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              
              onViewDetails={handleViewDetails}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị {pagination?.total_records || 0} dự án
            </p>

            {pagination && pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}