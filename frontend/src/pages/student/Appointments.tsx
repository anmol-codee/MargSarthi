import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Clock, Phone, CheckCircle2, Calendar as CalendarIcon, Video } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function Appointments() {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['student-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments/my-appointments');
      return data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      toast.success('Appointment cancelled');
      queryClient.invalidateQueries({ queryKey: ['student-appointments'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
    onSettled: () => setCancelingId(null)
  });

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setCancelingId(id);
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-1 text-gray-500">View and manage your scheduled calls with counselors.</p>
      </div>

      <div className="card divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading appointments...</div>
        ) : appointments?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-500 mb-6">Book a quick call to speak directly with our support team.</p>
            <Button onClick={() => window.location.href = '/student/quick-call'}>Book a Call</Button>
          </div>
        ) : (
          appointments?.map((appt: any) => {
            const date = new Date(appt.slot.date);
            const isPast = new Date() > new Date(new Date(appt.slot.date).setHours(
              parseInt(appt.slot.startTime.split(':')[0]), 
              parseInt(appt.slot.startTime.split(':')[1])
            ));

            return (
              <div key={appt.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-semibold uppercase">{date.toLocaleString('en-IN', { month: 'short' })}</span>
                    <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">Counseling Call</h3>
                      <StatusBadge status={appt.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {appt.slot.startTime} - {appt.slot.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        Google Meet / Phone
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                  {appt.status === 'CONFIRMED' && !isPast ? (
                    <>
                      <Button variant="outline" className="flex-1 md:flex-none">
                        Join Call
                      </Button>
                      <Button 
                        variant="danger" 
                        className="flex-1 md:flex-none"
                        isLoading={cancelingId === appt.id}
                        onClick={() => handleCancel(appt.id)}
                      >
                        Cancel
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
  );
}
