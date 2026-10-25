import { axiosClient } from '../../../core/api/axiosClient';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderChannel = 'FACEBOOK' | 'SHOPEE';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    sku: string;
    name: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  fbUserId?: string;
}

export interface Order {
  id: string;
  orderCode: number;
  channel: OrderChannel;
  customerId: string;
  customer: Customer;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  payosPaymentId?: string;
  ghnOrderCode?: string;
  shopeeOrderId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerId: string;
  channel?: OrderChannel;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const orderApi = {
  getOrders: async (status?: string): Promise<{ success: boolean; data: Order[] }> => {
    const query = status ? `?status=${status}` : '';
    return axiosClient.get(`/orders${query}`);
  },
  getOrderById: async (id: string): Promise<{ success: boolean; data: Order }> => {
    return axiosClient.get(`/orders/${id}`);
  },
  createOrder: async (input: CreateOrderInput): Promise<{ success: boolean; data: Order }> => {
    return axiosClient.post('/orders', input);
  },
  updateStatus: async (id: string, status: OrderStatus): Promise<{ success: boolean; data: Order }> => {
    return axiosClient.patch(`/orders/${id}/status`, { status });
  },
};

