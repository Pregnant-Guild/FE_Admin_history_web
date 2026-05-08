"use client";

import { useEffect, useState, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomDateRangePicker from "@/components/common/CustomDateRangePicker";
import SubmissionsTable, {
  SubmissionItem,
  SubmissionSortColumn,
} from "@/components/tables/SubmissionsTable";
import {
  getSubmissionPayload,
  updateSubmissionPayload,
} from "@/interface/submission";
import { apiGetSubmission, updateProject } from "@/service/submisisonService";
import { LIMIT_ITEM_TABLE } from "../../../../../constant";

const formatDateTimeToISO = (
  dateStr: string,
  timeStr: string,
  isEndOfDay: boolean = false,
): string | undefined => {
  if (!dateStr) return undefined;
  const time = timeStr || (isEndOfDay ? "23:59" : "00:00");
  return `${dateStr}T${time}:00.000000+07:00`;
};

interface SubmissionsResponseData {
  data: SubmissionItem[];
  pagination: {
    current_page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>(
    LIMIT_ITEM_TABLE.toString(),
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [userIdsFilter, setUserIdsFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const [resetKey, setResetKey] = useState<number>(0);

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

  const [tableData, setTableData] = useState<SubmissionsResponseData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<SubmissionSortColumn>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SubmissionItem | null>(null);
  const [updatePayload, setUpdatePayload] = useState<updateSubmissionPayload>({
    review_note: "",
    status: "APPROVED",
  });

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
    setResetKey((prev) => prev + 1);
  };

  const handleDateFilterChange = (
    startD: string,
    endD: string,
    startT: string,
    endT: string,
  ) => {
    setFromDate(startD);
    setToDate(endD);
    setFromTime(startT);
    setToTime(endT);
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

  const fetchSubmissionsData = useCallback(async () => {
    setLoading(true);
    try {
      const payload: Partial<getSubmissionPayload> = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        sort: sortBy,
        order: sortOrder,
        statuses: debouncedParams.statuses
          ? [debouncedParams.statuses]
          : undefined,
        user_ids: debouncedParams.userIds
          ? debouncedParams.userIds
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
          : undefined,
      };

      const createdFrom = formatDateTimeToISO(
        debouncedParams.fromDate,
        debouncedParams.fromTime,
      );
      if (createdFrom) payload.created_from = createdFrom;

      const createdTo = formatDateTimeToISO(
        debouncedParams.toDate,
        debouncedParams.toTime,
        true,
      );
      if (createdTo) payload.created_to = createdTo;

      const response = await apiGetSubmission(payload as getSubmissionPayload);

      if (response?.status && response?.data) {
        setTableData(response.data);
      } else {
        setTableData(null);
      }
    } catch (err) {
      toast.error("Lỗi lấy danh sách bài nộp");
      console.error("Lỗi lấy danh sách bài nộp:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, sortBy, sortOrder]);

  useEffect(() => {
    fetchSubmissionsData();
  }, [fetchSubmissionsData]);

  const handleSort = (column: SubmissionSortColumn) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/submissions/${id}`);
  };

  const handleOpenActionModal = (item: SubmissionItem) => {
    setSelectedItem(item);
    setUpdatePayload({
      status: item.status,
      review_note: "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const response = await updateProject(selectedItem.id, updatePayload);

      if (response?.status) {
        toast.success("Cập nhật thành công!");
        setIsModalOpen(false);
        fetchSubmissionsData();
      } else {
        if (response?.errors && Array.isArray(response.errors)) {
          toast.error(response.errors.message || "Lỗi dữ liệu không hợp lệ");
        } else {
          toast.error(response?.message || "Cập nhật thất bại");
        }
      }
    } catch (error: any) {
      const apiData = error.response?.data;
      if (apiData?.errors && Array.isArray(apiData.errors)) {
        apiData.errors.forEach((err: any) => {
          if (err.message === "review_note is too short (min 10)") {
            toast.error("Nội dung phải có ít nhất 10 ký tự");
          } else {
            toast.error(err.message || "Dữ liệu không hợp lệ");
          }
        });
      } else {
        toast.error("Lỗi hệ thống khi cập nhật");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pagination = tableData?.pagination;

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Submissions" />

      <div className="space-y-6">
        <ComponentCard
          title="Bộ lọc tìm kiếm"
          headerAction={
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 text-xs text-red-500"
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
                placeholder="Tên dự án, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
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
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                ID người dùng
              </label>
              <input
                type="text"
                placeholder="IDs (cách nhau bởi dấu phẩy)"
                value={userIdsFilter}
                onChange={(e) => setUserIdsFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Thời gian
              </label>
              <CustomDateRangePicker
                key={resetKey}
                onFilterChange={handleDateFilterChange}
              />
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

        <ComponentCard title="Danh sách">
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-10 h-10 border-4 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            )}

            <SubmissionsTable
              data={tableData?.data || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onViewDetails={handleViewDetails}
              onActionClick={handleOpenActionModal}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị {pagination?.total_records || 0} bản ghi
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Đánh giá yêu cầu
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={updatePayload.status}
                  onChange={(e) =>
                    setUpdatePayload({
                      ...updatePayload,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú đánh giá (Review Note)
                </label>
                <textarea
                  value={updatePayload.review_note}
                  onChange={(e) =>
                    setUpdatePayload({
                      ...updatePayload,
                      review_note: e.target.value,
                    })
                  }
                  placeholder="Nhập ghi chú phản hồi..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={isSubmitting}
                className="flex items-center px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
