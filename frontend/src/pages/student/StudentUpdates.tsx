import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Info, Pin } from 'lucide-react';
import api from '../../lib/axios';

export default function StudentUpdates() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-notices'],
    queryFn: async () => {
      const res = await api.get('/notices');
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Latest Updates & Notices</h1>
        <p className="mt-1 text-gray-500">Stay informed with the latest announcements from the administration.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            Loading updates...
          </div>
        ) : data?.notices?.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No updates</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">There are no new announcements from the administration at this time.</p>
          </div>
        ) : (
          data?.notices?.map((notice: any) => (
            <div 
              key={notice.id} 
              className={`bg-white rounded-xl border transition-shadow hover:shadow-md p-6 ${
                notice.isPinned ? 'border-amber-300 ring-1 ring-amber-100' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {notice.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  {notice.category && (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {notice.category}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {new Date(notice.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
              <div className="prose prose-sm text-gray-600 max-w-none whitespace-pre-wrap leading-relaxed">
                {notice.content}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Posted by {notice.author?.studentProfile?.fullName || 'Admin'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
