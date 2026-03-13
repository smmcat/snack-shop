import { defineStore } from 'pinia';
import { ref } from 'vue';
import { request } from '@/utils/request';

interface LoginResponse {
  code: number;
  msg: string;
  token: string;
}

interface LoginForm {
  username: string;
  password: string;
  type: string;
}

interface RegisterForm {
  username: string;
  password: string;
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('');
  const username = ref<string>('');
  const isAdmin = ref<boolean>(false);

  // 登录
  const login = async (loginForm: LoginForm): Promise<LoginResponse> => {
    const res = await request.post<LoginResponse>('/api/login', loginForm);
    token.value = res.token;
    username.value = loginForm.username;
    isAdmin.value = loginForm.type === 'admin';
    // 持久化存储
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', loginForm.username);
    localStorage.setItem('isAdmin', String(loginForm.type === 'admin'));
    return res;
  };

  // 注册
  const register = async (registerForm: RegisterForm): Promise<LoginResponse> => {
    const res = await request.post<LoginResponse>('/api/register', registerForm);
    token.value = res.token;
    username.value = registerForm.username;
    isAdmin.value = false;
    // 持久化存储
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', registerForm.username);
    localStorage.setItem('isAdmin', 'false');
    return res;
  };

  // 退出登录
  const logout = () => {
    token.value = '';
    username.value = '';
    isAdmin.value = false;
    localStorage.clear();
  };

  // 初始化用户状态
  const initUser = () => {
    token.value = localStorage.getItem('token') || '';
    username.value = localStorage.getItem('username') || '';
    isAdmin.value = localStorage.getItem('isAdmin') === 'true';
  };

  return {
    token,
    username,
    isAdmin,
    login,
    register,
    logout,
    initUser
  };
});