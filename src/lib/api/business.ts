// src/lib/api/business.ts
import axios from 'axios';
import type { Business, BusinessListResponse } from '@/types/business.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const businessApi = {
  getBusinesses: async (params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    categoryType?: string;
    tags?: string[];
    search?: string;
    sort?: keyof Business;
    subscriptionStatus?: 'free' | 'premium';
  }) => {
    const response = await axios.get<BusinessListResponse>(`${API_URL}/api/v1/businesses`, {
      params: {
        ...params,
        tags: params.tags?.join(',')
      }
    });
    return response.data;
  },

  getBusiness: async (id: string) => {
    const response = await axios.get<{ success: boolean; data: Business }>(
      `${API_URL}/api/v1/businesses/${id}`
    );
    return response.data;
  },

  createBusiness: async (data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axios.post<{ success: boolean; data: Business }>(
      `${API_URL}/api/v1/businesses`,
      data
    );
    return response.data;
  },

  updateBusiness: async (id: string, data: Partial<Business>) => {
    const response = await axios.put<{ success: boolean; data: Business }>(
      `${API_URL}/api/v1/businesses/${id}`,
      data
    );
    return response.data;
  },

  deleteBusiness: async (id: string) => {
    const response = await axios.delete<{ success: boolean }>(
      `${API_URL}/api/v1/businesses/${id}`
    );
    return response.data;
  }
};