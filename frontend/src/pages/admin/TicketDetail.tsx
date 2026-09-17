import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Paperclip, CheckCircle2, User } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Select } from '../../components/ui/Select';

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${id}`);
      return data.data;
    },
    enabled: !!id
  });

  const messageMutation = useMutation({
    mutationFn: (message: string) => api.post(`/tickets/${id}/messages`, { message }),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
    },
    onError: () => toast.error('Failed to send message')
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/tickets/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', id] });
    },
    onError: () => toast.error('Failed to update status')
  });

  if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 flex flex-col h-[calc(100dvh-12rem)] md:h-[calc(100vh-8rem)] min-h-[700px] md:min-h-[500px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4 md:gap-0">
        <div className="flex items-start md:items-center gap-2 md:gap-4">
          <Button variant="ghost" className="px-2 -ml-2 mt-0.5 md:mt-0 shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-1 leading-tight">{ticket.title}</h1>
            <div className="flex items-center gap-2 flex-wrap mb-2 md:mb-0 md:inline-flex">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority.label} />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-0 md:mt-1">
              Ticket #{ticket.ticketNumber} • {ticket.category.name} • Created on {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-auto pl-9 md:pl-0">
          <Select
            value={ticket.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            disabled={statusMutation.isPending}
            options={[
              { value: 'OPEN', label: 'Open' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'RESOLVED', label: 'Resolved' },
              { value: 'CLOSED', label: 'Closed' }
            ]}
          />
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 flex-1 min-h-0 flex-col-reverse lg:flex-row">
        {/* Main Conversation Area */}
        <div className="flex-1 flex flex-col card overflow-hidden border border-gray-200 shadow-sm min-h-[400px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/50">
            {/* Original Description as first message */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                {ticket.student.studentProfile?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="flex-1 space-y-2">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{ticket.student.studentProfile?.fullName || 'Student'} (Description)</span>
                    <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
                  
                  {ticket.attachmentUrl && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      {ticket.attachmentName && ticket.attachmentName.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Paperclip className="w-4 h-4" /> Attached Image:
                          </p>
                          <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer">
                            <img 
                              src={ticket.attachmentUrl} 
                              alt="Attachment" 
                              className="max-w-full md:max-w-md rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity" 
                            />
                          </a>
                        </div>
                      ) : (
                        <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-3 py-1.5 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                          View Attachment
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Messages */}
            {ticket.messages.map((msg: any) => {
              const isOwn = msg.senderId === user?.id;
              
              return (
                <div key={msg.id} className={`flex items-start gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isOwn ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {isOwn 
                      ? 'A' 
                      : (msg.sender.studentProfile?.fullName?.charAt(0) || 'S')}
                  </div>
                  <div className={`flex-1 space-y-2 ${isOwn ? 'flex flex-col items-end' : ''}`}>
                    <div className={`p-4 shadow-sm border max-w-[85%] ${
                      isOwn 
                        ? 'bg-amber-600 text-white rounded-2xl rounded-tr-none border-amber-600' 
                        : 'bg-white text-gray-700 rounded-2xl rounded-tl-none border-gray-100'
                    }`}>
                      <div className="flex justify-between items-center mb-1 gap-4 opacity-80">
                        <span className={`font-semibold text-xs ${isOwn ? 'text-amber-50' : 'text-gray-900'}`}>
                          {isOwn ? 'You (Admin)' : (msg.sender.studentProfile?.fullName || 'Student')}
                        </span>
                        <span className="text-xs">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-gray-700'}`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Input */}
          {(ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED') && (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your reply here..."
                    className="min-h-[80px]"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => messageMutation.mutate(newMessage)}
                  disabled={!newMessage.trim() || messageMutation.isPending}
                  className="mb-1"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              This ticket is closed. You cannot send new messages.
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 shrink-0 space-y-4 md:space-y-6">
          <div className="card p-4 md:p-5 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <User className="w-5 h-5 text-gray-400" />
              Student Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Name</p>
                <Link to={`/admin/students/${ticket.student.id}`} className="font-medium text-primary-600 hover:underline hover:text-primary-700">
                  {ticket.student.studentProfile?.fullName || 'N/A'}
                </Link>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Student ID</p>
                <p className="font-mono text-gray-900">{ticket.student.studentProfile?.studentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Email</p>
                <p className="text-gray-900 truncate">{ticket.student.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="text-gray-900">{ticket.student.phone}</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
