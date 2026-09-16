import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, GraduationCap, FileCheck, Save, Upload, Trash2, Eye } from 'lucide-react';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'documents', label: 'Documents', icon: FileCheck },
];

export default function StudentProfile() {
  const [activeTab, setActiveTab] = useState('basic');
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  // Basic Info Form
  const { register: registerBasic, handleSubmit: handleBasicSubmit, formState: { errors: basicErrors } } = useForm();
  
  // Education Form
  const { register: registerEdu, handleSubmit: handleEduSubmit, watch: watchEdu, formState: { errors: eduErrors } } = useForm();

  // Fetch Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const { data } = await api.get('/students/profile');
      return data.data;
    }
  });

  // Fetch Education
  const { data: education } = useQuery({
    queryKey: ['student-education'],
    queryFn: async () => {
      const { data } = await api.get('/students/education');
      return data.data;
    }
  });

  // Fetch Documents
  const { data: documents } = useQuery({
    queryKey: ['student-documents'],
    queryFn: async () => {
      const { data } = await api.get('/students/documents');
      return data.data;
    }
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.put('/students/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      updateUser({ fullName: res.data.data.fullName, completionPercent: res.data.data.completionPercent });
    },
    onError: () => toast.error('Failed to update profile')
  });

  const updateEducationMutation = useMutation({
    mutationFn: (data: any) => api.put('/students/education', data),
    onSuccess: () => {
      toast.success('Education details updated');
      queryClient.invalidateQueries({ queryKey: ['student-education'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: () => toast.error('Failed to update education details')
  });

  const uploadDocMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/students/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: () => toast.error('Failed to upload document')
  });

  const deleteDocMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/documents/${id}`),
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['student-documents'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: () => toast.error('Failed to delete document')
  });

  const onBasicSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const onEduSubmit = (data: any) => {
    // Convert strings to numbers where needed
    if (data.schoolPassingYear) data.schoolPassingYear = parseInt(data.schoolPassingYear);
    if (data.graduationYear) data.graduationYear = parseInt(data.graduationYear);
    updateEducationMutation.mutate(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', type);
      uploadDocMutation.mutate(formData);
    }
  };

  const handleViewDocument = async (docId: string) => {
    try {
      const { data } = await api.get(`/students/documents/${docId}/url`);
      if (data.success && data.data.url) {
        window.open(data.data.url, '_blank');
      }
    } catch (error) {
      toast.error('Could not load document preview');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-500">Manage your personal information and documents.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Profile Completion</span>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${profile?.completionPercent === 100 ? 'bg-emerald-500' : 'bg-primary-500'}`} 
              style={{ width: `${profile?.completionPercent || 0}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-900">{profile?.completionPercent || 0}%</span>
        </div>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                    ${isActive 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <form onSubmit={handleBasicSubmit(onBasicSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  defaultValue={profile?.fullName || ''}
                  {...registerBasic('fullName', { required: 'Full name is required' })}
                  error={basicErrors.fullName?.message as string}
                />
                
                <Input
                  label="Email (Cannot be changed)"
                  defaultValue={user?.email || ''}
                  disabled
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  defaultValue={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
                  {...registerBasic('dateOfBirth')}
                />

                <Select
                  label="Gender"
                  defaultValue={profile?.gender || ''}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                  {...registerBasic('gender')}
                />

                <Select
                  label="Caste Category"
                  defaultValue={profile?.casteCategory || ''}
                  options={[
                    { value: 'GENERAL', label: 'General' },
                    { value: 'OBC', label: 'OBC' },
                    { value: 'SC', label: 'SC' },
                    { value: 'ST', label: 'ST' },
                    { value: 'EWS', label: 'EWS' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  {...registerBasic('casteCategory')}
                />

                <Input
                  label="Caste Sub-Category"
                  defaultValue={profile?.casteSubCategory || ''}
                  {...registerBasic('casteSubCategory')}
                />
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-6">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                
                <Textarea
                  label="Full Address"
                  defaultValue={profile?.address || ''}
                  {...registerBasic('address')}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    defaultValue={profile?.city || ''}
                    {...registerBasic('city')}
                  />
                  <Input
                    label="State"
                    defaultValue={profile?.state || ''}
                    {...registerBasic('state')}
                  />
                  <Input
                    label="Pincode"
                    defaultValue={profile?.pincode || ''}
                    {...registerBasic('pincode')}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={updateProfileMutation.isPending} leftIcon={<Save className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <form onSubmit={handleEduSubmit(onEduSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="School Name (10th/12th)"
                  defaultValue={education?.schoolName || ''}
                  {...registerEdu('schoolName')}
                />
                
                <Input
                  label="School Passing Year"
                  type="number"
                  defaultValue={education?.schoolPassingYear || ''}
                  {...registerEdu('schoolPassingYear')}
                />

                <Input
                  label="College/University Name"
                  defaultValue={education?.collegeName || ''}
                  {...registerEdu('collegeName')}
                />

                <Input
                  label="Course/Degree Name"
                  defaultValue={education?.course || ''}
                  {...registerEdu('course')}
                />

                <Input
                  label="Stream/Branch"
                  defaultValue={education?.stream || ''}
                  {...registerEdu('stream')}
                />

                <Input
                  label="Current Semester"
                  defaultValue={education?.semester || ''}
                  {...registerEdu('semester')}
                />

                <Input
                  label="Academic Session (e.g., 2022-2026)"
                  defaultValue={education?.session || ''}
                  {...registerEdu('session')}
                />

                <Input
                  label="Expected Graduation Year"
                  type="number"
                  defaultValue={education?.graduationYear || ''}
                  {...registerEdu('graduationYear')}
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Certificates Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        defaultChecked={education?.hasMigration}
                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                        {...registerEdu('hasMigration')}
                      />
                      <span className="text-sm font-medium text-gray-900">I have my Migration Certificate</span>
                    </label>
                    <Input
                      label="Received From (Institution)"
                      defaultValue={education?.migrationFrom || ''}
                      {...registerEdu('migrationFrom')}
                    />
                  </div>

                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        defaultChecked={education?.hasCLC}
                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                        {...registerEdu('hasCLC')}
                      />
                      <span className="text-sm font-medium text-gray-900">I have my CLC/TC</span>
                    </label>
                    <Input
                      label="Received From (Institution)"
                      defaultValue={education?.clcFrom || ''}
                      {...registerEdu('clcFrom')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={updateEducationMutation.isPending} leftIcon={<Save className="w-4 h-4" />}>
                  Save Education Details
                </Button>
              </div>
            </form>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
                <strong>Important:</strong> Upload clear, legible copies of your documents. Max file size is 5MB. 
                Supported formats: JPG, PNG, PDF.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['ID_PROOF', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE', 'MIGRATION_CERTIFICATE', 'CLC', 'MARKSHEET'].map((docType) => {
                  const existingDoc = documents?.find((d: any) => d.documentType === docType);
                  
                  return (
                    <div key={docType} className="border border-gray-200 rounded-xl p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">{docType.replace(/_/g, ' ')}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {existingDoc 
                              ? `Uploaded on ${new Date(existingDoc.createdAt).toLocaleDateString()}` 
                              : 'Not uploaded yet'}
                          </p>
                        </div>
                        {existingDoc && (
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                            existingDoc.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-warning-100 text-warning-800'
                          }`}>
                            {existingDoc.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between gap-2">
                        {existingDoc ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              leftIcon={<Eye className="w-4 h-4" />}
                              onClick={() => handleViewDocument(existingDoc.id)}
                            >
                              View
                            </Button>
                            {!existingDoc.isVerified && (
                              <Button 
                                variant="danger" 
                                size="sm"
                                isLoading={deleteDocMutation.isPending}
                                onClick={() => deleteDocMutation.mutate(existingDoc.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="relative w-full">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => handleFileUpload(e, docType)}
                              disabled={uploadDocMutation.isPending}
                            />
                            <Button variant="secondary" size="sm" className="w-full pointer-events-none" leftIcon={<Upload className="w-4 h-4" />}>
                              Choose File
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
