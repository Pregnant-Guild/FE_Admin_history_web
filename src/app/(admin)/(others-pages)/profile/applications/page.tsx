"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SafeHTMLRenderer } from "@/components/ui/parse/SafeHTMLRenderer";

export default function ApplicationDetailPage() {
  const application = useSelector((state: RootState) => state.user.selectedApplication);

  if (!application) {
    return <div className="p-10 text-center">Đang tải hoặc không có dữ liệu...</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Chi tiết Application</h2>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-400 uppercase">Loại yêu cầu:</label>
          <p className="text-lg font-medium">{application.verify_type}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-400 uppercase mb-3 block">
            Nội dung hiển thị (CV):
          </label>
          
          {/* SỬ DỤNG Ở ĐÂY */}
          <div className="border border-gray-100 rounded-lg p-2 bg-gray-50">
             <SafeHTMLRenderer html={application.content} />
          </div>
        </div>

        {/* Các phần khác như Media... */}
      </div>
    </div>
  );
}