"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { getStatisticByDate } from "@/service/statisticsService";
import { StatisticResponse } from "@/interface/statistics";

export const EcommerceMetrics = () => {
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
        console.error("Failed to fetch statistics", error);
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

  const userGrowth = todayData && yesterdayData ? calculateGrowth(todayData.total_users, yesterdayData.total_users) : 0;
  const projectGrowth = todayData && yesterdayData ? calculateGrowth(todayData.total_projects, yesterdayData.total_projects) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng Người Dùng
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : todayData?.total_users?.toLocaleString() || "N/A"}
            </h4>
          </div>
          <Badge color={userGrowth >= 0 ? "success" : "error"}>
            {userGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {Math.abs(userGrowth).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng Dự Án
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : todayData?.total_projects?.toLocaleString() || "N/A"}
            </h4>
          </div>

          <Badge color={projectGrowth >= 0 ? "success" : "error"}>
            {projectGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon className="text-error-500" />}
            {Math.abs(projectGrowth).toFixed(2)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};

export default EcommerceMetrics;
