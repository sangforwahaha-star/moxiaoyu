import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export interface OrderInfo {
  order_id: string;
  amount: number;
  amount_yuan: number;
  subscription_level: string;
  subscription_name: string;
  period: string;
  period_label: string;
  months: number;
  expire_at: string;
}

export interface OrderStatus {
  order_id: string;
  subscription_level: string;
  subscription_name: string;
  period: string;
  amount: number;
  amount_yuan: number;
  payment_method: string | null;
  status: string;
  trade_no: string | null;
  paid_at: string | null;
  created_at: string | null;
}

export interface SimulateResult {
  success: boolean;
  order_id: string;
  trade_no: string;
  message: string;
  expire_at: string;
}

export const paymentApi = {
  createOrder: (level: string, period: string) =>
    api.post<OrderInfo>('/payment/create-order', { level, period }).then((res) => res.data),

  getOrderStatus: (orderId: string) =>
    api.get<OrderStatus>(`/payment/order/${orderId}`).then((res) => res.data),

  listOrders: (limit = 20) =>
    api.get<{ orders: OrderStatus[] }>(`/payment/orders?limit=${limit}`).then((res) => res.data),

  simulatePayment: (orderId: string, paymentMethod: string = 'alipay') =>
    api.post<SimulateResult>('/payment/simulate', { order_id: orderId, payment_method: paymentMethod }).then((res) => res.data),

  getPayUrl: (orderId: string, paymentMethod: string = 'alipay') =>
    api.post<{ pay_url: string }>('/payment/get-pay-url', { order_id: orderId, payment_method: paymentMethod }).then((res) => res.data),
};
