"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { responseUserTable, getUserDto } from "@/interface/admin";
import { apiGetListUser } from "@/service/adminService";
import { useEffect, useState, useCallback } from "react";

export type SortColumn = "created_at" | "updated_at" | "display_name" | "email";

export default function UserTable() {
  // --- States cho Pagination ---
  const [limit, setLimit] = useState<number>(5); // Default theo ảnh là 5
  const [limitInput, setLimitInput] = useState<string>("5");
  const [page, setPage] = useState<number>(1);

  // --- States cho Filter (Theo ảnh Swagger) ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authProvider, setAuthProvider] = useState<string>("");
  const [createdFrom, setCreatedFrom] = useState<string>("");
  const [createdTo, setCreatedTo] = useState<string>("");
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);
  
  // Debounced states
  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: 5,
    authProvider: "",
  });

  // --- States cho Table ---
  const [tableData, setTableData] = useState<responseUserTable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortColumn | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 1. Xử lý Debounce cho các ô input text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams({
        search: searchTerm,
        limit: parseInt(limitInput) || 5,
        authProvider: authProvider,
      });
      setPage(1); // Reset về trang 1 khi filter thay đổi
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm, limitInput, authProvider]);

  // 2. Hàm fetch data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: getUserDto = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        auth_provider: debouncedParams.authProvider || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        is_deleted: isDeleted,
        sort: sortBy,
        order: sortOrder,
      };

      const response = await apiGetListUser(payload);
      if (response?.status) {
        setTableData(response);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedParams, createdFrom, createdTo, isDeleted, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (column: SortColumn) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const pagination = tableData?.pagination;

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Bộ lọc tìm kiếm">
          {/* Grid Layout cho các Filter giống Swagger */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="block mb-2 text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {/* Auth Provider */}
            <div>
              <label className="block mb-2 text-sm font-medium">Auth Provider</label>
              <input
                type="text"
                placeholder="google"
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            
            <div>
              <label className="block mb-2 text-sm font-medium">Trạng thái xóa</label>
              <select 
                onChange={(e) => setIsDeleted(e.target.value === "" ? undefined : e.target.value === "true")}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Tất cả</option>
                <option value="false">Hoạt động</option>
                <option value="true">Đã xóa</option>
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block mb-2 text-sm font-medium">Số lượng (Limit)</label>
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title="Danh sách người dùng">
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                <div className="w-10 h-10 border-4 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            )}

            <BasicTableOne 
              data={tableData?.data || []} 
              onSort={handleSort} 
              sortBy={sortBy} 
              sortOrder={sortOrder} 
            />
          </div>

          {/* Phân trang sử dụng data từ API mới */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị trang {pagination?.current_page} / {pagination?.total_pages} ({pagination?.total_records} kết quả)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Trước
              </button>
              <button
                disabled={page >= (pagination?.total_pages || 1) || loading}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sau
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}