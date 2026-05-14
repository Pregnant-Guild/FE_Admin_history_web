"use client";

import { useSidebar } from "@/context/SidebarContext";
import { UserData } from "@/interface/user";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { apiGetCurrentUser } from "@/service/auth";
import { setUserData } from "@/store/features/userSlice";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const dispatch = useDispatch();
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.user.data);
  const [isLoading, setIsLoading] = useState(!userData);

  useEffect(() => {
    if (userData) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await apiGetCurrentUser();
        const userData: UserData = res.data;

        const allowedRoles = ["ADMIN", "MOD", "HISTORIAN"];

        const isBanned = userData.roles.some((role) => role.name === "BANNED");

        const hasPermission = userData.roles.some((role) =>
          allowedRoles.includes(role.name)
        );

        if (isBanned || !hasPermission) {
          toast.error("Bạn không có quyền truy cập");
          router.replace("/auth/signin");
        }
        dispatch(setUserData(res.data));
      } catch {
        router.replace("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [dispatch, userData, router]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  if (isLoading || !userData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-5">
          {/* Spinner */}
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>
          {/* Text */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Đang tải dữ liệu
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
