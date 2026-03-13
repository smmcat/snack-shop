<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">小卖部管理系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="loginForm.type" placeholder="请选择用户类型">
            <el-option label="普通用户" value="student"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
          <el-button type="text" @click="$router.push('/register')">注册账号</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  type: 'student'
});

// 表单验证规则
const loginRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
});

const loginFormRef = ref<InstanceType<typeof ElForm>>();

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    await loginFormRef.value.validate();
    const res = await userStore.login(loginForm.value);
    ElMessage.success(res.msg);
    router.push('/home');
  } catch (error) {
    console.error('登录失败:', error);
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}

.login-btn {
  width: 100%;
  margin-bottom: 10px;
}
</style>