// src/types/business.types.ts

export type CategoryType = 'product' | 'service' | 'venue';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
  status: 'active' | 'deprecated' | 'inactive';
}

export interface Business {
  id: string;
  name: string;
  email?: string;
  description?: string;
  categories: Array<{
    id: string;
    type: CategoryType;
    details?: Category;
  }>;
  tags: Array<{
    id: string;
    details?: Tag;
  }>;
  subscriptionStatus: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessListResponse {
  success: boolean;
  data: Business[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    itemsPerPage: number;
  };
}