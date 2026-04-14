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

export default function HistorianApplicationPage() {
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>("3");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifyTypeFilter, setVerifyTypeFilter] = useState<string>("");

  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: 3,
    status: "",
    verifyType: "",
  });

  const [tableData, setTableData] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<AppSortColumn>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams({
        search: searchTerm,
        limit: parseInt(limitInput) || 3,
        status: statusFilter,
        verifyType: verifyTypeFilter,
      });
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm, limitInput, statusFilter, verifyTypeFilter]);

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

      // Backend yêu cầu mảng cho các filter này
      if (debouncedParams.status) payload.statuses = [debouncedParams.status];
      if (debouncedParams.verifyType)
        payload.verify_types = [debouncedParams.verifyType];

      const response = await apiGetUserApplications(payload);
      if (response?.status) {
        setTableData(response);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách hồ sơ:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, sortBy, sortOrder]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý hồ sơ Sử gia" />

      <div className="space-y-6">
        <ComponentCard title="Bộ lọc tìm kiếm">
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
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
                <option value="1">Thẻ nhận dạng nhà nghiên cứu</option>
                <option value="2">Bằng cấp</option>
                <option value="3">Chuyên gia</option>
                <option value="4">Khác</option>
              </select>
            </div>

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
                <option value="1">Đang chờ duyệt</option>
                <option value="2">Đã duyệt</option>
                <option value="3">Từ chối</option>
              </select>
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
        onRefresh={fetchApplications} // Tải lại bảng sau khi Admin duyệt
      />
    </div>
  );
}
