<template>
    <div class="admin-commodity">
        <!-- 头部 -->
        <el-page-header style="margin: 22px 0;" @back="goBack" content="商品管理"></el-page-header>

        <!-- 操作按钮 -->
        <el-button type="primary" @click="handleAdd" class="add-btn">
            新增商品
        </el-button>

        <!-- 商品表格 -->
        <el-table :data="commodityList" border stripe style="width: 100%;margin-top: 20px;">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="productName" label="商品名称"></el-table-column>
            <el-table-column prop="price" label="价格"></el-table-column>
            <el-table-column prop="remaining" label="库存"></el-table-column>
            
            <!-- 新增：最大购买量 -->
            <el-table-column prop="maxQuantity" label="限购数量">
                <template #default="scope">
                    {{ scope.row.maxQuantity === -1 ? '不限制' : '最多购买' + scope.row.maxQuantity + '件' }}
                </template>
            </el-table-column>

            <el-table-column prop="isListed" label="是否上架">
                <template #default="scope">
                    <el-tag :type="scope.row.isListed ? 'success' : 'danger'">
                        {{ scope.row.isListed ? '已上架' : '已下架' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间">
                <template #default="scope">
                    {{ new Date(scope.row.createTime).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                        编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑商品弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" >
            <el-form :model="form"  ref="formRef" label-width="120px">
                <el-form-item label="商品名称" prop="productName">
                    <el-input v-model="form.productName"></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model="form.price" type="number" suffix="元"></el-input>
                </el-form-item>
                <el-form-item label="库存" prop="remaining">
                    <el-input v-model="form.remaining" type="number" suffix="件"></el-input>
                </el-form-item>

                <!-- 新增：最大购买数量 -->
                <el-form-item label="最大购买量" prop="maxQuantity">
                    <el-input 
                        v-model="form.maxQuantity" 
                        type="number" 
                        placeholder="请输入 -1 表示不限制，或输入正整数"
                    ></el-input>
                    <div style="font-size:12px;color:#999;margin-top:4px;">
                        -1 = 不限制 | 不能输入 0
                    </div>
                </el-form-item>

                <el-form-item label="是否上架" prop="isListed">
                    <el-switch v-model="form.isListed" active-text="是" inactive-text="否"></el-switch>
                </el-form-item>
                <el-form-item label="商品图片">
                    <el-upload action="#" :before-upload="handleBeforeUpload" :show-file-list="false">
                        <el-button type="primary">上传图片</el-button>
                    </el-upload>
                    <img v-if="form.pic" :src="form.pic" class="preview-img" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { commodityApi } from '@/api';

const router = useRouter();

// 商品列表
const commodityList = ref<any[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增商品');
const formRef = ref<any>(null);

// 表单数据：增加 maxQuantity
const form = ref({
    id: 0,
    productName: '',
    price: '',
    remaining: '',
    maxQuantity: -1, // 默认不限制
    isListed: true,
    pic: ''
});

// // 表单验证规则（包含 maxQuantity 验证）
// const rules = ref({
//     productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
//     price: [{ required: true, message: '请输入价格', trigger: 'blur', type: 'number' }],
//     remaining: [{ required: true, message: '请输入库存', trigger: 'blur', type: 'number' }],
//     // 最大购买量验证：不能为0，只能是-1或正整数
//     maxQuantity: [
//         { required: true, message: '请输入最大购买数量', trigger: 'blur' },
//         {
//             validator: (rule: any, value: any, cb: any) => {
//                 const val = Number(value);
//                 if (val === 0) {
//                     cb(new Error('不允许设置为 0，请输入 -1 或正整数'));
//                 } else if (val < -1) {
//                     cb(new Error('不能小于 -1'));
//                 } else if (!Number.isInteger(val)) {
//                     cb(new Error('必须输入整数'));
//                 } else {
//                     cb();
//                 }
//             },
//             trigger: 'blur'
//         }
//     ]
// });

// 获取商品列表
const getCommodityList = async () => {
    try {
        const res = await commodityApi.getCommodityList();
        commodityList.value = res.data;
    } catch (error) {
        console.error('获取商品列表失败:', error);
    }
};

// 新增商品
const handleAdd = () => {
    dialogTitle.value = '新增商品';
    form.value = {
        id: 0,
        productName: '',
        price: '',
        remaining: '',
        maxQuantity: -1, // 默认不限制
        isListed: true,
        pic: ''
    };
    dialogVisible.value = true;
};

// 编辑商品
const handleEdit = (row: any) => {
    dialogTitle.value = '编辑商品';
    form.value = {
        id: row.id,
        productName: row.productName,
        price: row.price,
        remaining: row.remaining,
        maxQuantity: row.maxQuantity, // 回填
        isListed: row.isListed,
        pic: row.pic
    };
    dialogVisible.value = true;
};

// 删除商品
const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            '此操作将永久删除该商品, 是否继续?',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        const res = await commodityApi.deleteCommodity(id);
        ElMessage.success(res.msg);
        getCommodityList();
    } catch (error) {
        ElMessage.info('已取消删除');
    }
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;
    try {
        await formRef.value.validate();

        const submitData = {
            productName: form.value.productName,
            price: String(form.value.price),
            remaining: String(form.value.remaining),
            maxQuantity: String(form.value.maxQuantity), // 提交新增字段
            isListed: String(form.value.isListed),
            pic: form.value.pic || ''
        };

        let res;
        if (form.value.id) {
            res = await commodityApi.updateCommodity(form.value.id, submitData);
        } else {
            res = await commodityApi.addCommodity(submitData);
        }

        ElMessage.success(res.msg);
        dialogVisible.value = false;
        getCommodityList();
    } catch (error) {
        console.error('提交失败:', error);
    }
};

// 图片上传处理
const handleBeforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        form.value.pic = reader.result as string;
    };
    return false;
};

// 返回上一页
const goBack = () => {
    router.back();
};

onMounted(() => {
    getCommodityList();
});
</script>

<style scoped>
.admin-commodity {
    padding: 20px;
}

.add-btn {
    margin-bottom: 20px;
}

.preview-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-top: 10px;
}
</style>