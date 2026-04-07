import api from "@/config/config";
import { API } from "../../api";
import { payloadPresignedMedia } from "@/interface/media";

export const apiGetCurrentUserMedia = async (payload: payloadPresignedMedia) => {
  const response = await api.get(API.Media.PRESIGNED, {
    params: payload,
  });
  return response?.data;
};