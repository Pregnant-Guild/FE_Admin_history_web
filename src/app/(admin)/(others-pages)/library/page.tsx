"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ApplicationLibrary from "@/components/user-profile/ApplicationList";
import { MediaDto } from "@/interface/media";
import { apiGetCurrentUserApplications, apiGetCurrentUserMedia } from "@/service/userService";
import MediaLibrary from "@/components/user-profile/Media";

export default function LibraryPage() {
  const [mediaData, setMediaData] = useState<MediaDto | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLibraryContent = async () => {
      try {
        const [mediaResponse, userApplications] = await Promise.all([
          apiGetCurrentUserMedia(),
          apiGetCurrentUserApplications()
        ]);

        if (userApplications?.data) setApplications(userApplications.data);
        setMediaData(mediaResponse);
      } catch (err) {
        console.error("Lỗi khi tải thư viện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibraryContent();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-zinc-950 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Thư viện
        </h1>
       
      </div>

      <div className="space-y-12">
        {(mediaData?.data?.length ?? 0) > 0 && (
          <section>
            <MediaLibrary data={mediaData ?? {}} />
          </section>
        )}

        {applications.length > 0 && (
          <section>
            <ApplicationLibrary applications={applications} />
          </section>
        )}
      </div>
    </div>
  );
}