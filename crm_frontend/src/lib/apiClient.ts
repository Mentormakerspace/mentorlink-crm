import axios, { AxiosInstance } from 'axios';

import { User } from '../types/crm';

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserPayload {
  role: string;
}

import { Deal, Client, StageHistory, PaymentSchedule } from '../types/crm';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<{users: User[]}>('/users');
  return response.data.users;
};

export const createUser = async (payload: CreateUserPayload): Promise<void> => {
  await apiClient.post('/users', payload);
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<void> => {
  await apiClient.patch(`/users/${id}`, payload);
};

export const fetchDeals = async (): Promise<Deal[]> => {
  const response = await apiClient.get<{deals: Deal[]}>('/deals');
  return response.data.deals;
};

export const createDeal = async (payload: any): Promise<{deal: Deal}> => {
  const response = await apiClient.post<{deal: Deal}>('/deals', payload);
  return response.data;
};

export const updateDeal = async (id: number, payload: any): Promise<{deal: Deal}> => {
  const response = await apiClient.put<{deal: Deal}>(`/deals/${id}`, payload);
  return response.data;
};

export const deleteDeal = async (id: number): Promise<void> => {
  await apiClient.delete(`/deals/${id}`);
};

export const fetchClients = async (): Promise<Client[]> => {
  const response = await apiClient.get<{clients: Client[]}>('/clients');
  return response.data.clients;
};

export const createClient = async (payload: any): Promise<void> => {
  await apiClient.post('/clients', payload);
};

export const fetchStageHistory = async (dealId: number): Promise<StageHistory[]> => {
  const response = await apiClient.get<{stage_history: StageHistory[]}>(`/deals/${dealId}/stage_history`);
  return response.data.stage_history;
};

export const fetchPaymentSchedules = async (dealId: number): Promise<PaymentSchedule[]> => {
  const response = await apiClient.get<{payment_schedules: PaymentSchedule[]}>(`/deals/${dealId}/payment_schedules`);
  return response.data.payment_schedules;
};

export const createPaymentSchedule = async (dealId: number, payload: any): Promise<void> => {
  await apiClient.post(`/deals/${dealId}/payment_schedules`, payload);
};

export const login = async (email: string, password: string): Promise<{access_token: string, user: User}> => {
  const response = await apiClient.post<{access_token: string, user: User}>('/auth/login', {
    email,
    password
  });
  return response.data;
};

export default apiClient;
