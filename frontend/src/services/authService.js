import request from "@/utils/request";

/**
 * User Auth API Service
 */

// User login
export const loginAPI = (email, password) => {
  return request.post("/user/auth/login", { email, password });
};

// User register
export const registerAPI = (email, password, name) => {
  return request.post("/user/auth/register", { email, password, name });
};

// User logout
export const logoutAPI = () => {
  return request.post("/user/auth/logout");
};
