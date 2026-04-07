"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { fullDataUser } from "@/interface/admin";

// Kiểu dữ liệu sort
type SortColumn = "created_at" | "updated_at" | "display_name" | "email";

// Định nghĩa kiểu dữ liệu cho props truyền từ cha xuống
interface BasicTableOneProps {
  data: fullDataUser[];
  onSort: (column: SortColumn) => void;
  sortBy?: SortColumn;
  sortOrder?: "asc" | "desc";
}

export default function BasicTableOne({ data, onSort, sortBy, sortOrder }: BasicTableOneProps) {
  // Hàm phụ trợ để format lại ngày tháng năm
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Component phụ trợ để vẽ icon mũi tên Sort
  const SortIcon = ({ column }: { column: SortColumn }) => {
    const isActive = sortBy === column;
    return (
      <div className="flex flex-col ml-2 opacity-50 cursor-pointer hover:opacity-100">
        <svg
          className={`w-3 h-3 ${isActive && sortOrder === "asc" ? "text-blue-600 dark:text-blue-400 opacity-100" : "text-gray-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
        <svg
          className={`w-3 h-3 -mt-1 ${isActive && sortOrder === "desc" ? "text-blue-600 dark:text-blue-400 opacity-100" : "text-gray-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer" onClick={() => onSort("display_name")}>
                    Người dùng
                    <SortIcon column="display_name" />
                  </div>
                </TableCell>
                
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer" onClick={() => onSort("email")}>
                    Email
                    <SortIcon column="email" />
                  </div>
                </TableCell>
                
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Vai trò (Role)
                </TableCell>
                
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Trạng thái
                </TableCell>
                
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer" onClick={() => onSort("created_at")}>
                    Ngày tham gia
                    <SortIcon column="created_at" />
                  </div>
                </TableCell>

                {/* Thêm cột Ngày cập nhật */}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  <div className="flex items-center cursor-pointer" onClick={() => onSort("updated_at")}>
                    Cập nhật lần cuối
                    <SortIcon column="updated_at" />
                  </div>
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((user) => (
                <TableRow key={user.id}>
                  
                  {/* Cột User */}
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {user.profile?.avatar_url ? (
                          <Image
                            width={40}
                            height={40}
                            src={user.profile.avatar_url}
                            alt={user.profile.display_name || "Avatar"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="font-semibold text-gray-500 uppercase">
                            {user.profile?.display_name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.profile?.display_name || "Chưa cập nhật tên"}
                        </span>
                        {user.profile?.phone && (
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {user.profile.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Cột Email */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>

                  {/* Cột Roles */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role: any) => (
                        <span key={role.id} className="block">
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span>Chưa cấp quyền</span>
                    )}
                  </TableCell>

                  {/* Cột Trạng thái */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={user.is_deleted ? "error" : "success"}>
                      {user.is_deleted ? "Bị khóa" : "Hoạt động"}
                    </Badge>
                  </TableCell>

                  {/* Cột Ngày tham gia */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </TableCell>

                  {/* Cột Ngày cập nhật */}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(user.updated_at)}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}