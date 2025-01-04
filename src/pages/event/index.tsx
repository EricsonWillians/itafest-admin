// src/pages/events/EventsPage.tsx

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Example event API & types - Adjust import paths as needed
import { eventApi } from '@/lib/api/event';
import type { Event } from '@/types/event.types';

// Example business API & types - Adjust if needed
import { businessApi } from '@/lib/api/business';
import type { Business } from '@/types/business.types';

// Debug utility (mirroring your BusinessPage approach)
const DEBUG = {
  enabled: import.meta.env.DEV,
  log: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    console.log(`%c🔍 [Events Page][${area}] ${message}`, 'color: #8B5CF6; font-weight: bold;', data || '');
  },
  error: (area: string, message: string, error?: any) => {
    if (!DEBUG.enabled) return;
    console.error(`%c❌ [Events Page][${area}] ${message}`, 'color: #EF4444; font-weight: bold;', error || '');
  },
  warn: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    console.warn(`%c⚠️ [Events Page][${area}] ${message}`, 'color: #F59E0B; font-weight: bold;', data || '');
  },
};

export const EventsPage: React.FC = () => {
  DEBUG.log('Lifecycle', 'Component rendering started');

  // -------------------------------
  //        State management
  // -------------------------------
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit] = useState(10);

  // For create/update forms
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    businessId: '',
  });

  const [editEventData, setEditEventData] = useState({
    id: '',
    title: '',
    description: '',
    date: '',
    location: '',
    businessId: '',
  });

  // We need a query client to invalidate or refetch queries after mutations
  const queryClient = useQueryClient();

  useEffect(() => {
    DEBUG.log('Mount', 'Component mounted', {
      initialState: { page, searchTerm, selectedCategory, limit },
    });

    return () => {
      DEBUG.log('Cleanup', 'Component will unmount');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  //        Fetch businesses
  //  (for choosing businessId)
  // -------------------------------
  const {
    data: businessListData,
    isLoading: isBusinessesLoading,
  } = useQuery({
    queryKey: ['businesses', 'all'],
    queryFn: async () => {
      const result = await businessApi.getBusinesses({ page: 1, limit: 999 });
      return result.data; // array of businesses
    },
    staleTime: 1000 * 60,
  });

  // -------------------------------
  //        Fetch events list
  // -------------------------------
  const {
    data: eventsData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['events', page, searchTerm, selectedCategory, limit],
    queryFn: async () => {
      DEBUG.log('Query', 'Starting event fetch', { page, searchTerm, selectedCategory, limit });
      const result = await eventApi.getEvents({
        page,
        limit,
        search: searchTerm,
        categoryId: selectedCategory || undefined,
      });
      DEBUG.log('Query', 'Event fetch successful', result);
      return result;
    },
    staleTime: 1000 * 60,
    keepPreviousData: true,
    retry: 1,
    onError: (err) => {
      DEBUG.error('Query Error Handler', 'Query error occurred', err);
    },
    onSuccess: (data) => {
      DEBUG.log('Query Success Handler', 'Query completed successfully', data);
    },
    onSettled: () => {
      DEBUG.log('Query Settled', 'Query settled (success or error)');
    },
  });

  // -------------------------------
  //         CREATE EVENT
  // -------------------------------
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
      return eventApi.createEvent(eventData);
    },
    onSuccess: () => {
      DEBUG.log('Create Mutation', 'Event created successfully');
      // Close modal, reset form, refetch data
      setShowCreateDialog(false);
      setNewEventData({ title: '', description: '', date: '', location: '', businessId: '' });
      // Invalidate or refetch 'events' to see the new event in the list
      queryClient.invalidateQueries(['events']);
    },
    onError: (err) => {
      DEBUG.error('Create Mutation', 'Event creation failed', err);
      // Optionally show a toast or alert
    },
  });

  const handleCreateEvent = () => {
    // Minimal validation
    if (!newEventData.title || !newEventData.date || !newEventData.businessId) {
      alert('Title, date, and business are required.');
      return;
    }
    createEventMutation.mutate({
      title: newEventData.title,
      description: newEventData.description,
      date: new Date(newEventData.date),
      location: newEventData.location,
      businessId: newEventData.businessId,
    });
  };

  // -------------------------------
  //         UPDATE EVENT
  // -------------------------------
  const updateEventMutation = useMutation({
    mutationFn: async (data: Event) => {
      // Call API passing the eventId and partial update
      return eventApi.updateEvent(data.id!, {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        businessId: data.businessId,
      });
    },
    onSuccess: () => {
      DEBUG.log('Update Mutation', 'Event updated successfully');
      // Close modal, reset form, refetch
      setShowEditDialog(false);
      setEditEventData({ id: '', title: '', description: '', date: '', location: '', businessId: '' });
      queryClient.invalidateQueries(['events']);
    },
    onError: (err) => {
      DEBUG.error('Update Mutation', 'Event update failed', err);
    },
  });

  const handleUpdateEvent = () => {
    if (!editEventData.title || !editEventData.date || !editEventData.businessId) {
      alert('Title, date, and business are required.');
      return;
    }
    // Construct an Event object
    const updatedEvent: Event = {
      id: editEventData.id,
      title: editEventData.title,
      description: editEventData.description,
      date: new Date(editEventData.date),
      location: editEventData.location,
      businessId: editEventData.businessId,
      createdAt: new Date(), // placeholder
      updatedAt: new Date(), // placeholder
    };
    updateEventMutation.mutate(updatedEvent);
  };

  // Populate edit form and open dialog
  const onEditClick = (evt: Event) => {
    setEditEventData({
      id: evt.id || '',
      title: evt.title || '',
      description: evt.description || '',
      date: evt.date ? new Date(evt.date).toISOString().slice(0, 16) : '',
      location: evt.location || '',
      businessId: evt.businessId || '',
    });
    setShowEditDialog(true);
  };

  // -------------------------------
  //         DELETE EVENT
  // -------------------------------
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      return eventApi.deleteEvent(id);
    },
    onSuccess: () => {
      DEBUG.log('Delete Mutation', 'Event deleted successfully');
      queryClient.invalidateQueries(['events']);
    },
    onError: (err) => {
      DEBUG.error('Delete Mutation', 'Event delete failed', err);
    },
  });

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  // -------------------------------
  //      UI / Render Logic
  // -------------------------------
  useEffect(() => {
    DEBUG.log('State Change', 'Page changed', { page });
  }, [page]);

  useEffect(() => {
    DEBUG.log('State Change', 'Search term changed', { searchTerm });
  }, [searchTerm]);

  useEffect(() => {
    DEBUG.log('State Change', 'Category changed', { selectedCategory });
  }, [selectedCategory]);

  useEffect(() => {
    DEBUG.log('Query State', 'Query state updated', {
      isLoading,
      isError,
      isFetching,
      error,
      dataExists: !!eventsData,
      eventCount: eventsData?.data?.length,
    });
  }, [eventsData, isLoading, isError, isFetching, error]);

  // DevTools for manual refetch in DEV mode
  const DevTools = () => {
    if (!DEBUG.enabled) return null;
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-gray-800 rounded-lg shadow-lg text-white space-y-2">
        <div className="text-sm font-mono">
          <div>Loading: {String(isLoading)}</div>
          <div>Error: {String(isError)}</div>
          <div>Fetching: {String(isFetching)}</div>
          <div>Results: {eventsData?.data?.length || 0}</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Manual Refetch
        </Button>
      </div>
    );
  };

  DEBUG.log('Render', 'Rendering state check', { isLoading, isError });

  if (isLoading) {
    DEBUG.log('Render', 'Showing loading state');
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    DEBUG.error('Render', 'Showing error state', error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If query succeeds
  const events = eventsData?.data || [];
  const totalPages = eventsData?.pagination?.totalPages || 1;

  DEBUG.log('Render', 'Rendering main content', { eventCount: events.length, totalPages });

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Events</h2>
            <p className="text-sm text-muted-foreground">Showing page {page} of {totalPages}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>+ Create Event</Button>
        </header>

        {/* Your existing event list */}
        <div className="space-y-2">
          {events.map((evt: Event) => (
            <div key={evt.id} className="rounded border p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold">{evt.title}</p>
                <p>{evt.description}</p>
                <p className="text-xs text-muted-foreground">
                  Date: {new Date(evt.date).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Business ID: {evt.businessId}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={() => onEditClick(evt)}>
                  Edit
                </Button>
                <Button variant="destructive" size="xs" onClick={() => handleDeleteEvent(evt.id!)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((old) => Math.max(old - 1, 1))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((old) => old + 1)}>
            Next
          </Button>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={newEventData.title}
                onChange={(e) => setNewEventData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Short description"
                value={newEventData.description}
                onChange={(e) => setNewEventData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newEventData.date}
                onChange={(e) => setNewEventData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Event location"
                value={newEventData.location}
                onChange={(e) => setNewEventData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label>Business</Label>
              {isBusinessesLoading ? (
                <p className="text-sm text-muted-foreground">Loading businesses...</p>
              ) : (
                <Select
                  value={newEventData.businessId}
                  onValueChange={(val) => setNewEventData((prev) => ({ ...prev, businessId: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessListData?.map((biz: Business) => (
                      <SelectItem key={biz.id} value={biz.id}>
                        {biz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateEvent} disabled={createEventMutation.isLoading}>
              {createEventMutation.isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Event title"
                value={editEventData.title}
                onChange={(e) => setEditEventData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Short description"
                value={editEventData.description}
                onChange={(e) => setEditEventData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editEventData.date}
                onChange={(e) => setEditEventData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="Event location"
                value={editEventData.location}
                onChange={(e) => setEditEventData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label>Business</Label>
              {isBusinessesLoading ? (
                <p className="text-sm text-muted-foreground">Loading businesses...</p>
              ) : (
                <Select
                  value={editEventData.businessId}
                  onValueChange={(val) => setEditEventData((prev) => ({ ...prev, businessId: val }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessListData?.map((biz: Business) => (
                      <SelectItem key={biz.id} value={biz.id}>
                        {biz.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEvent} disabled={updateEventMutation.isLoading}>
              {updateEventMutation.isLoading ? 'Updating...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Only visible in DEV mode */}
      <DevTools />
    </>
  );
};

export default EventsPage;
