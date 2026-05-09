import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import DailyNewChart from "@/components/ecommerce/DailyNewChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DetailedStatsTable from "@/components/ecommerce/DetailedStatsTable";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "This is Dashboard Home for History Web",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />
        <DailyNewChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DetailedStatsTable />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>
    </div>
  );
}
