// src/types/event.types.ts

/**
 * Reuse or extend from existing CategoryType if it matches
 * your needs. For a standalone approach, define it here:
 */
export type CategoryType = "product" | "service" | "venue" | "conference" | "concert";

/**
 * Basic Category interface for reference
 */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
}

/**
 * Basic Tag interface for reference
 */
export interface Tag {
  id: string;
  name: string;
  status: "active" | "deprecated" | "inactive";
}

/**
 * Primary Event interface
 */
export interface Event {
  id: string;
  title: string;
  description?: string;

  /** Date/time of the event (stored as ISO date string or Date object) */
  date: Date;

  /** Where the event will be held */
  location: string;

  /**
   * Optional single category for the event.
   * If your domain allows multiple categories, you could also make this an array.
   */
  category?: {
    id: string;
    type: CategoryType;
    details?: Category;
  };

  /**
   * If you want multiple tags, store them in an array.
   */
  tags: Array<{
    id: string;
    details?: Tag;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response interface for a paginated list of events,
 * mirroring your BusinessListResponse structure.
 */
export interface EventListResponse {
  success: boolean;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    itemsPerPage: number;
  };
}
