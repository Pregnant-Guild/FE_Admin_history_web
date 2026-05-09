"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { getStatistics } from "@/service/statisticsService";
import { StatisticResponse } from "@/interface/statistics";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const METRICS = [
  { key: "users", name: "Người dùng" },
  { key: "projects", name: "Dự án" },
  { key: "commits", name: "Bản lưu" },
  { key: "submissions", name: "Duyệt tin" },
  { key: "medias", name: "Tệp đa phương tiện" },
  { key: "wikis", name: "Bài viết Wiki" },
  { key: "entities", name: "Thực thể" },
  { key: "geometries", name: "Dữ liệu không gian" },
];

export default function StatisticsChart() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<StatisticResponse[]>([]);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>("users");
  const [loading, setLoading] = useState(true);

  const fetchChartData = async (start: string, end: string) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const response = await getStatistics({ start_date: start, end_date: end });
      if (response?.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    setStartDate(sevenDaysAgoStr);
    setEndDate(todayStr);

    fetchChartData(sevenDaysAgoStr, todayStr);
  }, []);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    fetchChartData(val, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    fetchChartData(startDate, val);
  };

  const categories = chartData.map(item => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const series = [
    {
      name: "Tổng cộng",
      data: chartData.map(item => item[`total_${selectedMetricKey}` as keyof StatisticResponse] as number || 0),
    },
    {
      name: "Mới",
      data: chartData.map(item => item[`new_${selectedMetricKey}` as keyof StatisticResponse] as number || 0),
    }
  ];

  const options: ApexOptions = {
    legend: { show: true, position: "top" },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM" },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê hệ thống
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Dữ liệu thống kê theo thời gian
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* Dropdown chọn Metric */}
          <select
            value={selectedMetricKey}
            onChange={(e) => setSelectedMetricKey(e.target.value)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {METRICS.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.name}
              </option>
            ))}
          </select>

          {/* Date Picker Start */}
          <div className="relative inline-flex items-center">
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            />
          </div>

          {/* Date Picker End */}
          <div className="relative inline-flex items-center">
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[310px]">Đang tải...</div>
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
}