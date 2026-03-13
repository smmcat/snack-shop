<template>
    <div class="order-container">
        <!-- 头部 -->
        <el-page-header @back="goBack" content="我的订单"></el-page-header>

        <!-- 订单列表 -->
        <el-table :data="orderList" border stripe style="width: 100%;margin-top: 20px;">
            <el-table-column prop="id" label="订单ID" width="100"></el-table-column>
            <el-table-column prop="username" label="购买者"></el-table-column>
            <el-table-column prop="createTime" label="创建时间">
                <template #default="scope">
                    {{ new Date(scope.row.createTime).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column prop="totalPrice" label="订单总价">
                <template #default="scope">
                    ¥{{ scope.row.totalPrice }}
                </template>
            </el-table-column>
            <el-table-column prop="isPayment" label="支付状态">
                <template #default="scope">
                    <el-tag :type="scope.row.isPayment ? 'success' : 'warning'">
                        {{ scope.row.isPayment ? '已支付' : '未支付' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="isShipment" label="发货状态">
                <template #default="scope">
                    <el-tag :type="scope.row.isShipment ? 'success' : 'warning'">
                        {{ scope.row.isShipment ? '已发货' : '未发货' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="viewDetail(scope.row.id)">
                        查看详情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 订单详情弹窗 -->
        <el-dialog v-model="detailVisible" title="订单详情" width="800px">
            <div v-if="orderDetail" class="order-detail">
                <div class="detail-header">
                    <p><strong>订单ID：</strong>{{ orderDetail.id }}</p>
                    <p><strong>创建时间：</strong>{{ new Date(orderDetail.createTime).toLocaleString() }}</p>
                    <p><strong>总价：</strong>¥{{ orderDetail.totalPrice }}</p>
                    <p><strong>支付状态：</strong>{{ orderDetail.isPayment ? '已支付' : '未支付' }}</p>
                    <p><strong>发货状态：</strong>{{ orderDetail.isShipment ? '已发货' : '未发货' }}</p>
                </div>
                <el-table :data="orderDetail.list" border style="margin-top: 20px;">
                    <el-table-column prop="productName" label="商品名称"></el-table-column>
                    <el-table-column prop="price" label="单价"></el-table-column>
                    <el-table-column prop="quantity" label="数量"></el-table-column>
                    <el-table-column label="小计">
                        <template #default="scope">
                            ¥{{ scope.row.price * scope.row.quantity }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '@/api';

const router = useRouter();

// 订单列表
const orderList = ref<any[]>([]);
// 订单详情
const detailVisible = ref(false);
const orderDetail = ref<any>(null);

// 获取订单列表
const getOrderList = async () => {
    try {
        const res = await orderApi.getOrderList();
        orderList.value = res.data;
    } catch (error) {
        console.error('获取订单列表失败:', error);
    }
};

// 查看订单详情
const viewDetail = async (id: number) => {
    try {
        const res = await orderApi.getOrderDetail(id);
        orderDetail.value = res.data;
        detailVisible.value = true;
    } catch (error) {
        console.error('获取订单详情失败:', error);
    }
};

// 返回上一页
const goBack = () => {
    router.back();
};

onMounted(() => {
    getOrderList();
});
</script>

<style scoped>
.order-container {
    padding: 20px;
}

.order-detail {
    line-height: 2;
}

.detail-header {
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
</style>