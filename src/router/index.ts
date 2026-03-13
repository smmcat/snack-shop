import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue'; // 补充缺失的导入
import { useUserStore } from '@/stores/user';

// 路由组件
const Login = () => import('@/views/Login.vue');
const Register = () => import('@/views/Register.vue');
const Home = () => import('@/views/Home.vue');
const Order = () => import('@/views/Order.vue');
const AdminCommodity = () => import('@/views/admin/Commodity.vue');
const AdminOrder = () => import('@/views/admin/Order.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/home',
            name: 'Home',
            component: Home,
            meta: { requiresAuth: true }
        },
        {
            path: '/order',
            name: 'Order',
            component: Order,
            meta: { requiresAuth: true, requiresAdmin: false }
        },
        {
            path: '/admin/commodity',
            name: 'AdminCommodity',
            component: AdminCommodity,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/admin/order',
            name: 'AdminOrder',
            component: AdminOrder,
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/home'
        }
    ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    // 初始化用户状态
    userStore.initUser();

    // 需要登录的路由
    if (to.meta.requiresAuth) {
        if (!userStore.token) {
            next('/login');
        } else {
            // 需要管理员权限的路由
            if (to.meta.requiresAdmin && !userStore.isAdmin) {
                next('/home');
            } else {
                next();
            }
        }
    } else {
        next();
    }
});

export default router;