"use client";

import { setSelectedApplication } from "@/store/features/userSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export default function ApplicationList({ applications }: { applications: any[] }) {
  const router = useRouter();
  const dispatch = useDispatch();

 const handleViewDetail = (app: any) => {
    dispatch(setSelectedApplication(app));
    router.push(`/profile/applications`);
};

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div 
          key={app.id} 
          onClick={() => handleViewDetail(app)}
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <div className="flex justify-between items-center">
            <span>Loại: {app.verify_type}</span>
            <span className="text-blue-500 font-medium">Xem chi tiết &rarr;</span>
          </div>
        </div>
      ))}
    </div>
  );
}