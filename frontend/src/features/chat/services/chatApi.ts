import { axiosClient } from '../../../core/api/axiosClient';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  fbUserId?: string;
  customTag?: string | null;
}

export interface Conversation {
  id: string;
  customerId: string;
  customer: Customer;
  lastMessage?: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'CUSTOMER' | 'STAFF';
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'QR_CODE';
  fbMessageId?: string;
  createdAt: string;
}

export const chatApi = {
  getConversations: async (): Promise<{ success: boolean; data: Conversation[] }> => {
    return axiosClient.get('/chat/conversations');
  },
  getMessages: async (conversationId: string): Promise<{ success: boolean; data: Message[] }> => {
    return axiosClient.get(`/chat/conversations/${conversationId}/messages`);
  },
  sendMessage: async (input: {
    conversationId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'QR_CODE';
  }): Promise<{ success: boolean; data: Message }> => {
    return axiosClient.post('/chat/messages', input);
  },
  aiParseOrder: async (input: {
    text?: string;
    conversationId?: string;
  }): Promise<{ success: boolean; data: any }> => {
    return axiosClient.post('/chat/ai-parse', input);
  },
  updateCustomerTag: async (customerId: string, customTag: string | null): Promise<any> => {
    return axiosClient.put(`/customers/${customerId}`, { customTag });
  },
};
