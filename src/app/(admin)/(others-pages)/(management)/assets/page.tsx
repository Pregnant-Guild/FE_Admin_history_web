"use client";

import { useEffect, useState, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import { toast } from "sonner";
import MediaTable, {
  MediaItem,
  MediaSortColumn,
} from "@/components/tables/MediaTable";
import { LIMIT_ITEM_TABLE } from "../../../../../../constant";
import { deleteMedia, deleteMediaById, getMedia } from "@/service/mediaService";
import { URL_MEDIA } from "../../../../../../api";
import Swal from "sweetalert2";

const formatDateTimeToISO = (
  dateStr: string,
  timeStr: string,
  isEndOfDay: boolean = false,
): string | undefined => {
  if (!dateStr) return undefined;
  const time = timeStr || (isEndOfDay ? "23:59" : "00:00");
  return `${dateStr}T${time}:00.000000+07:00`;
};

export interface MediaResponse {
  status: boolean;
  message: string;
  data: MediaItem[];
  pagination: {
    current_page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
  };
}

export default function AssetsPage() {
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>(
    LIMIT_ITEM_TABLE.toString(),
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [mimeTypeFilter, setMimeTypeFilter] = useState<string>("");

  const [fromDate, setFromDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: LIMIT_ITEM_TABLE,
    mimeType: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
  });

  const [tableData, setTableData] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [sortBy, setSortBy] = useState<MediaSortColumn>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // State quản lý checkbox & logic View (Yêu cầu 1 & 3)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(-1); // Dùng cho thư viện xem ảnh
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  const handleReset = () => {
    setSearchTerm("");
    setMimeTypeFilter("");
    setLimitInput(LIMIT_ITEM_TABLE.toString());
    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");
    setPage(1);
    setSelectedIds([]);

    setDebouncedParams({
      search: "",
      limit: LIMIT_ITEM_TABLE,
      mimeType: "",
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
        mimeType: mimeTypeFilter,
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
    mimeTypeFilter,
    fromDate,
    fromTime,
    toDate,
    toTime,
  ]);

  useEffect(() => {
    fetchMediaData();
  }, [page, debouncedParams, sortBy, sortOrder]);

  const fetchMediaData = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        sort: sortBy,
        order: sortOrder,
      };

      if (debouncedParams.mimeType)
        payload.mime_type = debouncedParams.mimeType;
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

      const response = await getMedia(payload);
      if (response?.status) {
        setTableData(response);
      }
    } catch (err) {
      toast.error("Lỗi lấy danh sách tệp tin");
      console.error("Lỗi lấy danh sách tệp tin:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, sortBy, sortOrder]);

  const handleSort = (column: MediaSortColumn) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // --- LOGIC YÊU CẦU 1: Chọn nhiều ---
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked && tableData) {
      setSelectedIds(tableData.data.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleItemSelection = (id: string) => {
    handleToggleSelect(id);
  };

  const handleDeleteMulti = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa ${selectedIds.length} tệp đã chọn? Hành động này không thể hoàn tác!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280", 
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true, 
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteMedia(selectedIds);
        if (response?.status) {
          await Swal.fire({
            title: "Đã xóa!",
            text: `Đã xóa thành công ${selectedIds.length} tệp tin.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
            timer: 2000,
          });
          setSelectedIds([]);
          fetchMediaData();
        } else {
          toast.error(response?.message || "Xóa tệp thất bại");
        }
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi xóa");
        console.error(error);
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    const result = await Swal.fire({
      title: "Xóa tệp tin?",
      text: "Bạn có chắc chắn muốn xóa tệp này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Quay lại",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteMediaById(id);
        if (response?.status) {
          await Swal.fire({
            title: "Thành công!",
            text: "Tệp tin đã được xóa bỏ.",
            icon: "success",
            confirmButtonColor: "#3b82f6",
            timer: 1500,
          });
          setSelectedIds((prev) => prev.filter((i) => i !== id));
          fetchMediaData();
        } else {
          toast.error(response?.message || "Không thể xóa tệp");
        }
      } catch (error) {
        toast.error("Lỗi hệ thống khi xóa");
        console.error(error);
      }
    }
  };

  const handleItemClick = (item: MediaItem, idx: number) => {
    const isImage = item.mime_type.includes("image");

    if (isSelectionMode) {
      toggleItemSelection(item.id);
    } else {
      if (isImage) {
        setIndex(idx);
      } else {
        const fileUrl = `${URL_MEDIA}${item.storage_key}`;
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        window.open(googleDocsUrl, "_blank");
      }
    }
  };

  const pagination = tableData?.pagination;

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý tệp tin (Assets)" />

      <div className="space-y-6">
        <ComponentCard
          title="Bộ lọc tìm kiếm"
          headerAction={
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 text-xs text-red-500 transition-colors border-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20"
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
                placeholder="Tên tệp, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Loại tệp</label>
              <select
                value={mimeTypeFilter}
                onChange={(e) => setMimeTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-lg cursor-pointer outline-none focus:border-brand-500"
              >
                <option value="">Tất cả</option>
                <option value="image">Hình ảnh (webp, jpeg, png...)</option>
                <option value="application/pdf">PDF</option>
                <option value="application/msword">Word (doc, docx)</option>
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

        <ComponentCard
          title="Danh sách tệp tin"
          headerAction={
            <button
              onClick={handleDeleteMulti}
              disabled={selectedIds.length === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                selectedIds.length > 0
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600 shadow-sm cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              Xóa {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          }
        >
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
                <div className="w-10 h-10 border-4 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            )}

            <MediaTable
              data={tableData?.data || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onViewSingle={handleItemClick}
              onDeleteSingle={handleDeleteSingle}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị {pagination?.total_records || 0} tệp tin
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
