import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Bell, Trash2, Pin, Info } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';

export default function AdminNotices() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: notices, isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: async () => {
      const res = await api.get('/notices/admin');
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/notices', data),
    onSuccess: () => {
      toast.success('Notice published');
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      setShowForm(false);
      reset();
    },
    onError: () => toast.error('Failed to publish notice')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      toast.success('Notice deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    },
    onError: () => toast.error('Failed to delete notice')
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      isPinned: data.isPinned === 'true',
      isPublic: true // default to true for this demo
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices & Updates</h1>
          <p className="mt-1 text-gray-500">Manage announcements broadcasted to students.</p>
        </div>
        {!showForm && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
            New Notice
          </Button>
        )}
      </div>

      {showForm && (
        <div className="card p-6 border-2 border-primary-100 bg-primary-50/10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Publish New Notice</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message as string}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                {...register('category', { required: 'Category is required' })}
                options={[
                  { value: 'GENERAL', label: 'General' },
                  { value: 'ACADEMIC', label: 'Academic' },
                  { value: 'EXAM', label: 'Exam' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
              />
              <Select
                label="Pin to top?"
                {...register('isPinned')}
                options={[
                  { value: 'false', label: 'No, standard notice' },
                  { value: 'true', label: 'Yes, pin it' },
                ]}
              />
            </div>

            <Textarea
              label="Content"
              className="min-h-[150px]"
              {...register('content', { required: 'Content is required' })}
              error={errors.content?.message as string}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Publish Notice
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="card p-8 text-center text-gray-500">Loading notices...</div>
        ) : notices?.notices?.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            No notices published yet.
          </div>
        ) : (
          notices?.notices?.map((notice: any) => (
            <div key={notice.id} className={`card p-5 flex flex-col md:flex-row gap-4 items-start ${notice.isPinned ? 'border-amber-200 bg-amber-50/10' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {notice.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {notice.category}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {new Date(notice.publishedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
              </div>
              <div className="shrink-0">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => {
                    if(confirm('Delete this notice?')) deleteMutation.mutate(notice.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
