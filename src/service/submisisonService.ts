import api from "@/config/config";
import { API } from "../../api";
import { getSubmissionPayload, updateSubmissionPayload } from "@/interface/submission";

export const apiGetSubmission = async (params: getSubmissionPayload) => {
  const response = await api.get(API.Submission.GET_ALL, { params });
  return response?.data;
};

export const apiGetSubmissionDetail = async (id: string) => {
  const response = await api.get(API.Submission.GET_DETAIL(id));
  return response?.data;
};

export const updateSubmission = async (id: string, payload: updateSubmissionPayload) => {
  const response = await api.patch(API.Submission.UPDATE_STATUS(id), payload);
  return response?.data;
};

export const deleteSubmission = async (id: string) => {
  const response = await api.delete(API.Submission.DELETE(id));
  return response?.data;
};
