import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle2, Phone, X, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function AdminQuickCalls() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(''); // Empty string fetches all by default
  const [activeTab, setActiveTab] = useState<'scheduled' | 'past'>('scheduled');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['admin-appointments', date],
    queryFn: async () => {
      const res = await api.get(`/appointments/admin/all?date=${date}`);
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/slots/${id}`),
    onSuccess: () => {
      toast.success('Appointment cancelled');
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
    onError: () => toast.error('Failed to cancel appointment')
  });

  const scheduledCalls = appointments?.filter((appt: any) => {
    const isPast = new Date() > new Date(new Date(appt.slot.date).setHours(
      parseInt(appt.slot.startTime.split(':')[0]), 
      parseInt(appt.slot.startTime.split(':')[1])
    ));
    return appt.status === 'CONFIRMED' && !isPast;
  }) || [];

  const pastCalls = appointments?.filter((appt: any) => {
    const isPast = new Date() > new Date(new Date(appt.slot.date).setHours(
      parseInt(appt.slot.startTime.split(':')[0]), 
      parseInt(appt.slot.startTime.split(':')[1])
    ));
    return appt.status === 'CANCELLED' || appt.status === 'COMPLETED' || (appt.status === 'CONFIRMED' && isPast);
  }) || [];

  const displayCalls = activeTab === 'scheduled' ? scheduledCalls : pastCalls;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Calls</h1>
          <p className="mt-1 text-gray-500">Manage scheduled counseling calls.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scheduled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('scheduled')}
            >
              Scheduled ({scheduledCalls.length})
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past / Cancelled ({pastCalls.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            {date && (
              <Button variant="outline" size="sm" onClick={() => setDate('')}>
                Clear Filter
              </Button>
            )}
            <input
              type="date"
              className="input max-w-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading appointments...</div>
          ) : displayCalls.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-500" />
              </div>
              <p>No {activeTab} appointments found for this date.</p>
            </div>
          ) : (
            displayCalls.map((appt: any) => {
              const isPast = new Date() > new Date(new Date(appt.slot.date).setHours(
                parseInt(appt.slot.startTime.split(':')[0]), 
                parseInt(appt.slot.startTime.split(':')[1])
              ));

              return (
                <div key={appt.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4 items-start w-full md:w-auto">
                    <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                      {appt.student.studentProfile?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{appt.student.studentProfile?.fullName || 'Student'}</h3>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 rounded">{appt.student.studentProfile?.studentId || 'No ID'}</span>
                        <StatusBadge status={appt.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1.5 font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          <Clock className="w-4 h-4" />
                          {new Date(appt.slot.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-gray-700">
                          {appt.slot.startTime} - {appt.slot.endTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {appt.student.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          Google Meet
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full md:w-auto items-center gap-3 md:justify-end">
                    {appt.status === 'CONFIRMED' && !isPast ? (
                      <>
                        <Button variant="outline" className="flex-1 md:flex-none">
                          Start Call
                        </Button>
                        <Button 
                          variant="danger" 
                          className="flex-1 md:flex-none"
                          onClick={() => {
                            if (confirm('Cancel this call?')) {
                              cancelMutation.mutate(appt.id);
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : appt.status === 'CONFIRMED' && isPast ? (
                      <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
