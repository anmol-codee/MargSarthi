import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Pagination } from '../../components/ui/Pagination';

export default function StudentTickets({ closed = false }: { closed?: boolean }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['student-tickets', page, closed],
    queryFn: async () => {
      const res = await api.get(`/tickets?page=${page}&limit=${limit}&closed=${closed}`);
      return {
        tickets: res.data.data,
        total: res.data.pagination?.total || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{closed ? 'Closed Requests' : 'Active Requests'}</h1>
          <p className="mt-1 text-gray-500">Track and manage your {closed ? 'resolved' : 'ongoing'} queries and requests.</p>
        </div>
        {!closed && (
          <Link to="/student/tickets/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>Raise New Request</Button>
          </Link>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search by ID or title..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Title / Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading requests...</td>
                </tr>
              ) : data?.tickets?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No {closed ? 'closed' : 'active'} requests found.
                  </td>
                </tr>
              ) : (
                data?.tickets?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{ticket.ticketNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 max-w-xs truncate">{ticket.title}</div>
                      <div className="text-gray-500 text-xs mt-1">{ticket.category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority.label} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/student/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
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
            <Pagination
              page={page}
              totalPages={Math.ceil(data.total / limit)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
