// src/lib/api/events.ts

import axios from "axios";
import type { Event, EventListResponse } from "@/types/event.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * eventApi provides a set of methods to interact with
 * the Event backend endpoints, mirroring the structure
 * of your businessApi.
 */
export const eventApi = {
  /**
   * Fetch a list of events with optional pagination and filtering.
   * @param params Query parameters for filtering, pagination, etc.
   */
  getEvents: async (params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    // If you want categoryType, you could add it:
    // categoryType?: string;
    tags?: string[];
    search?: string;
    sort?: string; // Or narrow down to specific Event fields
  }) => {
    const response = await axios.get<EventListResponse>(`${API_URL}/api/v1/events`, {
      params: {
        ...params,
        // Convert tags array to comma-separated string
        tags: params.tags?.join(","),
      },
    });
    return response.data;
  },

  /**
   * Fetch a single event by ID.
   * @param id The unique identifier of the event
   */
  getEvent: async (id: string) => {
    const response = await axios.get<{ success: boolean; data: Event }>(
      `${API_URL}/api/v1/events/${id}`
    );
    return response.data;
  },

  /**
   * Create a new event.
   * @param data The event data to create
   */
  createEvent: async (data: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
    const response = await axios.post<{ success: boolean; data: Event }>(
      `${API_URL}/api/v1/events`,
      data
    );
    return response.data;
  },

  /**
   * Update an existing event.
   * @param id The ID of the event to update
   * @param data The partial event data to update
   */
  updateEvent: async (id: string, data: Partial<Event>) => {
    const response = await axios.put<{ success: boolean; data: Event }>(
      `${API_URL}/api/v1/events/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an event by ID.
   * @param id The unique identifier of the event to delete
   */
  deleteEvent: async (id: string) => {
    const response = await axios.delete<{ success: boolean }>(
      `${API_URL}/api/v1/events/${id}`
    );
    return response.data;
  },
};
