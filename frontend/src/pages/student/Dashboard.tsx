import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Ticket, FileText, ArrowRight, Bell, Clock, User } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['student-tickets', 1],
    queryFn: async () => {
      const res = await api.get('/tickets?limit=5');
      return { tickets: res.data.data };
    }
  });

  const { data: noticesData } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data } = await api.get('/notices?limit=3');
      return data.data;
    }
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['student-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments/my-appointments');
      return data.data;
    }
  });

  const percent = user?.completionPercent || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="mt-1 text-gray-500">Here's an overview of your academic profile and requests.</p>
        </div>
        <Link to="/student/tickets/new">
          <Button>Raise New Request</Button>
        </Link>
      </div>

      {/* Profile Completion Widget */}
      {percent < 100 && (
        <div className="bg-white p-5 rounded-xl border border-warning-200 bg-warning-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Complete your profile ({percent}%)</h3>
            <p className="text-sm text-gray-600 mt-1">Please complete your profile and upload documents to get them verified.</p>
          </div>
          <Link to="/student/profile">
            <Button variant="secondary" size="sm">Complete Profile</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Tickets & Appointments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Tickets */}
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary-500" />
                Recent Requests
              </h2>
              <Link to="/student/tickets" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoadingTickets ? (
                <div className="p-8 text-center text-gray-500">Loading tickets...</div>
              ) : ticketsData?.tickets?.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No requests raised yet.</div>
              ) : (
                ticketsData?.tickets?.map((ticket: any) => (
                  <Link key={ticket.id} to={`/student/tickets/${ticket.id}`} className="block p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{ticket.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.category.name}</p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Upcoming Calls
              </h2>
              <Link to="/student/quick-call" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                Book new <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <div className="p-5">
              {appointmentsData?.filter((a: any) => a.status === 'CONFIRMED' && new Date(a.slot.date) >= new Date(new Date().setHours(0,0,0,0)))?.length > 0 ? (
                <div className="space-y-3">
                  {appointmentsData.filter((a: any) => a.status === 'CONFIRMED' && new Date(a.slot.date) >= new Date(new Date().setHours(0,0,0,0))).map((appt: any) => (
                    <div key={appt.id} className="flex items-center justify-between bg-primary-50 border border-primary-100 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold text-primary-900">
                          {new Date(appt.slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-primary-700">{appt.slot.startTime} - {appt.slot.endTime}</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-white text-primary-700 rounded shadow-sm">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No upcoming calls scheduled.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Notices & Quick Links */}
        <div className="space-y-6">
          
          {/* Notices */}
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Latest Updates
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {!noticesData?.notices || noticesData.notices.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No new updates.</div>
              ) : (
                noticesData?.notices?.map((notice: any) => (
                  <div key={notice.id} className="p-5">
                    {notice.isPinned && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 mb-2">PINNED</span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{notice.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{notice.content}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(notice.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link to="/student/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">My Profile</p>
                  <p className="text-xs text-gray-500">Update details & docs</p>
                </div>
              </Link>
              <Link to="/student/tickets/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Request</p>
                  <p className="text-xs text-gray-500">Need help? Raise a ticket</p>
                </div>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
