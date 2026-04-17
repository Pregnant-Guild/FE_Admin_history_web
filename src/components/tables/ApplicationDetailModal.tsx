"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { ApplicationDto } from "@/interface/historian";
import { apiUpdateApplicationStatus } from "@/service/adminService";
import Link from "next/link";
import { URL_MEDIA } from "../../../api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onRefresh: () => void;
}

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onRefresh,
}: Props) {
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isOpen && application) {
      setReviewNote(application.review_note || "");
    } else {
      setReviewNote("");
    }
  }, [isOpen, application]);

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!application) return;

    if (!reviewNote.trim()) {
      textareaRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      await apiUpdateApplicationStatus(application.id, {
        status,
        review_note: reviewNote,
      });

      Swal.fire("Thành công!", "Trạng thái hồ sơ đã được cập nhật.", "success");
      onRefresh();
      onClose();
    } catch (error) {
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !application) return null;

  const userData = application.user || {};
  const mediaList = application.media || [];

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl dark:bg-gray-900 flex flex-col overflow-hidden text-gray-800 dark:text-gray-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold">Chi tiết yêu cầu nâng cấp</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* BODY */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-8">
            {/* THÔNG TIN NGƯỜI DÙNG */}
            <div className="p-5 border border-gray-200 rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
              <h4 className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Thông tin ứng viên
              </h4>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 overflow-hidden border border-gray-200 rounded-full shrink-0 dark:border-gray-700">
                  <Image
                    fill
                    src={userData.avatar_url || "/images/no-images.jpg"}
                    alt="avatar"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">
                    {userData.display_name || "N/A"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {userData.email || "Không có email"}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 bg-blue-100 rounded-md dark:bg-blue-500/20 dark:text-blue-400">
                      {application.verify_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md ${application.status === "PENDING" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-500"}`}
                    >
                      {application.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Nội dung ứng tuyển
              </h4>
              <div
                className="p-4 prose bg-white border border-gray-200 min-h-[100px] rounded-xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 max-w-none"
                dangerouslySetInnerHTML={{
                  __html: application.content || "<i>Không có nội dung.</i>",
                }}
              />
            </div>

            <div>
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tệp đính kèm ({mediaList.length})
              </h4>
              {mediaList.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {mediaList.map((media: any, idx: number) => {
                    const isImage = media.mime_type?.startsWith("image/");
                    return (
                      <div
                        key={idx}
                        className="relative overflow-hidden border border-gray-200 group aspect-square rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      >
                        {isImage ? (
                          <Image
                            src={`${URL_MEDIA}${media.storage_key}`}
                            alt="media"
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full p-3 text-center">
                            <svg
                              className="w-10 h-10 mb-2 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                            </svg>
                            <span className="text-[10px] font-medium text-gray-600 line-clamp-2">
                              {media.original_name}
                            </span>
                          </div>
                        )}
                        <Link
                          className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/40 opacity-0 group-hover:opacity-100 z-10"
                          href={`${URL_MEDIA}${media.storage_key}`}
                          target="_blank"
                        >
                          <span className="text-white text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                            Xem file
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Không có tệp đính kèm.
                </p>
              )}
            </div>

            {/* GHI CHÚ */}
            <div>
              <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ghi chú duyệt hồ sơ
              </h4>
              <textarea
                ref={textareaRef}
                className="w-full p-4 text-sm bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-[100px]"
                placeholder="Nhập lý do (bắt buộc) hoặc ghi chú thêm..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                disabled={application.status !== "PENDING"}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
          {application.status === "PENDING" && (
            <>
              <button
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                Từ chối
              </button>
              <button
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all"
              >
                Phê duyệt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
