"use client";

import { useEffect, useState, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import Swal from "sweetalert2";

import ApplicationTable, {
  AppSortColumn,
} from "@/components/tables/ApplicationTable";
import { apiGetUserApplications } from "@/service/historianService";
import {
  ApplicationDto,
  ApplicationResponse,
  GetApplicationsParams,
} from "@/interface/historian";
import ApplicationDetailModal from "@/components/tables/ApplicationDetailModal";
import { LIMIT_ITEM_TABLE } from "../../../../../../constant";
import { toast } from "sonner";

const formatDateTimeToISO = (
  dateStr: string,
  timeStr: string,
  isEndOfDay: boolean = false,
): string | undefined => {
  if (!dateStr) return undefined;

  const time = timeStr || (isEndOfDay ? "23:59" : "00:00");

  return `${dateStr}T${time}:00.000000+07:00`;
};

export default function HistorianApplicationPage() {
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>(
    LIMIT_ITEM_TABLE.toString(),
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifyTypeFilter, setVerifyTypeFilter] = useState<string>("");

  const [fromDate, setFromDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: LIMIT_ITEM_TABLE,
    status: "",
    verifyType: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
  });

  const [tableData, setTableData] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<AppSortColumn>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setVerifyTypeFilter("");
    setLimitInput(LIMIT_ITEM_TABLE.toString());

    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");

    setPage(1);

    setDebouncedParams({
      search: "",
      limit: LIMIT_ITEM_TABLE,
      status: "",
      verifyType: "",
      fromDate: "",
      fromTime: "",
      toDate: "",
      toTime: "",
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams({
        search: searchTerm,
        limit: parseInt(limitInput) || LIMIT_ITEM_TABLE,
        status: statusFilter,
        verifyType: verifyTypeFilter,
        fromDate,
        fromTime,
        toDate,
        toTime,
      });
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [
    searchTerm,
    limitInput,
    statusFilter,
    verifyTypeFilter,
    fromDate,
    fromTime,
    toDate,
    toTime,
  ]);

  useEffect(() => {
    fetchApplications();
  }, [
    page,
    debouncedParams,
    sortBy,
    sortOrder,
  ]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const payload: GetApplicationsParams = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        sort: sortBy,
        order: sortOrder,
      };

      if (debouncedParams.status) payload.statuses = [debouncedParams.status];
      if (debouncedParams.verifyType)
        payload.verify_types = debouncedParams.verifyType;

      const createdFrom = formatDateTimeToISO(
        debouncedParams.fromDate,
        debouncedParams.fromTime,
        false,
      );
      if (createdFrom) payload.created_from = createdFrom;

      const createdTo = formatDateTimeToISO(
        debouncedParams.toDate,
        debouncedParams.toTime,
        true,
      );
      if (createdTo) payload.created_to = createdTo;

      // console.log("Payload sent to API:", payload);

      const response = await apiGetUserApplications(payload);
      if (response?.status) {
        setTableData(response);
      }
    } catch (err) {
      toast.error("Lỗi lấy danh sách hồ sơ");
      console.error("Lỗi lấy danh sách hồ sơ:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, sortBy, sortOrder]);

  const handleSort = (column: AppSortColumn) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleViewDetail = (app: ApplicationDto) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const pagination = tableData?.pagination;

  // console.log(tableData)
  // console.log("Pagination info:", pagination);
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý hồ sơ" />

      <div className="space-y-6">
        <ComponentCard
          title="Bộ lọc tìm kiếm"
          headerAction={
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 text-xs  text-red-500 transition-colors border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Tìm kiếm</label>
              <input
                type="text"
                placeholder="ID, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
            </div>

            {/* CẬP NHẬT: Loại xác minh */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Loại xác minh
              </label>
              <select
                value={verifyTypeFilter}
                onChange={(e) => setVerifyTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg cursor-pointer outline-none focus:border-brand-500"
              >
                <option value="">Tất cả</option>
                <option value="ID_CARD">Thẻ nhận dạng nhà nghiên cứu</option>
                <option value="EDUCATION">Bằng cấp</option>
                <option value="EXPERT">Chuyên gia</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {/* CẬP NHẬT: Trạng thái */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg cursor-pointer outline-none focus:border-brand-500"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Đang chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Từ ngày</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
                />
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Đến ngày</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
                />
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Hiển thị (Limit)
              </label>
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Danh sách hồ sơ">
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-10 h-10 border-4 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            )}

            <ApplicationTable
              data={tableData?.data || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onViewDetail={handleViewDetail}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị {pagination?.total_records || 0} hồ sơ
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

      <ApplicationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={selectedApp || null}
        onRefresh={fetchApplications}
      />
    </div>
  );
}