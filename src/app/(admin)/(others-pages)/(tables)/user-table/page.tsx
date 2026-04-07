"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { fullDataUser, getUserDto } from "@/interface/admin";
import { apiGetListUser } from "@/service/adminService";
import { useEffect, useState } from "react";

// Trích xuất type sort cho dễ tái sử dụng
export type SortColumn = "created_at" | "updated_at" | "display_name" | "email";

export default function UserTable() {
  const [users, setUsers] = useState<fullDataUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [sortBy, setSortBy] = useState<SortColumn | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const payload: getUserDto = { limit: 10 };
        if (debouncedSearch) payload.search = debouncedSearch;
        if (sortBy) {
          payload.sort = sortBy;
          payload.order = sortOrder;
        }

        const response = await apiGetListUser(payload);
        // console.log("Request Payload:", payload);
        // console.log("API Response:", response);
        if (response && response.data) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Lỗi:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [debouncedSearch, sortBy, sortOrder]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Users Table" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách người dùng">
          {/* Ô nhập tìm kiếm */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] transition-opacity">
                <div className="flex flex-col items-center">
                  {/* Spinner xoay tròn */}
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Đang tải...
                  </p>
                </div>
              </div>
            )}

            {/* Bảng vẫn hiển thị ở dưới (mờ đi) hoặc ẩn tùy bạn, 
                nhưng truyền data vào để tránh giật lag layout */}
            <BasicTableOne
              data={users}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
