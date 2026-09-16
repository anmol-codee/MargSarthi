import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Ticket, CheckCircle, Clock, CreditCard, TrendingUp } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-gray-500">Real-time statistics and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-white to-primary-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.students.total || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-white to-amber-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.tickets.active || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-white to-emerald-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.tickets.resolved || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Calls Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.appointments.today || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Tickets</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recent.tickets?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No recent tickets</div>
            ) : (
              stats?.recent.tickets?.map((ticket: any) => (
                <div key={ticket.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ticket.ticketNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.student?.studentProfile?.fullName}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                    ticket.status === 'OPEN' ? 'bg-sky-100 text-sky-800' :
                    ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Registrations</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recent.students?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No recent registrations</div>
            ) : (
              stats?.recent.students?.map((student: any) => (
                <div key={student.studentId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {student.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{student.fullName}</p>
                      <p className="text-xs text-gray-500">{student.studentId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
