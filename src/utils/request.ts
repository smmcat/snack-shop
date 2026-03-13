import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user.js';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore();
    // 添加token到请求头
    if (userStore.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = userStore.token;
    }
    return config;
  },
  (error) => {
    ElMessage.error(error.message);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg } = response.data;
    // 处理业务错误
    if (code !== 200) {
      ElMessage.error(msg || '请求失败');
      return Promise.reject(new Error(msg || 'Error'));
    }
    return response.data;
  },
  (error) => {
    // 处理401未授权
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      ElMessageBox.confirm(
        '登录状态已过期，请重新登录',
        '提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        window.location.href = '/login';
      });
    } 
    ElMessage.error(error.response.data.msg || error.message);
    return Promise.reject(error);
  }
);

// 封装请求方法
export const request = {
  get<T = any>(url: string, params?: object): Promise<T> {
    return service.get(url, { params });
  },
  post<T = any>(url: string, data?: object): Promise<T> {
    return service.post(url, data);
  },
  delete<T = any>(url: string): Promise<T> {
    return service.delete(url);
  }
};

export default service;