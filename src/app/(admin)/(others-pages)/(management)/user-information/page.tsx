"use client";
import ComponentCard from "@/components/common/ComponentCard";
import Swal from "sweetalert2";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import ChangeRoleModal from "@/components/tables/ChangeRoleModal";
import UserDetailModal from "@/components/tables/UserDetailModal";
import { responseUserTable, getUserDto, fullDataUser, createUser } from "@/interface/admin";
import {
  apiDeleteUser,
  apiGetAllRole,
  apiGetListUser,
  apiRestoreUser,
  apiCreateUser,
  apiResetPassword,
} from "@/service/adminService";
import { useEffect, useState, useCallback } from "react";
import Pagination from "@/components/tables/Pagination";
import { LIMIT_ITEM_TABLE, IS_SEND_EMAIL } from "../../../../../../constant";
import CustomDateRangePicker from "@/components/common/CustomDateRangePicker";
import Input from "@/components/form/input/InputField";

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPayload, setCreatePayload] = useState<createUser>({
    email: "",
    display_name: "",
    password: "",
    role_ids: [],
  });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<fullDataUser | null>(null);
  const [resetPayload, setResetPayload] = useState({
    new_password: "",
    is_send_email: IS_SEND_EMAIL,
  });

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

  const generateRandomPassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specials[Math.floor(Math.random() * specials.length)];
    
    const allChars = lowercase + uppercase + numbers + specials;
    for (let i = 0; i < 5; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const handleOpenCreateModal = () => {
    setCreatePayload({
      email: "",
      display_name: "",
      password: generateRandomPassword(),
      role_ids: [],
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      const res = await apiCreateUser(createPayload as any);
      if (res?.status) {
        Swal.fire("Thành công", "Tạo tài khoản thành công.", "success");
        setIsCreateModalOpen(false);
        fetchUsers();
      } else {
        Swal.fire("Thất bại", res?.message || "Không thể tạo tài khoản.", "error");
      }
    } catch (err: any) {
      Swal.fire("Lỗi!", err?.response?.data?.message || "Có lỗi xảy ra.", "error");
    }
  };

  const handleOpenResetModal = (user: fullDataUser) => {
    setResetUser(user);
    setResetPayload({
      new_password: generateRandomPassword(),
      is_send_email: IS_SEND_EMAIL,
    });
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    try {
      const res = await apiResetPassword(resetUser.id, resetPayload as any);
      if (res?.status) {
        Swal.fire("Thành công", "Đặt lại mật khẩu thành công.", "success");
        setIsResetModalOpen(false);
      } else {
        Swal.fire("Thất bại", res?.message || "Không thể đặt lại mật khẩu.", "error");
      }
    } catch (err: any) {
      Swal.fire("Lỗi!", err?.response?.data?.message || "Có lỗi xảy ra.", "error");
    }
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
                Phương thức đăng nhập
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
                Trạng thái
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

            <div>
              <label className="block mb-2 text-sm font-medium">Thời gian</label>
              <CustomDateRangePicker
                onFilterChange={(sDate, eDate, sTime, eTime) => {
                  setFromDate(sDate);
                  setToDate(eDate);
                  setFromTime(sTime);
                  setToTime(eTime);
                }}
              />
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

        <ComponentCard 
          title="Danh sách người dùng"
          headerAction={
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo tài khoản
            </button>
          }
        >
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
            onResetPassword={(u) => {
              handleOpenResetModal(u);
              setIsModalOpen(false);
            }}
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

          {/* Modal Tạo Tài Khoản */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tạo tài khoản mới</h3>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên hiển thị</label>
                    <Input 
                      type="text" 
                      defaultValue={createPayload.display_name} 
                      onChange={(e) => setCreatePayload({...createPayload, display_name: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500" 
                      placeholder="Nhập tên hiển thị..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <Input 
                      type="email" 
                      defaultValue={createPayload.email} 
                      onChange={(e) => setCreatePayload({...createPayload, email: e.target.value})} 
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500" 
                      placeholder="Nhập email..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
                    <div className="flex flex-wrap gap-4 mt-2 mb-2">
                      {roles.map((role) => (
                        <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={createPayload.role_ids.includes(role.id)}
                            onChange={(e) => {
                              const newRoleIds = e.target.checked
                                ? [...createPayload.role_ids, role.id]
                                : createPayload.role_ids.filter((id) => id !== role.id);
                              setCreatePayload({ ...createPayload, role_ids: newRoleIds });
                            }}
                            className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={createPayload.password} 
                        onChange={(e) => setCreatePayload({...createPayload, password: e.target.value})} 
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500" 
                      />
                      <button 
                        onClick={() => setCreatePayload({...createPayload, password: generateRandomPassword()})} 
                        className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap"
                      >
                        Sinh ngẫu nhiên
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">Hủy</button>
                  <button onClick={handleCreateUser} className="flex items-center px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all">Tạo tài khoản</button>
                </div>
              </div>
            </div>
          )}

          {isResetModalOpen && (
            <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Reset mật khẩu</h3>
                  <button onClick={() => setIsResetModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={resetPayload.new_password} 
                        onChange={(e) => setResetPayload({...resetPayload, new_password: e.target.value})} 
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500" 
                      />
                      <button onClick={() => setResetPayload({...resetPayload, new_password: generateRandomPassword()})} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 whitespace-nowrap">Sinh ngẫu nhiên</button>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="sendEmailReset" checked={resetPayload.is_send_email} onChange={(e) => setResetPayload({...resetPayload, is_send_email: e.target.checked})} className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 cursor-pointer" />
                    <label htmlFor="sendEmailReset" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Gửi email thông báo mật khẩu mới</label>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button onClick={() => setIsResetModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">Hủy</button>
                  <button onClick={handleResetPassword} className="flex items-center px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 transition-all">Lưu mật khẩu</button>
                </div>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}