import { axiosClient } from '../../../core/api/axiosClient';

export interface ShopeeMapping {
  id: string;
  productId: string;
  shopeeItemId: string | number;
  shopeePrice: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight: number;
  shopeeItemMapping?: ShopeeMapping | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight?: number;
  shopeeItemId?: number;
  shopeePrice?: number;
}

export const productApi = {
  getProducts: async (): Promise<{ success: boolean; data: Product[] }> => {
    return axiosClient.get('/products');
  },
  getProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
    return axiosClient.get(`/products/${id}`);
  },
  createProduct: async (input: CreateProductInput): Promise<{ success: boolean; data: Product }> => {
    return axiosClient.post('/products', input);
  },
  updateProduct: async (id: string, input: Partial<CreateProductInput>): Promise<{ success: boolean; data: Product }> => {
    return axiosClient.put(`/products/${id}`, input);
  },
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    return axiosClient.delete(`/products/${id}`);
  },
};
