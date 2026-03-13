<template>
  <div class="admin-order">
    <el-page-header @back="goBack" content="订单管理"></el-page-header>

    <!-- 统计按钮区域 -->
    <div class="order-actions" style="margin: 10px 0;display: flex;justify-content: end;">
      <el-button type="primary" @click="showShipmentStats">
        统计待发货商品
      </el-button>
    </div>

    <el-table :data="sortedOrderList" border stripe style="width: 100%;margin-top: 20px;">
      <el-table-column prop="id" label="订单ID" width="100"></el-table-column>
      <el-table-column prop="username" label="下单用户" width="120"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="200">
        <template #default="scope">
          {{ new Date(scope.row.createTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="totalPrice" label="订单总价" width="100">
        <template #default="scope">¥{{ scope.row.totalPrice }}</template>
      </el-table-column>

      <!-- 支付状态 -->
      <el-table-column prop="isPayment" label="支付状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isPayment ? 'success' : 'danger'">
            {{ scope.row.isPayment ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 发货状态 -->
      <el-table-column prop="isShipment" label="发货状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isShipment ? 'success' : 'danger'">
            {{ scope.row.isShipment ? '已发货' : '未发货' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 商品清单 -->
      <el-table-column label="商品清单" min-width="300">
        <template #default="scope">
          <el-collapse accordion :border="false">
            <el-collapse-item title="点击展开/收起商品" name="1">
              <div class="product-list">
                <div class="product-item" v-for="(p, idx) in scope.row.list" :key="idx">
                  <span class="product-name">{{ p.productName }}</span>
                  <span class="product-info">
                    单价¥{{ p.price }} × {{ p.quantity }}件
                    <em>¥{{ (p.price * p.quantity).toFixed(2) }}</em>
                  </span>
                </div>
                <div v-if="!scope.row.list?.length" class="empty">无商品</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button type="warning" size="small" @click="editStatus(scope.row)">
            修改状态
          </el-button>
          <!-- ✅ 新增：删除订单按钮 -->
          <el-button type="danger" size="small" @click="handleDeleteOrder(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px">
      <div v-if="orderDetail" class="detail-box">
        <p><strong>订单：</strong>{{ orderDetail.id }}</p>
        <p><strong>用户：</strong>{{ orderDetail.username }}</p>
        <p><strong>时间：</strong>{{ new Date(orderDetail.createTime).toLocaleString() }}</p>
        <p><strong>总价：</strong>¥{{ orderDetail.totalPrice }}</p>
        <p><strong>支付：</strong>{{ orderDetail.isPayment ? '已支付' : '未支付' }}</p>
        <p><strong>发货：</strong>{{ orderDetail.isShipment ? '已发货' : '未发货' }}</p>

        <el-table :data="orderDetail.list" border style="margin-top:10px">
          <el-table-column prop="productName" label="商品"></el-table-column>
          <el-table-column prop="price" label="单价"></el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column label="小计">
            <template #default="scope">¥{{ scope.row.price * scope.row.quantity }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 修改状态 -->
    <el-dialog v-model="statusVisible" title="修改订单状态" width="400px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="支付状态">
          <el-switch v-model="statusForm.isPayment" active-text="已支付" inactive-text="未支付" />
        </el-form-item>
        <el-form-item label="发货状态">
          <el-switch v-model="statusForm.isShipment" active-text="已发货" inactive-text="未发货" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" @click="updateStatus">确定</el-button>
      </template>
    </el-dialog>

    <!-- 待发货商品统计弹窗 -->
    <el-dialog v-model="statsVisible" title="待发货商品备货清单" width="600px" destroy-on-close>
      <div v-if="shipmentStats.length === 0" class="empty-stats">
        暂无未发货订单，无需备货
      </div>
      <el-table v-else :data="shipmentStats" border stripe style="width: 100%;" show-summary
        :summary-method="getSummary">
        <el-table-column prop="productName" label="商品名称" min-width="200"></el-table-column>
        <el-table-column prop="totalQuantity" label="需备货数量" align="center"></el-table-column>
        <el-table-column label="涉及订单数" align="center">
          <template #default="scope">
            {{ scope.row.orderCount }} 个订单
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="statsVisible = false">关闭</el-button>
        <el-button type="success" @click="exportStats">导出备货清单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'

const router = useRouter()

const orderList = ref<any[]>([])
const detailVisible = ref(false)
const orderDetail = ref<any>(null)
const statusVisible = ref(false)
const currentOrderId = ref(0)
const statusForm = ref({ isPayment: false, isShipment: false })

// 新增：统计相关变量
const statsVisible = ref(false)
interface ShipmentStat {
  productName: string
  totalQuantity: number
  orderCount: number
  _orderIds?: Set<number>
}
const shipmentStats = ref<ShipmentStat[]>([])

// 获取订单
const getOrderList = async () => {
  try {
    const res = await orderApi.getOrderList()
    orderList.value = res.data
  } catch (e) {
    ElMessage.error('获取订单失败')
  }
}

// 【核心排序】未支付/未发货 排最前面
const sortedOrderList = computed(() => {
  return [...orderList.value].sort((a, b) => {
    const scoreA = (a.isPayment ? 0 : 2) + (a.isShipment ? 0 : 1)
    const scoreB = (b.isPayment ? 0 : 2) + (b.isShipment ? 0 : 1)
    return scoreB - scoreA
  })
})

// 查看详情
const viewDetail = async (id: number) => {
  try {
    const res = await orderApi.getOrderDetail(id)
    orderDetail.value = res.data
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取订单详情失败')
  }
}

// 修改状态
const editStatus = (row: any) => {
  currentOrderId.value = row.id
  statusForm.value = { isPayment: row.isPayment, isShipment: row.isShipment }
  statusVisible.value = true
}

const updateStatus = async () => {
  try {
    await orderApi.updateOrderStatus(currentOrderId.value, {
      isPayment: String(statusForm.value.isPayment),
      isShipment: String(statusForm.value.isShipment)
    })
    ElMessage.success('更新成功')
    statusVisible.value = false
    getOrderList()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

// ==============================================
// ✅ 新增：删除订单（带二次确认 + 调用正确接口）
// ==============================================
const handleDeleteOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该订单，是否继续？',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用接口 DELETE /record/list/:id
    await orderApi.deleteOrder(id)
    ElMessage.success('删除成功')
    getOrderList() // 刷新列表
  } catch (error) {
    ElMessage.info('已取消删除')
  }
}

// 统计待发货商品
const showShipmentStats = () => {
  const unshippedOrders = orderList.value.filter(order => !order.isShipment)

  if (unshippedOrders.length === 0) {
    shipmentStats.value = []
    statsVisible.value = true
    return
  }

  const statsMap: Record<string, ShipmentStat> = {}

  unshippedOrders.forEach(order => {
    order.list.forEach((product: any) => {
      const key = product.productName
      if (!statsMap[key]) {
        statsMap[key] = {
          productName: product.productName,
          totalQuantity: 0,
          orderCount: 0,
          _orderIds: new Set()
        }
      }
      statsMap[key].totalQuantity += product.quantity
      statsMap[key]._orderIds!.add(order.id)
      statsMap[key].orderCount = statsMap[key]._orderIds!.size
    })
  })

  shipmentStats.value = Object.values(statsMap).map(stat => {
    const { _orderIds, ...publicStat } = stat
    return publicStat
  }).sort((a, b) => b.totalQuantity - a.totalQuantity)

  statsVisible.value = true
}

// 表格合计行计算
const getSummary = (param: any) => {
  const { columns, data } = param
  const sums: any[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '总计'
    } else if (index === 1) {
      const total = data.reduce((prev: number, curr: ShipmentStat) => prev + curr.totalQuantity, 0)
      sums[index] = total
    } else {
      sums[index] = '-'
    }
  })
  return sums
}

// 导出备货清单
const exportStats = () => {
  if (shipmentStats.value.length === 0) {
    ElMessage.warning('暂无备货清单可导出')
    return
  }
  let content = '商品名称,需备货数量,涉及订单数\n'
  shipmentStats.value.forEach(item => {
    content += `${item.productName},${item.totalQuantity},${item.orderCount}\n`
  })

  ElMessageBox.confirm('备货清单已生成，是否下载？', '导出成功', {
    confirmButtonText: '下载',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `备货清单_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('备货清单导出成功')
  })
}

const goBack = () => router.back()

onMounted(() => getOrderList())
</script>

<style scoped>
.admin-order {
  padding: 20px;
}

.order-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.product-list {
  padding: 6px 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  margin: 3px 6px;
  background: #f7f8fa;
  border-radius: 4px;
  font-size: 13px;
}

.product-name {
  font-weight: 500;
}

.product-info {
  color: #666;
}

.product-info em {
  color: #e64340;
  font-style: normal;
}

.empty {
  color: #999;
  text-align: center;
  padding: 6px;
}

.detail-box {
  line-height: 1.8;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:not(:has(.el-tag--danger))) {
  color: #909399;
  background: #fafafa;
}

.empty-stats {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

:deep(.el-table__header) {
  font-weight: bold;
}
</style>