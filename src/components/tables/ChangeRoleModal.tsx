"use client";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { fullDataUser } from "@/interface/admin";
import { apiGetAllRole, apiChangeRole } from "@/service/adminService";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: fullDataUser | null;
  onSuccess: () => void;
}

export default function ChangeRoleModal({ isOpen, onClose, user, onSuccess }: ChangeRoleModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setFetchingRoles(true);
      apiGetAllRole()
        .then((res) => {
          if (res?.status) setRoles(res.data);
        })
        .catch((err) => {
          console.error("Lỗi fetch roles:", err);
          toast.error("Không thể lấy danh sách vai trò");
        })
        .finally(() => setFetchingRoles(false));

      const currentUserRoles = user.roles?.map((r) => r.id) || [];
      setSelectedRoleIds(currentUserRoles);
    }
  }, [isOpen, user]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const payload = {
        role_ids: selectedRoleIds,
        user_id: user.id,
      };
      console.log("Payload gửi lên API:", payload);
      await apiChangeRole(user.id, payload);
      toast.success("Cập nhật vai trò thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật vai trò!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] m-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 w-full relative">

        <div className="mb-6 pr-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Vai trò người dùng
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.profile?.display_name || user.email}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {fetchingRoles ? (
            <div className="flex items-center justify-center py-8">
               <div className="w-6 h-6 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar -mx-2 px-2">
              {roles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRole(role.id)}
                      className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className={`text-sm ${isSelected ? "text-gray-900 dark:text-white font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                      {role.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-8">
            <Button 
              size="sm" 
              variant="outline" 
              type="button" 
              onClick={onClose} 
              disabled={loading || fetchingRoles}
            >
              Hủy
            </Button>
            <Button 
              size="sm" 
              type="submit" 
              disabled={loading || fetchingRoles}
              className="min-w-[100px]"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}