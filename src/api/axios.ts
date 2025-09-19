import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: "/api", // 使用相对路径，配合 vite 代理
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    console.log("发送请求:", config);

    // 可以在这里添加 token
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 2xx 范围内的状态码都会触发该函数
    console.log("响应数据:", response);

    // 可以在这里统一处理响应数据格式
    return response.data;
  },
  (error) => {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error("响应错误:", error);

    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem("token");
          // window.location.href = '/login';
          break;
        case 403:
          console.error("禁止访问");
          break;
        case 404:
          console.error("请求的资源不存在");
          break;
        case 500:
          console.error("服务器内部错误");
          break;
        default:
          console.error(
            "请求失败:",
            (error.response.data as Record<string, unknown>)?.message ||
              "未知错误"
          );
      }
    } else if (error.request) {
      console.error("网络错误，请检查网络连接");
    } else {
      console.error("请求配置错误:", error.message);
    }

    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default apiClient;

// 导出常用的请求方法
export const get = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.get(url, config);
};

export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.post(url, data, config);
};

export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.put(url, data, config);
};

export const del = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.delete(url, config);
};

export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiClient.patch(url, data, config);
};

// API 接口类型定义
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 用户数据类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

// 示例 API 函数
export const userApi = {
  // 获取用户列表
  getUsers: () => get<ApiResponse<User[]>>("/users"),

  // 获取用户详情
  getUserById: (id: string) => get<ApiResponse<User>>(`/users/${id}`),

  // 创建用户
  createUser: (userData: Partial<User>) =>
    post<ApiResponse<User>>("/users", userData),

  // 更新用户
  updateUser: (id: string, userData: Partial<User>) =>
    put<ApiResponse<User>>(`/users/${id}`, userData),

  // 删除用户
  deleteUser: (id: string) => del<ApiResponse<boolean>>(`/users/${id}`),
};
