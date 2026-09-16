import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Phone, Calendar as CalendarIcon, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';

export default function QuickCall() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const { data: slots, isLoading } = useQuery({
    queryKey: ['available-slots', dateStr],
    queryFn: async () => {
      const { data } = await api.get(`/appointments/slots?from=${dateStr}`);
      return data.data;
    }
  });

  const bookMutation = useMutation({
    mutationFn: (slotId: string) => api.post('/appointments/book', { slotId }),
    onSuccess: () => {
      toast.success('Call scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      navigate('/student/appointments');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book slot');
    }
  });

  // Group slots by date
  const groupedSlots = slots?.reduce((acc: any, slot: any) => {
    const d = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const dates = groupedSlots ? Object.keys(groupedSlots).sort() : [];
  const displayDates = dates.length > 0 ? dates : [dateStr];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Book a Quick Call</h1>
        <p className="mt-3 text-lg text-gray-600">
          Need immediate assistance? Schedule a 10-15 minute call with our support team or counselors to get your queries resolved fast.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Dates */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Available Days
          </h2>
          <div className="space-y-2">
            {displayDates.map((dateStr) => {
              const d = new Date(dateStr);
              const isSelected = selectedDate.toISOString().split('T')[0] === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(d)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold">{d.toLocaleDateString('en-IN', { weekday: 'long' })}</div>
                  <div className="text-sm opacity-80">{d.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Slots */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Select Time Slot
          </h2>
          
          <div className="card p-6 min-h-[300px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">Loading slots...</div>
            ) : !groupedSlots || !groupedSlots[selectedDate.toISOString().split('T')[0]] ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Clock className="w-12 h-12 text-gray-300 mb-3" />
                <p>No slots available on this date.</p>
                <p className="text-sm mt-1">Please select another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedSlots[selectedDate.toISOString().split('T')[0]].map((slot: any) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isFull = slot.available <= 0;

                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                        isFull 
                          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
                          : isSelected
                            ? 'border-primary-500 bg-primary-50/50 shadow-md transform scale-[1.02]'
                            : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg font-bold text-gray-900">{slot.startTime}</span>
                      <span className="text-sm text-gray-500">to {slot.endTime}</span>
                      
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span className={isFull ? 'text-red-500' : 'text-emerald-600'}>
                          {slot.available} / {slot.capacity} available
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary-500 rounded-bl-xl flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              className="px-8 shadow-lg shadow-primary-500/20"
              disabled={!selectedSlotId}
              isLoading={bookMutation.isPending}
              onClick={() => selectedSlotId && bookMutation.mutate(selectedSlotId)}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
