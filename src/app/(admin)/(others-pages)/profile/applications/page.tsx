"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SafeHTMLRenderer } from "@/components/ui/parse/SafeHTMLRenderer";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiDeleteHistorianCV } from "@/service/historianService";
import Swal from "sweetalert2";

// Import statusConfig để đồng bộ logic
import { statusConfig } from "@/service/handler";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { URL_MEDIA } from "../../../../../../api";

export default function ApplicationDetailPage() {
  const application = useSelector(
    (state: RootState) => state.user.selectedApplication,
  );
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(-1);

  if (!application) {
    return (
      <div className="p-10 text-center text-zinc-500 font-medium">
        Đang tải hoặc không có dữ liệu...
      </div>
    );
  }

  const config = statusConfig[application.status] || statusConfig.PENDING;

  const isImageFile = (file: any) => {
    const isImageMime = file.mime_type?.startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.storage_key);
    return isImageMime || isImageExt;
  };

  const imageMediaOnly = (application.media || []).filter(isImageFile);

  const imageSlides = imageMediaOnly.map((item: any) => ({
    src: `${URL_MEDIA}${item.storage_key}`,
    title: item.original_name,
    description: `Dung lượng: ${(item.size / 1024).toFixed(2)} KB`,
  }));

  const handleMediaClick = (item: any) => {
    const fileUrl = `${URL_MEDIA}${item.storage_key}`;
    if (isImageFile(item)) {
      const photoIndex = imageMediaOnly.findIndex(
        (img: any) => img.id === item.id,
      );
      setIndex(photoIndex);
    } else {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      window.open(googleDocsUrl, "_blank");
    }
  };

  const handleDelete = async () => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn sẽ không thể khôi phục lại đơn đăng ký này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      background: isDarkMode ? "#18181b" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        await apiDeleteHistorianCV(application.id);
        await Swal.fire({
          title: "Đã xóa!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: isDarkMode ? "#18181b" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
        });
        router.push("/profile");
      } catch (error) {
        Swal.fire({ title: "Lỗi!", icon: "error" });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  console.log("Application Detail:", application); // Debug log để kiểm tra dữ liệu ứng dụng

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border dark:border-zinc-800">
      <div className="flex justify-between items-center mb-8 border-b dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-zinc-50 tracking-tight">
            Chi tiết đơn đăng ký
          </h2>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md backdrop-blur-md border ${config.container}`}
        >
          <span className={`text-[12px] font-bold uppercase tracking-wider`}>
            {application.status}
          </span>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 block">
            Nội dung hiển thị (CV)
          </label>
          <div className="rounded-2xl border-2 border-zinc-50 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-950/30">
            <SafeHTMLRenderer html={application.content} />
          </div>
        </section>

        {application.media && application.media.length > 0 && (
          <section>
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 block">
              Tài liệu đính kèm ({application.media.length})
            </label>
            <div className="flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {application.media.map((item: any) => {
                const isImg = isImageFile(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleMediaClick(item)}
                    className="group relative min-w-[160px] h-[160px] overflow-hidden rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 cursor-pointer bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center transition-all hover:border-blue-500"
                  >
                    {isImg ? (
                      <>
                        <img
                          src={`${URL_MEDIA}${item.storage_key}`}
                          alt={item.original_name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-[10px] text-white font-bold truncate">
                            Xem ảnh
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center p-4">
                        <div className="w-12 h-12 mb-3 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-inner text-2xl">
                          📄
                        </div>
                        <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-tighter">
                          .{item.storage_key.split(".").pop()}
                        </p>
                        <p className="text-[9px] text-zinc-400 truncate w-28 mt-1 font-medium italic">
                          {item.original_name}
                        </p>
                        <span className="mt-3 text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                          Preview
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {application.status !== "APPROVED" && (
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-end w-full">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="group flex items-center gap-2 px-8 py-3 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-600 dark:text-red-400 dark:hover:text-white text-sm font-black rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isDeleting ? "ĐANG XỬ LÝ..." : "XÓA"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={imageSlides}
        plugins={[Zoom, Captions]}
        styles={{
          root: {
            zIndex: 99999,
            "--yarl__color_backdrop": "rgba(0, 0, 0, 0.95)",
          },
        }}
      />
    </div>
  );
}
