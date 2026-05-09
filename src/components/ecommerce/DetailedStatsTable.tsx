"use client";
import React, { useEffect, useState } from "react";
import { getStatisticByDate } from "@/service/statisticsService";
import { StatisticResponse } from "@/interface/statistics";

const METRICS_MAP = [
  { key: "users", name: "Người dùng" },
  { key: "projects", name: "Dự án" },
  { key: "commits", name: "Bản lưu" },
  { key: "submissions", name: "Duyệt tin" },
  { key: "medias", name: "Tệp đa phương tiện" },
  { key: "wikis", name: "Bài viết Wiki" },
  { key: "entities", name: "Thực thể" },
  { key: "geometries", name: "Dữ liệu không gian" },
];

export default function DetailedStatsTable() {
  const [todayData, setTodayData] = useState<StatisticResponse | null>(null);
  const [yesterdayData, setYesterdayData] = useState<StatisticResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const [todayRes, yesterdayRes] = await Promise.all([
          getStatisticByDate(todayStr),
          getStatisticByDate(yesterdayStr)
        ]);

        if (todayRes?.data) setTodayData(todayRes.data);
        if (yesterdayRes?.data) setYesterdayData(yesterdayRes.data);
      } catch (error) {
        console.error("Failed to fetch detailed statistics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateGrowth = (today: number, yesterday: number) => {
    if (!yesterday || yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Bảng Số Liệu Chi Tiết (Hôm nay vs Hôm qua)
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Nội dung</th>
              <th className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Hôm nay</th>
              <th className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Hôm qua</th>
              <th className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Tăng trưởng</th>
            </tr>
          </thead>
          <tbody>
            {METRICS_MAP.map((metric) => {
              const todayVal = todayData ? (todayData[`total_${metric.key}` as keyof StatisticResponse] as number) : 0;
              const yesterdayVal = yesterdayData ? (yesterdayData[`total_${metric.key}` as keyof StatisticResponse] as number) : 0;
              const growth = calculateGrowth(todayVal, yesterdayVal);

              return (
                <tr key={metric.key} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                  <td className="py-3 text-sm font-medium text-gray-800 dark:text-white/90">{metric.name}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{loading ? "..." : todayVal.toLocaleString()}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{loading ? "..." : yesterdayVal.toLocaleString()}</td>
                  <td className={`py-3 text-sm font-medium ${growth >= 0 ? "text-success-500" : "text-error-500"}`}>
                    {loading ? "..." : `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
