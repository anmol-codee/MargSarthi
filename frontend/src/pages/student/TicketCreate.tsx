import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

export default function TicketCreate() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { data: categories } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: async () => {
      const { data } = await api.get('/tickets/categories');
      return data.data;
    }
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: async () => {
      const { data } = await api.get('/tickets/priorities');
      return data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/tickets', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      toast.success('Request raised successfully!');
      navigate('/student/tickets');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to raise request');
    }
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('categoryId', data.categoryId);
    formData.append('priorityId', data.priorityId);
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Attachment must be less than 5MB');
        return;
      }
      formData.append('attachment', file);
    }
    
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raise New Request</h1>
          <p className="mt-1 text-sm text-gray-500">Provide details about your query or issue so we can help you better.</p>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Subject / Title"
            placeholder="Briefly describe your request (e.g., ID Card missing)"
            error={errors.title?.message as string}
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 5, message: 'Minimum 5 characters' }
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              options={categories?.map((c: any) => ({ value: c.id, label: c.name })) || []}
              error={errors.categoryId?.message as string}
              {...register('categoryId', { required: 'Please select a category' })}
            />
            
            <Select
              label="Priority"
              options={priorities?.map((p: any) => ({ value: p.id, label: p.label })) || []}
              error={errors.priorityId?.message as string}
              {...register('priorityId', { required: 'Please select priority' })}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Explain your issue in detail..."
            className="min-h-[150px]"
            error={errors.description?.message as string}
            {...register('description', { 
              required: 'Description is required',
              minLength: { value: 20, message: 'Please provide more details (min 20 characters)' }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors bg-gray-50/50">
              <div className="space-y-1 text-center">
                <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a file</span>
                    <input id="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
                {file && (
                  <p className="text-sm font-medium text-emerald-600 mt-2 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              className="mr-3"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
