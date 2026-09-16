import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Select } from '../../components/ui/Select';

export default function AdminTickets() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [closed, setClosed] = useState(false);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page, search, closed],
    queryFn: async () => {
      const res = await api.get(`/tickets/all?page=${page}&limit=${limit}&search=${search}&closed=${closed}`);
      return {
        tickets: res.data.data,
        total: res.data.pagination?.total || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          <p className="mt-1 text-gray-500">View, manage, and resolve student requests.</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by ID, title, or student email..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              className="w-40"
              value={closed ? 'true' : 'false'}
              onChange={(e) => {
                setClosed(e.target.value === 'true');
                setPage(1);
              }}
              options={[
                { value: 'false', label: 'Active Tickets' },
                { value: 'true', label: 'Closed Tickets' },
              ]}
            />
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
              ) : data?.tickets?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No tickets found.</td></tr>
              ) : (
                data?.tickets?.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-gray-900 mb-1 text-xs">{ticket.ticketNumber}</div>
                      <div className="font-medium text-gray-900 max-w-xs truncate">{ticket.title}</div>
                      <div className="text-gray-500 text-xs">{ticket.category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ticket.student?.studentProfile?.fullName || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{ticket.student?.email}</div>
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
                      <Link to={`/admin/tickets/${ticket.id}`}>
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
