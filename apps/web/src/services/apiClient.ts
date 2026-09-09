import { api as axiosInstance } from "./axiosConfige";

class ApiClient {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await axiosInstance.get<T>(url, { params });
    return res.data;
  }
  async post<T>(url: string, data?: unknown): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const res = await axiosInstance.post<T>(
      url,
      data,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return res.data;
  }
  async put<T>(url: string, data?: unknown): Promise<T> {
    const res = await axiosInstance.put<T>(url, data);
    return res.data;
  }
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const res = await axiosInstance.patch<T>(
      url,
      data,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return res.data;
  }
  async delete<T>(url: string): Promise<T> {
    const res = await axiosInstance.delete<T>(url);
    return res.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
