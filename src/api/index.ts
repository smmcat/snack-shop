import { request } from '@/utils/request';

// 商品相关
export const commodityApi = {
  // 获取商品列表
  getCommodityList: () => request.get<{ code: number; msg: string; data: any[] }>('/api/commodity'),
  // 上架商品
  addCommodity: (data: any) => request.post<{ code: number; msg: string; id: number }>('/admin/commodity', data),
  // 修改商品
  updateCommodity: (id: number, data: any) => request.post<{ code: number; msg: string; data: any }>(`/admin/commodity/${id}`, data),
  // 删除商品
  deleteCommodity: (id: number) => request.delete<{ code: number; msg: string; id: number }>(`/admin/commodity/${id}`)
};

// 订单相关
export const orderApi = {
  // 获取订单列表
  getOrderList: () => request.get<{ code: number; msg: string; data: any[] }>('/record/list'),
  // 获取指定订单
  getOrderDetail: (id: number) => request.get<{ code: number; msg: string; data: any }>(`/record/list/${id}`),
  // 提交订单
  submitOrder: (data: { list: any[] }) => request.post<{ code: number; msg: string; id: number }>('/record/list', data),
  // 修改订单状态
  updateOrderStatus: (id: number, data: { isShipment: string; isPayment: string }) =>
    request.post<{ code: number; msg: string; data: any }>(`/record/list/${id}`, data),
  // 删除商品
  deleteOrder: (id: number) => request.delete<{ code: number; msg: string; id: number }>(`/record/list/${id}`)
};