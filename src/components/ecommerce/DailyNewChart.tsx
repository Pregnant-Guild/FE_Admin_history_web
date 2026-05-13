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

export default function MonthlyNewChart() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<{ month: string; value: number }[]>([]);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>("users");
  const [loading, setLoading] = useState(true);

  const fetchChartData = async (start: string, end: string, metric: string) => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const response = await getStatistics({ start_date: start, end_date: end });
      if (response?.data) {
        // Tổng hợp theo tháng
        const monthsMap: { [key: string]: number } = {};
        
        response.data.forEach(item => {
          const date = new Date(item.date);
          const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          const val = item[`new_${metric}` as keyof StatisticResponse] as number || 0;
          
          if (!monthsMap[monthKey]) {
            monthsMap[monthKey] = 0;
          }
          monthsMap[monthKey] += val;
        });
        
        const aggregated = Object.entries(monthsMap).map(([key, value]) => ({
          month: key,
          value: value
        })).sort((a, b) => {
          const [mA, yA] = a.month.split('/').map(Number);
          const [mB, yB] = b.month.split('/').map(Number);
          return yA !== yB ? yA - yB : mA - mB;
        });

        setChartData(aggregated);
      }
    } catch (error) {
      console.error("Failed to fetch chart data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Từ đầu năm

    const todayStr = today.toISOString().split('T')[0];
    const startOfYearStr = startOfYear.toISOString().split('T')[0];

    setStartDate(startOfYearStr);
    setEndDate(todayStr);

    fetchChartData(startOfYearStr, todayStr, selectedMetricKey);
  }, []);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    fetchChartData(val, endDate, selectedMetricKey);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    fetchChartData(startDate, val, selectedMetricKey);
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMetricKey(val);
    fetchChartData(startDate, endDate, val);
  };

  const categories = chartData.map(item => item.month);
  const series = [
    {
      name: "Tạo mới",
      data: chartData.map(item => item.value),
    }
  ];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    yaxis: { labels: { style: { colors: ["#6B7280"] } } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lượng tạo mới hàng tháng
        </h3>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedMetricKey}
            onChange={handleMetricChange}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {METRICS.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
          />
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div className="flex items-center justify-center h-[180px]">Đang tải...</div>
          ) : (
            <Chart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}
