import axios from "axios";
import { message } from 'antd';

// Create axios instance with default config
const request = axios.create({
  baseURL: "http://localhost:5005",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    // Add token to request headers if it exists
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data;
  },
  (error) => {
    // Handle error response
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data.error || "An error occurred";

      switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        message.error("Unauthorized. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 403:
        message.error(errorMessage || "Access denied");
        break;
      case 404:
        message.error(errorMessage || "Resource not found");
        break;
      case 500:
        message.error(errorMessage || "Internal server error");
        break;
      default:
        message.error(errorMessage);
      }

      return Promise.reject(data);
    } else if (error.request) {
      // Request was made but no response received
      message.error("Network error. Please check your connection.");
      return Promise.reject({ error: "Network error" });
    } else {
      // Something else happened
      message.error(error.message || "An unexpected error occurred");
      return Promise.reject({ error: error.message });
    }
  }
);

export default request;
