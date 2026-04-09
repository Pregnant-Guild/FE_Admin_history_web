"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UserMetaCardProps } from "@/interface/user";
import { uploadMedia } from "@/service/mediaService";

export default function UserMetaCard({ data }: { data: UserMetaCardProps }) {
  const [previewImage, setPreviewImage] = useState(
    data.data?.profile?.avatar_url || "/images/no-images.jpg"
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log("Selected file:", file);

      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      const uploadedMedia = await uploadMedia(file);
      console.log("Upload thành công:", uploadedMedia);
      
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      setPreviewImage(data.data?.profile?.avatar_url || "/images/no-images.jpg");
      alert("Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            
            <div 
              onClick={handleAvatarClick}
              className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full cursor-pointer dark:border-gray-800 group shrink-0"
            >
              <Image
                width={80}
                height={80}
                src={previewImage}
                alt="avatar"
                className="object-cover w-full h-full"
              />
              
              <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 opacity-0 group-hover:opacity-100">
                {isUploading ? (
                  <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data.data?.profile?.display_name || "Full Name"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-blue-500 dark:text-gray-400">
                  {data.data?.roles?.map((role) => role.name).join(", ") ||
                    "No roles available"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[450px] truncate">
                  {data.data?.profile?.bio || "No bio available"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data.data?.profile?.location || "user location"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}