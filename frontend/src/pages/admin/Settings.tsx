import React from 'react';
import { Save, Settings as SettingsIcon, Bell, Lock, Key } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage application preferences and admin account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg font-medium flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            General Settings
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Lock className="w-5 h-5" />
            Security
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Key className="w-5 h-5" />
            API Keys
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">System Preferences</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Platform Name"
                  defaultValue="MargSarthi"
                />
                <Input
                  label="Support Email Address"
                  defaultValue="support@margsarthi.edu.in"
                />
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500 mt-1">Temporarily disable student access to the portal.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
              </div>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Admin Profile</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  defaultValue="Administrator"
                />
                <Input
                  label="Email"
                  defaultValue="admin@margsarthi.edu.in"
                  disabled
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="secondary">Update Profile</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
