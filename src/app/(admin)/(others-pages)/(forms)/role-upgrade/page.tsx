"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RichTextEditor from "@/components/form/role-upgrade/Editor";
import {
  confirmUpload,
  getPresignedUrl,
  uploadFileToS3,
} from "@/service/mediaService";
import React, { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { createHistorianCV } from "@/service/historianService";
import { toast } from "sonner";
import Swal from "sweetalert2";

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: "image" | "document";
  extension: string;
  presigned?: any;
};

export default function RoleUpgrade() {
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [verifyType, setVerifyType] = useState<string>("OTHER");

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const [isPreparingFiles, setIsPreparingFiles] = useState(false);
  
  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsPreparingFiles(true);

    try {
      const newFilesPromises = Array.from(files).map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const extension = file.name.split(".").pop()?.toLowerCase() || "";

        const presigned = await getPresignedUrl(file);

        return {
          id: Math.random().toString(36).substring(7),
          file: file,
          previewUrl: isImage ? URL.createObjectURL(file) : "",
          name: file.name,
          size: file.size,
          type: isImage ? "image" : "document",
          extension: extension,
          presigned: presigned,
        } as PendingFile;
      });

      const newPendingFiles = await Promise.all(newFilesPromises);
      setPendingFiles((prev) => [...prev, ...newPendingFiles]);
    } catch (error) {
      console.error("Lỗi khi chuẩn bị file đính kèm:", error);
      alert("Lỗi khi chuẩn bị kết nối upload. Vui lòng thử lại!");
    } finally {
      setIsPreparingFiles(false);
      if (event.target) event.target.value = "";
    }
  };

  const removePendingFile = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingFiles((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const uploadPromises = pendingFiles.map(async (item) => {
        await uploadFileToS3(item.file, item.presigned);
        const confirmRes = await confirmUpload(item.presigned.token_id);
        return confirmRes?.data?.id || confirmRes?.id;
      });
      const uploadedMediaIds = await Promise.all(uploadPromises);

      const payload = {
        content: content,
        media_ids: uploadedMediaIds,
        verify_type: verifyType, 
      };

      console.log("Payload chuẩn bị gửi (JSON):", payload);

      const cvResponse = await createHistorianCV(payload);
      console.log("Response từ API:", cvResponse);

      Swal.fire({
        title: "Gửi yêu cầu thành công!",
        text: "Yêu cầu nâng cấp đã được gửi đi. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể. Vui lòng kiểm tra Email khi có thông báo mới.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setContent("");
      setPendingFiles([]);
      setVerifyType("ID_CARD");
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng kiểm tra lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageFiles = pendingFiles.filter((f) => f.type === "image");
  const slides = imageFiles.map((item) => ({
    src: item.previewUrl,
    title: item.name,
    description: `Size: ${(item.size / 1024).toFixed(2)} KB`,
  }));

  const handleItemClick = (item: PendingFile) => {
    if (item.type === "image") {
      const index = imageFiles.findIndex((img) => img.id === item.id);
      setLightboxIndex(index);
    } else {
      const fileUrl = URL.createObjectURL(item.file);
      window.open(fileUrl, "_blank");
    }
  };

  const getDocumentStyle = (ext: string) => {
    if (["pdf"].includes(ext))
      return { color: "text-red-500", bg: "bg-red-50" };
    if (["doc", "docx"].includes(ext))
      return { color: "text-blue-500", bg: "bg-blue-50" };
    if (["xls", "xlsx"].includes(ext))
      return { color: "text-emerald-500", bg: "bg-emerald-50" };
    return { color: "text-gray-500", bg: "bg-gray-100" };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageBreadcrumb pageTitle="Role Upgrade" />
      <div className="flex flex-col gap-6">
        <RichTextEditor value={content} onChange={handleContentChange} />

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900">
          <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-white">
            Loại hồ sơ xác minh <span className="text-red-500">*</span>
          </label>
          <select
            value={verifyType}
            onChange={(e) => setVerifyType(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-700 transition-all cursor-pointer text-gray-700 dark:text-gray-200"
          >
            <option value="OTHER">Tài liệu khác (Other)</option>
            <option value="ID_CARD">Thẻ nhận dạng nhà nghiên cứu (ID Card)</option>
            <option value="EDUCATION">Bằng cấp giáo dục (Education)</option>
            <option value="EXPERT">Chứng nhận chuyên gia (Expert)</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            * Vui lòng chọn loại tài liệu tương ứng với các tệp bạn đính kèm bên dưới.
          </p>
          <p className="mt-2 text-xs text-red-400 dark:text-gray-400">
            * Nếu bạn đính kèm nhiều loại tài liệu, vui lòng chọn mục " Tài liệu khác (Other) ".
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Tài liệu đính kèm
            </h3>
            <label
              className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-blue-500 text-blue-500 hover:bg-blue-50 transition ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Đính kèm tệp</span>
              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {pendingFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100 sm:grid-cols-4 md:grid-cols-5 dark:border-gray-800">
              {pendingFiles.map((item) => {
                const docStyle = getDocumentStyle(item.extension);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="relative overflow-hidden transition-colors border border-gray-200 cursor-pointer group aspect-square rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-blue-400"
                  >
                    {item.type === "image" ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center p-3 ${docStyle.bg} dark:bg-gray-800`}
                      >
                        <svg
                          className={`w-10 h-10 ${docStyle.color} mb-2`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                        </svg>
                        <span className="text-xs font-medium text-center text-gray-700 break-all line-clamp-2 dark:text-gray-300">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
                          {item.extension}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => removePendingFile(item.id, e)}
                      className="absolute z-10 p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100 hover:bg-red-600"
                    >
                      <svg
                        className="w-3 h-3"
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

                    {item.type === "image" && (
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 pointer-events-none bg-black/40 group-hover:opacity-100">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isPreparingFiles}
          className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all transform flex justify-center items-center gap-2
            ${isSubmitting || isPreparingFiles ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"}`}
        >
          {isSubmitting ? "Đang tải dữ liệu lên..." : "Gửi yêu cầu nâng cấp"}
        </button>
      </div>
      <Lightbox
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={slides}
        plugins={[Zoom, Captions]}
        zoom={{ maxZoomPixelRatio: 10 }}
        styles={{
          root: {
            zIndex: 999999,
            "--yarl__color_backdrop": "rgba(0, 0, 0, 0.9)",
          },
        }}
      />
    </div>
  );
}