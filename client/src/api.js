import axios from "axios";

export const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:8080/api"
).replace(/\/$/, "");
export const SERVER_ORIGIN = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:8080"
).replace(/\/$/, "");
export const API = axios.create({ baseURL: API_ORIGIN });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("forma_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function imageUrl(value) {
  if (!value)
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80";
  if (/^https?:\/\//i.test(value)) return value;
  return `${SERVER_ORIGIN}/${String(value).replace(/^\/+/, "").replace(/\\/g, "/")}`;
}
export function unwrapList(
  data,
  keys = ["products", "orders", "notifications"],
) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
}
export function messageOf(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.join?.(", ") ||
    error?.message ||
    "Something went wrong"
  );
}
