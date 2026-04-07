import api from "@/config/config";
import { API } from "../../api";
import { getUserDto } from "@/interface/admin";

export const apiGetListUser = async (payload: getUserDto) => {
   const response = await api.get(API.Admin.GET_LIST_USERS, {
    params: payload,
  });
  return response?.data;
};
