"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { ApplicationDto } from "@/interface/historian";
import {
  apiGetUserById,
  apiUpdateApplicationStatus,
} from "@/service/adminService";
import { getMediaById } from "@/service/mediaService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationDto | null;
  onRefresh: () => void; // Gọi lại hàm fetch danh sách sau khi duyệt xong
}

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onRefresh,
}: Props) {
  const [userData, setUserData] = useState<any>(null);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [reviewNote, setReviewNote] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      setReviewNote(application.review_note || "");
      fetchDetails();
    } else {
      setUserData(null);
      setMediaList([]);
      setReviewNote("");
    }
  }, [isOpen, application]);

  const fetchDetails = async () => {
    if (!application) return;
    setLoadingContent(true);
    try {
      const userRes = await apiGetUserById(application.user_id);

      console.log("User data:", userRes);

      if (userRes?.data) setUserData(userRes.data);

      if (application.media && application.media.length > 0) {
        const mediaPromises = application.media.map((m: any) =>
          getMediaById(m.id),
        );
        const mediaResponses = await Promise.all(mediaPromises);
      
        setMediaList(mediaResponses.map((res) => res?.data || res));
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!application) return;

    if (status === "REJECTED" && !reviewNote.trim()) {
      Swal.fire(
        "Cảnh báo",
        "Vui lòng nhập lý do từ chối vào ô Ghi chú!",
        "warning",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        status: status,
        review_note: reviewNote,
      };

      await apiUpdateApplicationStatus(application.id, payload);

      Swal.fire(
        "Thành công!",
        `Hồ sơ đã được ${status === "APPROVED" ? "Phê duyệt" : "Từ chối"}.`,
        "success",
      );
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      Swal.fire("Lỗi", "Không thể cập nhật trạng thái lúc này.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !application) return null;

  const handleOpenFile = (media: any) => {
    if (!media.url) {
      Swal.fire("Lỗi", "Không tìm thấy đường dẫn file", "error");
      return;
    }

    const isImage = media.url.match(/\.(jpeg|jpg|gif|png)$/i);
    const isPdf = media.url.match(/\.(pdf)$/i);

    if (isImage || isPdf) {
      window.open(media.url, "_blank");
    } else {
    
      const link = document.createElement("a");
      link.href = media.url;
      link.download = media.original_name || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Chi tiết yêu cầu nâng cấp
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
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
          {loadingContent ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p>Đang tải dữ liệu người dùng và file đính kèm...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="p-5 border border-gray-200 rounded-xl dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                <h4 className="mb-4 text-sm font-bold text-gray-500 uppercase">
                  Thông tin ứng viên
                </h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 overflow-hidden border border-gray-200 rounded-full shrink-0 dark:border-gray-700">
                    <Image
                      width={64}
                      height={64}
                      src={
                        userData?.profile?.avatar_url || "/images/no-images.jpg"
                      }
                      alt="avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {userData?.profile?.display_name || application.user_id}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email: {userData?.email || "Đang cập nhật..."}
                    </p>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide text-blue-600 bg-blue-100 rounded-full dark:bg-blue-500/20 dark:text-blue-400">
                        {application.verify_type === 1
                          ? "CĂN CƯỚC CÔNG DÂN"
                          : "BẰNG CẤP / KHÁC"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold text-gray-500 uppercase">
                  Nội dung ứng tuyển
                </h4>
                <div
                  className="p-4 prose text-gray-800 bg-white border border-gray-200 min-h-[100px] rounded-xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      application.content ||
                      "<p className='text-gray-400 italic'>Không có nội dung chữ.</p>",
                  }}
                />
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold text-gray-500 uppercase">
                  Tệp đính kèm ({mediaList.length})
                </h4>
                {mediaList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {mediaList.map((media, idx) => {
                      const isImage =
                        media.url?.match(/\.(jpeg|jpg|gif|png)$/i) ||
                        media.mime_type?.startsWith("image/");
                      return (
                        <div
                          key={idx}
                          className="relative overflow-hidden border border-gray-200 group aspect-square rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                        >
                          {isImage ? (
                            <Image
                              src={media.url || "/images/no-images.jpg"}
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
                              <span className="text-xs font-medium text-gray-600 line-clamp-2 dark:text-gray-300">
                                {media.original_name || "Tài liệu"}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleOpenFile(media)}
                            className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 opacity-0 group-hover:opacity-100"
                          >
                            <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg">
                              {media.url.match(/\.(jpeg|jpg|gif|png)$/i)
                                ? "Xem ảnh"
                                : "Tải tài liệu"}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    Không có tệp đính kèm nào.
                  </p>
                )}
              </div>

              {/* KHỐI 4: GHI CHÚ ADMIN */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-gray-500 uppercase">
                  Ghi chú duyệt hồ sơ
                </h4>
                <textarea
                  className="w-full p-4 text-sm bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-[100px]"
                  placeholder="Nhập lý do từ chối (bắt buộc) hoặc ghi chú phê duyệt..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  disabled={
                    application.status !== 1 && application.status !== "PENDING"
                  } // Disable nếu đã duyệt
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-900/50 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>

          {/* Chỉ hiện nút duyệt/từ chối nếu status đang là PENDING (1) */}
          {(application.status === 1 || application.status === "PENDING") && (
            <>
              <button
                onClick={() => handleUpdateStatus("REJECTED")}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Từ chối
              </button>
              <button
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-500/30"
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
