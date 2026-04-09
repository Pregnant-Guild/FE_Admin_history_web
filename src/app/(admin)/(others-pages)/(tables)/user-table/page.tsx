"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Swal from "sweetalert2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import ChangeRoleModal from "@/components/tables/ChangeRoleModal";
import UserDetailModal from "@/components/tables/UserDetailModal";
import { responseUserTable, getUserDto, fullDataUser } from "@/interface/admin";
import {
  apiDeleteUser,
  apiGetAllRole,
  apiGetListUser,
  apiRestoreUser,
} from "@/service/adminService";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/tables/Pagination";

export type SortColumn = "created_at" | "updated_at" | "display_name" | "email";

export default function UserTable() {
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>("5");

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authProvider, setAuthProvider] = useState<string>("");
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

  const [selectedUser, setSelectedUser] = useState<fullDataUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<fullDataUser | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: 5,
    authProvider: "",
  });

  const [tableData, setTableData] = useState<responseUserTable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortColumn | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiGetAllRole();
        if (res?.status) {
          setRoles(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách role:", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams({
        search: searchTerm,
        limit: parseInt(limitInput) || 5,
        authProvider: authProvider,
      });
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm, limitInput, authProvider]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: getUserDto = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        auth_provider: debouncedParams.authProvider || undefined,
        is_deleted: isDeleted,
        sort: sortBy,
        order: sortOrder,
        role_ids: selectedRole ? [selectedRole] : undefined,
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
  }, [page, debouncedParams, isDeleted, sortBy, sortOrder, selectedRole]);

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

  const handleOpenDetail = (user: fullDataUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleOpenRoleModal = (user: fullDataUser) => {
    setRoleUser(user);
    setIsRoleModalOpen(true);
  };

  const handleDelete = async (user: fullDataUser) => {
    const result = await Swal.fire({
      title: "Xác nhận khóa?",
      text: `Bạn có chắc muốn khóa người dùng ${user.profile?.display_name || user.email}?`,
      icon: "warning",
      showCancelButton: true,
      showCloseButton: true, 
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý, khóa!",
      cancelButtonText: "Hủy",
      reverseButtons: true, 
    });

    if (result.isConfirmed) {
      try {
        await apiDeleteUser(user.id);
        Swal.fire(
          "Đã khóa!",
          "Người dùng đã bị tạm dừng hoạt động.",
          "success",
        );
        fetchUsers();
      } catch (err) {
        Swal.fire("Lỗi!", "Không thể thực hiện thao tác này.", "error");
      }
    }
  };

  const handleRestore = async (user: fullDataUser) => {
    const result = await Swal.fire({
      title: "Khôi phục tài khoản?",
      text: `Khôi phục quyền truy cập cho ${user.profile?.display_name || user.email}?`,
      icon: "question",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await apiRestoreUser(user.id);
        Swal.fire("Thành công", "Tài khoản đã được khôi phục.", "success");
        fetchUsers();
      } catch (err) {
        Swal.fire("Thất bại", "Vui lòng thử lại sau.", "error");
      }
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Bộ lọc tìm kiếm">
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-4">
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

            <div>
              <label className="block mb-2 text-sm font-medium">
                Auth Provider
              </label>
              <select
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 cursor-pointer bg-white"
              >
                <option value="">Tất cả</option>
                <option value="google">Google</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Trạng thái xóa
              </label>
              <select
                onChange={(e) =>
                  setIsDeleted(
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  )
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Tất cả</option>
                <option value="false">Hoạt động</option>
                <option value="true">Đã xóa</option>
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Số lượng (Limit)
              </label>
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
              onViewDetail={handleOpenDetail}
              roles={roles}
              selectedRole={selectedRole}
              onFilterRole={(role) => setSelectedRole(role)}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Hiển thị trang {pagination?.current_page || 1} /{" "}
              {pagination?.total_pages || 1} ({pagination?.total_records || 0} kết quả)
            </p>
            
            {pagination && pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </div>

          <UserDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedUser}
            onChangeRole={handleOpenRoleModal}
            onDelete={(u) => {
              handleDelete(u);
              setIsModalOpen(false);
            }}
            onRestore={(u) => {
              handleRestore(u);
              setIsModalOpen(false);
            }}
          />

          <ChangeRoleModal
            isOpen={isRoleModalOpen}
            onClose={() => setIsRoleModalOpen(false)}
            user={roleUser}
            onSuccess={fetchUsers}
          />
        </ComponentCard>
      </div>
    </div>
  );
}