<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">用户注册</h2>
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
          <el-button type="text" @click="$router.push('/login')">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const registerRules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

const registerFormRef = ref<FormInstance>();

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  try {
    await registerFormRef.value.validate();
    // 提交注册信息
    const res = await userStore.register({
      username: registerForm.value.username,
      password: registerForm.value.password
    });
    ElMessage.success(res.msg);
    router.push('/home');
  } catch (error) {
    console.error('注册失败:', error);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  width: 400px;
  padding: 20px;
}

.register-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}

.register-btn {
  width: 100%;
  margin-bottom: 10px;
}
</style>