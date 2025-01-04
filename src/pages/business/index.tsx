// src/pages/business/BusinessPage.tsx

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import your business API & type definitions
import { businessApi } from '@/lib/api/business';
import type { Business } from '@/types/business.types';

// Debug utility
const DEBUG = {
  enabled: import.meta.env.DEV,
  log: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    console.log(`%c🔍 [Business Page][${area}] ${message}`, 'color: #8B5CF6; font-weight: bold;', data || '');
  },
  error: (area: string, message: string, error?: any) => {
    if (!DEBUG.enabled) return;
    console.error(`%c❌ [Business Page][${area}] ${message}`, 'color: #EF4444; font-weight: bold;', error || '');
  },
  warn: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    console.warn(`%c⚠️ [Business Page][${area}] ${message}`, 'color: #F59E0B; font-weight: bold;', data || '');
  },
};

export const BusinessPage = () => {
  DEBUG.log('Lifecycle', 'Component rendering started');

  // -------------------------------
  //       State management
  // -------------------------------
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit] = useState(10);

  // For create/update forms
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [newBusinessData, setNewBusinessData] = useState<Partial<Business>>({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
  });

  const [editBusinessData, setEditBusinessData] = useState<Partial<Business>>({
    id: '',
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
  });

  // We need a query client to invalidate queries on create/update/delete
  const queryClient = useQueryClient();

  // -------------------------------
  //   Lifecycle / Logging
  // -------------------------------
  useEffect(() => {
    DEBUG.log('Mount', 'Component mounted', { page, searchTerm, selectedCategory, limit });
    return () => {
      DEBUG.log('Cleanup', 'Component will unmount');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  //  Query: Fetch Business List
  // -------------------------------
  const {
    data: businessData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['businesses', page, searchTerm, selectedCategory, limit],
    queryFn: async () => {
      DEBUG.log('Query', 'Starting business fetch', { page, searchTerm, selectedCategory, limit });
      const result = await businessApi.getBusinesses({
        page,
        limit,
        search: searchTerm,
        categoryId: selectedCategory || undefined,
      });
      DEBUG.log('Query', 'Business fetch successful', result);
      return result;
    },
    staleTime: 1000 * 60,
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      DEBUG.error('Query Error Handler', 'Query error occurred', error);
    },
    onSuccess: (data) => {
      DEBUG.log('Query Success Handler', 'Query completed successfully', data);
    },
    onSettled: () => {
      DEBUG.log('Query Settled', 'Query settled (success or error)');
    },
  });

  // -------------------------------
  //  CREATE Business Mutation
  // -------------------------------
  const createBusinessMutation = useMutation({
    mutationFn: async (data: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => {
      // calls createBusiness API
      return businessApi.createBusiness(data);
    },
    onSuccess: () => {
      DEBUG.log('Create Mutation', 'Business created successfully');
      // Close dialog, reset form
      setShowCreateDialog(false);
      setNewBusinessData({ name: '', description: '', email: '', phone: '', address: '' });
      // Invalidate business query to refresh data
      queryClient.invalidateQueries(['businesses']);
    },
    onError: (err) => {
      DEBUG.error('Create Mutation', 'Business creation failed', err);
    },
  });

  const handleCreateBusiness = () => {
    if (!newBusinessData.name) {
      alert('Business name is required.');
      return;
    }
    createBusinessMutation.mutate({
      name: newBusinessData.name!,
      description: newBusinessData.description || '',
      email: newBusinessData.email || '',
      phone: newBusinessData.phone || '',
      address: newBusinessData.address || '',
      // categories, tags, subscriptionStatus, etc. can be included here
    });
  };

  // -------------------------------
  //  UPDATE Business Mutation
  // -------------------------------
  const updateBusinessMutation = useMutation({
    mutationFn: async (body: Partial<Business>) => {
      if (!body.id) throw new Error('No business ID provided for update');
      return businessApi.updateBusiness(body.id, {
        name: body.name,
        description: body.description,
        email: body.email,
        phone: body.phone,
        address: body.address,
      });
    },
    onSuccess: () => {
      DEBUG.log('Update Mutation', 'Business updated successfully');
      setShowEditDialog(false);
      setEditBusinessData({ id: '', name: '', description: '', email: '', phone: '', address: '' });
      queryClient.invalidateQueries(['businesses']);
    },
    onError: (err) => {
      DEBUG.error('Update Mutation', 'Business update failed', err);
    },
  });

  const handleUpdateBusiness = () => {
    if (!editBusinessData.id || !editBusinessData.name) {
      alert('Business ID and name are required.');
      return;
    }
    updateBusinessMutation.mutate({
      id: editBusinessData.id,
      name: editBusinessData.name,
      description: editBusinessData.description || '',
      email: editBusinessData.email || '',
      phone: editBusinessData.phone || '',
      address: editBusinessData.address || '',
    });
  };

  // Populate the edit form with existing data & open the dialog
  const onEditClick = (biz: Business) => {
    setEditBusinessData({
      id: biz.id,
      name: biz.name,
      description: biz.description || '',
      email: biz.email || '',
      phone: biz.phone || '',
      address: biz.address || '',
    });
    setShowEditDialog(true);
  };

  // -------------------------------
  //  DELETE Business Mutation
  // -------------------------------
  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: string) => {
      return businessApi.deleteBusiness(id);
    },
    onSuccess: () => {
      DEBUG.log('Delete Mutation', 'Business deleted successfully');
      queryClient.invalidateQueries(['businesses']);
    },
    onError: (err) => {
      DEBUG.error('Delete Mutation', 'Business delete failed', err);
    },
  });

  const handleDeleteBusiness = (id: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      deleteBusinessMutation.mutate(id);
    }
  };

  // -------------------------------
  //        Effects & Logging
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
      dataExists: !!businessData,
      businessCount: businessData?.data?.length,
    });
  }, [businessData, isLoading, isError, isFetching, error]);

  // -------------------------------
  //        DevTools
  // -------------------------------
  const DevTools = () => {
    if (!DEBUG.enabled) return null;
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-gray-800 rounded-lg shadow-lg text-white space-y-2">
        <div className="text-sm font-mono">
          <div>Loading: {String(isLoading)}</div>
          <div>Error: {String(isError)}</div>
          <div>Fetching: {String(isFetching)}</div>
          <div>Results: {businessData?.data?.length || 0}</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Manual Refetch
        </Button>
      </div>
    );
  };

  DEBUG.log('Render', 'Rendering state check', { isLoading, isError });

  // -------------------------------
  //        Loading / Error UI
  // -------------------------------
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

  // -------------------------------
  //    Main Data: Business List
  // -------------------------------
  const businesses = businessData?.data || [];
  const totalPages = businessData?.pagination?.totalPages || 1;

  DEBUG.log('Render', 'Rendering main content', { businessCount: businesses.length, totalPages });

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Businesses</h2>
            <p className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>+ Create Business</Button>
        </header>

        <div className="space-y-2">
          {businesses.map((biz: Business) => (
            <div key={biz.id} className="rounded border p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold">{biz.name}</p>
                <p className="text-sm">{biz.description}</p>
                <p className="text-xs text-muted-foreground">Email: {biz.email ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Phone: {biz.phone ?? 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={() => onEditClick(biz)}>
                  Edit
                </Button>
                <Button variant="destructive" size="xs" onClick={() => handleDeleteBusiness(biz.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((old) => old + 1)}>
            Next
          </Button>
        </div>
      </div>

      {/* Create Business Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="biz-name">Name</Label>
              <Input
                id="biz-name"
                placeholder="Business name"
                value={newBusinessData.name ?? ''}
                onChange={(e) =>
                  setNewBusinessData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="biz-description">Description</Label>
              <Input
                id="biz-description"
                placeholder="Short description"
                value={newBusinessData.description ?? ''}
                onChange={(e) =>
                  setNewBusinessData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="biz-email">Email</Label>
              <Input
                id="biz-email"
                type="email"
                placeholder="example@domain.com"
                value={newBusinessData.email ?? ''}
                onChange={(e) =>
                  setNewBusinessData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="biz-phone">Phone</Label>
              <Input
                id="biz-phone"
                placeholder="Phone number"
                value={newBusinessData.phone ?? ''}
                onChange={(e) =>
                  setNewBusinessData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="biz-address">Address</Label>
              <Input
                id="biz-address"
                placeholder="Business address"
                value={newBusinessData.address ?? ''}
                onChange={(e) =>
                  setNewBusinessData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            {/* Additional fields like subscriptionStatus, tags, categories as needed */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBusiness} disabled={createBusinessMutation.isLoading}>
              {createBusinessMutation.isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-biz-name">Name</Label>
              <Input
                id="edit-biz-name"
                placeholder="Business name"
                value={editBusinessData.name ?? ''}
                onChange={(e) => setEditBusinessData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-biz-description">Description</Label>
              <Input
                id="edit-biz-description"
                placeholder="Short description"
                value={editBusinessData.description ?? ''}
                onChange={(e) =>
                  setEditBusinessData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-biz-email">Email</Label>
              <Input
                id="edit-biz-email"
                type="email"
                placeholder="example@domain.com"
                value={editBusinessData.email ?? ''}
                onChange={(e) => setEditBusinessData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-biz-phone">Phone</Label>
              <Input
                id="edit-biz-phone"
                placeholder="Phone number"
                value={editBusinessData.phone ?? ''}
                onChange={(e) => setEditBusinessData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-biz-address">Address</Label>
              <Input
                id="edit-biz-address"
                placeholder="Business address"
                value={editBusinessData.address ?? ''}
                onChange={(e) =>
                  setEditBusinessData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
            {/* Additional fields like subscriptionStatus, tags, categories as needed */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBusiness} disabled={updateBusinessMutation.isLoading}>
              {updateBusinessMutation.isLoading ? 'Updating...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DEV Tools */}
      <DevTools />
    </>
  );
};

export default BusinessPage;
