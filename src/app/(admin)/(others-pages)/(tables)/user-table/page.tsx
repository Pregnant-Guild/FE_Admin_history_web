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
import { LIMIT_ITEM_TABLE } from "../../../../../../constant";

export type SortColumn = "created_at" | "updated_at" | "display_name" | "email";

const formatDateTimeToISO = (
  dateStr: string,
  timeStr: string,
  isEndOfDay: boolean = false,
): string | undefined => {
  if (!dateStr) return undefined;

  const time = timeStr || (isEndOfDay ? "23:59" : "00:00");

  return `${dateStr}T${time}:00.000000+07:00`;
};

export default function UserTable() {
  const [page, setPage] = useState<number>(1);
  const [limitInput, setLimitInput] = useState<string>(LIMIT_ITEM_TABLE.toString());

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [authProvider, setAuthProvider] = useState<string>("");
  const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

  const [fromDate, setFromDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const [selectedUser, setSelectedUser] = useState<fullDataUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleUser, setRoleUser] = useState<fullDataUser | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [debouncedParams, setDebouncedParams] = useState({
    search: "",
    limit: 5,
    authProvider: "",
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
  });

  const [tableData, setTableData] = useState<responseUserTable | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortColumn | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleReset = () => {
    setSearchTerm("");
    setAuthProvider("");
    setIsDeleted(undefined);
    setSelectedRole("");
    setLimitInput(LIMIT_ITEM_TABLE.toString());

    setFromDate("");
    setFromTime("");
    setToDate("");
    setToTime("");

    setPage(1);

    setDebouncedParams({
      search: "",
      limit: LIMIT_ITEM_TABLE,
      authProvider: "",
      fromDate: "",
      fromTime: "",
      toDate: "",
      toTime: "",
    });
  };

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
        limit: parseInt(limitInput) || LIMIT_ITEM_TABLE,
        authProvider: authProvider,
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
    authProvider,
    fromDate,
    fromTime,
    toDate,
    toTime,
  ]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        page: page,
        limit: debouncedParams.limit,
        search: debouncedParams.search || undefined,
        auth_provider: debouncedParams.authProvider || undefined,
        is_deleted: isDeleted,
        sort: sortBy,
        order: sortOrder,
        role_ids: selectedRole ? [selectedRole] : undefined,
      };

      // Thêm format ngày giờ vào payload
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

      const response = await apiGetListUser(payload as getUserDto);
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
  
  // console.log(pagination);

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
              <label className="block mb-2 text-sm font-medium">Search</label>
              <input
                type="text"
                placeholder="Name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Auth Provider
              </label>
              <select
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 cursor-pointer bg-white outline-none focus:border-brand-500"
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
                value={isDeleted === undefined ? "" : isDeleted ? "true" : "false"}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="false">Hoạt động</option>
                <option value="true">Đã xóa</option>
              </select>
            </div>

            {/* Từ ngày */}
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

            {/* Đến ngày */}
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

            {/* Limit */}
            <div>
              <label className="block mb-2 text-sm font-medium">
                Số lượng (Limit)
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

        <ComponentCard title="Danh sách người dùng">
          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-xl">
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
              {pagination?.total_pages || 1} ({pagination?.total_records || 0}{" "}
              kết quả)
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