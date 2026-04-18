"use client";

import { setSelectedApplication } from "@/store/features/userSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { URL_MEDIA } from "../../../api";
import { statusConfig } from "@/service/handler";

const formatFullDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} ${day}`;
};

const processMedia = (mediaArray: any[]) => {
  if (!mediaArray || mediaArray.length === 0) return { type: "empty" };
  const imageFiles = mediaArray.filter((file) => {
    const isImageMime = file.mime_type?.startsWith("image/");
    const isImageExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.storage_key);
    return isImageMime || isImageExt;
  });
  const docFiles = mediaArray.filter((file) => {
    const isImage =
      file.mime_type?.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.storage_key);
    return !isImage;
  });
  if (imageFiles.length > 0)
    return { type: "image", src: `${URL_MEDIA}${imageFiles[0].storage_key}` };
  if (docFiles.length > 0) {
    const extensions = docFiles.map((file) =>
      file.mime_type
        ? file.mime_type.split("/")[1]
        : file.storage_key.split(".").pop() || "file",
    );
    return { type: "documents", extensions };
  }
  return { type: "empty" };
};

export default function ApplicationSquareCardList({
  applications,
}: {
  applications: any[];
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleViewDetail = (app: any) => {
    dispatch(setSelectedApplication(app));
    router.push(`/profile/applications`);
  };
  // Tạo object mapping để render icon dựa trên status
  const StatusIcons: Record<string, React.ReactNode> = {
    APPROVED: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
    PENDING: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6 animate-pulse p-1 "
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>
    ),
    REJECTED: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  };

  return (
    <div className="p-5 border rounded-xl dark:border-zinc-800 lg:p-6 bg-white dark:bg-zinc-950">
      <h4 className="text-lg font-bold text-zinc-800 dark:text-white/90 mb-5 tracking-tight">
        Applications CV
      </h4>

      <div className="flex flex-wrap gap-4">
        {applications?.map((app) => {
          const mediaState = processMedia(app.media);
          const config = statusConfig[app.status] || statusConfig.PENDING;

          return (
            <div
              key={app.id}
              onClick={() => handleViewDetail(app)}
              className="group relative h-60 aspect-square border dark:border-zinc-800 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-blue-500/50"
            >
              {/* Media Layer */}
              <div className="absolute inset-0 z-0">
                {mediaState.type === "image" ? (
                  <img
                    src={mediaState.src}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4">
                    {mediaState.type === "documents" ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {mediaState.extensions?.slice(0, 3).map((ext, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-black px-1.5 py-0.5 bg-white dark:bg-zinc-800 rounded border dark:border-zinc-700 uppercase"
                          >
                            .{ext}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-400 to-zinc-600 opacity-20" />
                    )}
                  </div>
                )}
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />

              {/* TOP INFO: FILE COUNT & STATUS ICON */}
              <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-center">
                {app.media?.length > 0 ? (
                  <span className="text-[9px] font-bold text-white/60 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                    {app.media.length} FILE
                  </span>
                ) : (
                  <div />
                )}

                {/* Status Icon Wrapper */}
                <div
                  className={`${config.container} rounded-full`}
                >
                  {StatusIcons[app.status] || StatusIcons.PENDING}
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-2 left-2 right-2 z-20 text-white">
                <div className="mb-1">
                  <p className="text-[10px] font-bold uppercase opacity-80 truncate">
                    {app.verify_type || "VERIFY"}
                  </p>
                  {app?.reviewer?.display_name && (
                    <p className="text-[9px] font-medium text-blue-400 truncate">
                      By: {app.reviewer.display_name}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <p className="text-[9px] font-bold text-white/70">
                    {formatFullDateTime(app.created_at)}
                  </p>
                  <div className="transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
