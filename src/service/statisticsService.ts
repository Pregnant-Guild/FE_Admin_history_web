import { api } from "@/config/config";
import { API } from "../../api";
import { GetStatisticsParams, StatisticResponse } from "@/interface/statistics";
import { CommonResponse } from "@/interface/common";

export const getStatistics = async (params?: GetStatisticsParams): Promise<CommonResponse<StatisticResponse[]>> => {
  const response = await api.get(API.Statistics.GET_ALL, { params });
  return response?.data;
};

export const getStatisticByDate = async (date: string): Promise<CommonResponse<StatisticResponse>> => {
  const response = await api.get(API.Statistics.GET_BY_DATE(date));
  return response?.data;
};
