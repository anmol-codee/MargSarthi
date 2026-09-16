import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MoreVertical, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Badge } from '../../components/ui/Badge';

export default function AdminStudents() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', page, search],
    queryFn: async () => {
      const res = await api.get(`/admin/students?page=${page}&limit=${limit}&search=${search}`);
      return {
        students: res.data.data,
        total: res.data.pagination?.total || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-gray-500">Manage and view registered student profiles.</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by name, email, phone, or ID..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Profile Completion</th>
                <th className="px-6 py-4">Tickets</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading students...</td></tr>
              ) : data?.students?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No students found.</td></tr>
              ) : (
                data?.students?.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.studentProfile?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.studentProfile?.fullName || 'No Name'}</div>
                          <div className="text-gray-500 text-xs font-mono">{student.studentProfile?.studentId || 'No ID'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{student.email}</div>
                      <div className="text-gray-500 text-xs">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${student.studentProfile?.completionPercent === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`} 
                          style={{ width: `${student.studentProfile?.completionPercent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{student.studentProfile?.completionPercent || 0}%</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {student._count?.ticketsRaised || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/students/${student.id}`}>
                        <Button variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                          View
                        </Button>
                      </Link>
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
