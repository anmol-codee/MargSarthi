import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, Eye, FileText, Download } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import toast from 'react-hot-toast';

export default function AdminStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading } = useQuery({
    queryKey: ['admin-student-detail', id],
    queryFn: async () => {
      const res = await api.get(`/admin/students/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  const handleViewDocument = async (docId: string) => {
    try {
      const { data } = await api.get(`/admin/students/${id}/documents/${docId}/url`);
      if (data.success && data.data.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      toast.error('Could not load document preview');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading student details...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Student not found</div>;

  const profile = student.studentProfile;
  const edu = profile?.education;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile?.fullName || 'Student Details'}</h1>
            <p className="mt-1 text-sm text-gray-500 font-mono">{profile?.studentId || 'No Student ID'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {student.isActive ? (
            <Badge variant="success">Account Active</Badge>
          ) : (
            <Badge variant="danger">Account Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Contact Info</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-900">Email Address</p>
                  <a href={`mailto:${student.email}`} className="text-primary-600 truncate block hover:underline">{student.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Phone Number</p>
                  <a href={`tel:${student.phone}`} className="text-gray-600 hover:underline">{student.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">{profile?.address || 'Not provided'}</p>
                  {profile?.city && (
                    <p className="text-gray-600">{profile.city}, {profile.state} {profile.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium text-gray-900">{profile?.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DOB</span>
                <span className="font-medium text-gray-900">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900">{profile?.casteCategory || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Academic Info</h2>
            {!edu ? (
              <p className="text-sm text-gray-500">No education details provided.</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Course</p>
                  <p className="font-medium text-gray-900">{edu.course || 'N/A'} ({edu.stream || 'N/A'})</p>
                  <p className="text-gray-600">{edu.collegeName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Semester / Session</p>
                  <p className="font-medium text-gray-900">Sem {edu.semester || 'N/A'} / {edu.session || 'N/A'}</p>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-gray-600">Migration Cert.</span>
                  {edu.hasMigration ? <Badge variant="success">Available</Badge> : <Badge variant="danger">Missing</Badge>}
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-gray-600">CLC / TC</span>
                  {edu.hasCLC ? <Badge variant="success">Available</Badge> : <Badge variant="danger">Missing</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Documents & Tickets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Documents Section */}
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Uploaded Documents</h2>
              <span className="text-sm text-gray-500">{profile?.documents?.length || 0} files</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile?.documents?.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  No documents uploaded yet.
                </div>
              ) : (
                profile?.documents?.map((doc: any) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between bg-white hover:border-primary-300 transition-colors shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 capitalize leading-tight mb-1">
                          {doc.documentType.replace(/_/g, ' ')}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${doc.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-warning-100 text-warning-700'}`}>
                          {doc.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => handleViewDocument(doc.id)} title="View Document">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Tickets Section */}
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Tickets</h2>
              <Link to={`/admin/tickets?search=${profile?.studentId || student.email}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {student.ticketsRaised?.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No tickets raised by this student.
                </div>
              ) : (
                student.ticketsRaised?.map((ticket: any) => (
                  <Link key={ticket.id} to={`/admin/tickets/${ticket.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-medium text-gray-500">{ticket.ticketNumber}</span>
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority.label} />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">{ticket.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{ticket.category.name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block whitespace-nowrap">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
