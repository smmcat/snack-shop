<template>
    <div class="home-container">
        <el-header>
            <div class="header-content">
                <h1>小卖部商城</h1>
                <div class="header-right">
                    <el-button v-if="!isAdmin" @click="goToOrder">往期订单</el-button>
                    <el-dropdown @command="handleCommand">
                        <span class="el-dropdown-link">
                            {{ username }} <el-icon><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                        </template>
                    </el-dropdown>
                    <el-button v-if="isAdmin" type="primary" @click="$router.push('/admin/commodity')">
                        商品管理
                    </el-button>
                    <el-button v-if="isAdmin" type="success" @click="$router.push('/admin/order')">
                        订单管理
                    </el-button>
                </div>
            </div>
        </el-header>

        <el-main>
            <!-- 管理员：只看商品列表，不能购买 -->
            <div v-if="isAdmin" class="admin-view">
                <h2>管理员模式 - 商品总览</h2>
                <el-table :data="commodityList" border style="width:100%;margin-top:20px">
                    <el-table-column prop="id" label="ID" width="80"></el-table-column>
                    <el-table-column prop="productName" label="商品名"></el-table-column>
                    <el-table-column prop="price" label="价格"></el-table-column>
                    <el-table-column prop="remaining" label="库存"></el-table-column>
                    <el-table-column prop="maxQuantity" label="限购数量">
                        <template #default="scope">
                            {{ scope.row.maxQuantity === -1 ? '不限制' : '限购' + scope.row.maxQuantity + '件' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="isListed" label="上架状态">
                        <template #default="scope">
                            <el-tag :type="scope.row.isListed ? 'success' : 'danger'">
                                {{ scope.row.isListed ? '已上架' : '已下架' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间"></el-table-column>
                </el-table>
            </div>

            <!-- 普通用户：正常购买 -->
            <div v-else class="user-view">
                <!-- 顶部显示已选商品总价和限额提示 -->
                <div class="cart-summary" v-if="cartCount > 0">
                    <span>已选商品总价：<strong class="total-price-text">¥{{ totalPrice }}</strong></span>
                    <span v-if="totalPrice > 20" class="limit-warning">⚠️ 超过订单消费限额20元</span>
                    <span v-else class="limit-normal">✅ 未超过订单消费限额20元</span>
                    <el-button type="primary" @click="submitOrder" :disabled="cartCount === 0 || totalPrice > 20">
                        提交订单
                    </el-button>
                </div>
                <div class="cart-summary" v-else style="display: flex;justify-content: center;align-items: center;">
                    <span style="margin: 4px;">欢迎来到YX小卖部</span>
                </div>

                <div class="commodity-list">
                    <el-card v-for="item in commodityList" :key="item.id" class="commodity-card">
                        <img :src="item.pic" alt="" class="commodity-img" v-if="item.pic" />
                        <div class="commodity-info">
                            <h3>{{ item.productName }}</h3>
                            <p class="price">价格：¥{{ item.price }}</p>
                            <p class="stock" v-if="item.remaining > 0">库存：{{ item.remaining }}件</p>
                            <p class="stock out-of-stock" v-else>已售罄</p>

                            <!-- 新增：限购数量描述 -->
                            <p class="limit-desc" :style="{color: item.maxQuantity === -1 ? '#67c23a' : '#f56c6c'}">
                                {{ item.maxQuantity === -1 ? '✅ 购买数量不限制' : '⚠️ 每人最多购买' + item.maxQuantity + '件' }}
                            </p>

                            <!-- 已选数量和小计 -->
                            <p class="selected-info">
                                已选：{{ item.selectedQuantity }}件 | 小计：¥{{ item.price * item.selectedQuantity }}
                            </p>
                        </div>
                        <div class="commodity-action">
                            <!-- 数量选择器：动态绑定max，自动拦截限购 -->
                            <el-input-number
                                v-model="item.selectedQuantity"
                                :min="0"
                                :max="getItemMaxAllowed(item)"
                                :disabled="item.remaining <= 0"
                                @change="handleQuantityChange(item)"
                            />
                        </div>
                    </el-card>
                </div>

                <!-- 购物车抽屉 -->
                <el-drawer title="购物车" v-model="cartVisible" direction="rtl" size="700px">
                    <el-table :data="cartList" border>
                        <el-table-column prop="productName" label="商品名称"></el-table-column>
                        <el-table-column prop="price" label="单价"></el-table-column>
                        <el-table-column prop="selectedQuantity" label="数量"></el-table-column>
                        <el-table-column label="小计">
                            <template #default="scope">
                                ¥{{ scope.row.price * scope.row.selectedQuantity }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-button type="text" @click="clearItem(scope.row.id)">清空</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="cart-footer">
                        <div class="total-price">总计：¥{{ totalPrice }}</div>
                        <el-button type="primary" @click="submitOrder" :disabled="cartCount === 0 || totalPrice > 20">
                            提交订单
                        </el-button>
                    </div>
                    <div style="display: flex;justify-content: end;">
                        <span v-if="totalPrice > 20" style="font-size: 14px;color: red;">订单超过20元，超过预期消费额度</span>
                    </div>
                </el-drawer>
            </div>
        </el-main>

        <div class="cart-button" v-if="!isAdmin">
            <el-button type="primary" @click="cartVisible = true" :icon="ShoppingCart">
                <el-badge :value="cartCount"></el-badge>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue';
import { commodityApi, orderApi } from '@/api';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const username = userStore.username;
const isAdmin = userStore.isAdmin;

const commodityList = ref<any[]>([]);
const cartVisible = ref(false);

// 获取商品列表
const getCommodityList = async () => {
    try {
        const res = await commodityApi.getCommodityList();
        commodityList.value = res.data.map(item => ({
            ...item,
            selectedQuantity: 0
        }));
    } catch (error) {
        console.error('获取商品失败', error);
    }
};

// 【核心】获取商品允许购买的最大数量
const getItemMaxAllowed = (item: any) => {
    // 规则：maxQuantity=-1 → 不限制，取库存；否则取 限购数 和 库存 中较小的值
    if (item.maxQuantity === -1) return item.remaining;
    return Math.min(item.maxQuantity, item.remaining);
};

// 【核心】数量改变时校验 + 拦截
const handleQuantityChange = (item: any) => {
    const max = getItemMaxAllowed(item);

    // 超过限购 → 强制重置并提示
    if (item.selectedQuantity > max) {
        item.selectedQuantity = max;
        if (item.maxQuantity !== -1) {
            ElMessage.warning(`${item.productName} 最多只能购买 ${max} 件`);
        }
    }
};

// 购物车计算属性
const cartList = computed(() => commodityList.value.filter(i => i.selectedQuantity > 0));
const cartCount = computed(() => commodityList.value.reduce((sum, i) => sum + i.selectedQuantity, 0));
const totalPrice = computed(() => commodityList.value.reduce((sum, i) => sum + i.price * i.selectedQuantity, 0));

// 清空单个商品
const clearItem = (id: number) => {
    const item = commodityList.value.find(i => i.id === id);
    if (item) item.selectedQuantity = 0;
};

// 提交订单
const submitOrder = async () => {
    try {
        const data = {
            list: cartList.value.map(i => ({ productId: i.id, quantity: i.selectedQuantity }))
        };
        await orderApi.submitOrder(data);
        ElMessage.success('下单成功');
        cartVisible.value = false;
        commodityList.value.forEach(item => item.selectedQuantity = 0);
    } catch (e) {
        ElMessage.error('下单失败');
    }
};

const goToOrder = () => router.push('/order');
const handleCommand = (cmd: string) => {
    if (cmd === 'logout') {
        userStore.logout();
        router.push('/login');
        ElMessage.success('退出成功');
    }
};

onMounted(() => getCommodityList());
</script>

<style scoped>
.home-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.el-header {
    background: #fff;
    border-bottom: 1px solid #eee;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 100%;
}

.header-right {
    display: flex;
    gap: 15px;
    align-items: center;
}

.el-dropdown-link {
    cursor: pointer;
}

.admin-view { padding: 20px; }
.user-view { padding: 20px; }

.cart-summary {
    padding: 10px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
}

.total-price-text { color: #e64340; font-size: 16px; }
.limit-warning { color: #e64340; font-weight: 500; }
.limit-normal { color: #67c23a; font-weight: 500; }

/* 商品卡片 */
.commodity-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}
.commodity-card { display: flex; flex-direction: column; }
.commodity-img { width: 100%; height: 180px; object-fit: cover; }
.price { color: #e64340; font-weight: bold; }
.stock { color: #666; }
.out-of-stock { color: #999; }

/* 限购描述样式 */
.limit-desc {
    margin: 4px 0;
    font-size: 13px;
    font-weight: 500;
}

.selected-info { margin-top: 5px; font-size: 14px; color: #666; }
.commodity-action { margin-top: 10px; }

.cart-button {
    position: fixed;
    right: 30px;
    bottom: 30px;
    z-index: 99;
}

.cart-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px solid #eee;
}
.total-price { font-size: 16px; font-weight: bold; color: #e64340; }
</style>