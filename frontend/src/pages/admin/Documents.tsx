import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

export default function AdminDocuments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-documents', page, search, status],
    queryFn: async () => {
      let url = `/admin/documents?page=${page}&limit=${limit}&search=${search}`;
      if (status !== 'ALL') {
        url += `&status=${status}`;
      }
      const res = await api.get(url);
      return {
        documents: res.data.data,
        total: res.data.pagination?.total || 0
      };
    }
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string, isVerified: boolean }) => 
      api.patch(`/admin/documents/${id}/verify`, { isVerified }),
    onSuccess: () => {
      toast.success('Document status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
    },
    onError: () => toast.error('Failed to update document status')
  });

  const handleViewDocument = async (docId: string, studentId: string) => {
    try {
      const { data } = await api.get(`/admin/students/${studentId}/documents/${docId}/url`);
      if (data.success && data.data.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      toast.error('Could not load document preview');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="mt-1 text-gray-500">Review and verify documents uploaded by students.</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by student name or email..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-48">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Documents' },
                { value: 'PENDING', label: 'Pending Verification' },
                { value: 'VERIFIED', label: 'Verified' },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading documents...</td></tr>
              ) : data?.documents?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No documents found.</td></tr>
              ) : (
                data?.documents?.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{doc.student?.studentProfile?.fullName || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{doc.student?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                      {doc.documentType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                        doc.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-warning-100 text-warning-800'
                      }`}>
                        {doc.isVerified ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="View Document"
                          onClick={() => handleViewDocument(doc.id, doc.studentId)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        {!doc.isVerified ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Mark as Verified"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => verifyMutation.mutate({ id: doc.id, isVerified: true })}
                            isLoading={verifyMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Revoke Verification"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => verifyMutation.mutate({ id: doc.id, isVerified: false })}
                            isLoading={verifyMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > limit && (
          <div className="border-t border-gray-100 p-4">
            <Pagination page={page} totalPages={Math.ceil(data.total / limit)} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
