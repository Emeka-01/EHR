import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ViewState } from '../types';
import {
  Calendar,
  FileText,
  Upload,
  User,
  Clock,
  ArrowRight } from
'lucide-react';
interface DashboardPageProps {
  onNavigate: (view: ViewState) => void;
}
export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { currentUser, getAppointments, getUploads } = useAuth();
  const appointments = getAppointments();
  const uploads = getUploads();
  // Get upcoming appointments (future dates)
  const upcomingAppointments = appointments.
  filter((a) => new Date(a.date + 'T' + a.time) > new Date()).
  sort(
    (a, b) =>
    new Date(a.date + 'T' + a.time).getTime() -
    new Date(b.date + 'T' + b.time).getTime()
  ).
  slice(0, 3);
  const stats = [
  {
    label: 'Upcoming Appointments',
    value: upcomingAppointments.length,
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    label: 'Medical Files',
    value: uploads.length,
    icon: FileText,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    label: 'Profile Status',
    value: '85%',
    icon: User,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  }];

  const actions = [
  {
    label: 'Schedule Appointment',
    icon: Calendar,
    view: 'appointments',
    desc: 'Book a visit with a doctor'
  },
  {
    label: 'Upload Results',
    icon: Upload,
    view: 'medical-results',
    desc: 'Securely upload medical files'
  },
  {
    label: 'Update Profile',
    icon: User,
    view: 'profile',
    desc: 'Manage your personal info'
  },
  {
    label: 'View History',
    icon: FileText,
    view: 'upload-history',
    desc: 'Access past medical records'
  }];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-lg">
            Here's what's happening with your health account today.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50 to-transparent opacity-50" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) =>
        <Card key={idx} className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, idx) =>
          <Card
            key={idx}
            onClick={() => onNavigate(action.view as ViewState)}
            className="p-6 hover:border-blue-300 hover:shadow-md transition-all group">

              <div className="mb-4 p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
                <action.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Appointments
            </h2>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">

              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {upcomingAppointments.length > 0 ?
          <div className="space-y-4">
              {upcomingAppointments.map((apt) =>
            <div
              key={apt.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">

                  <div className="bg-white p-2 rounded-lg border border-gray-200 text-center min-w-[60px]">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {new Date(apt.date).toLocaleString('default', {
                    month: 'short'
                  })}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(apt.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {apt.doctorName}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {apt.time}
                    </div>
                  </div>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                </div>
            )}
            </div> :

          <div className="text-center py-8 text-gray-500">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No upcoming appointments</p>
              <button
              onClick={() => onNavigate('appointments')}
              className="text-blue-600 text-sm font-medium mt-2 hover:underline">

                Schedule one now
              </button>
            </div>
          }
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Uploads
            </h2>
            <button
              onClick={() => onNavigate('upload-history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">

              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {uploads.length > 0 ?
          <div className="space-y-3">
              {uploads.slice(0, 3).map((file) =>
            <div
              key={file.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.uploadDate} • {file.fileSize}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {file.fileType}
                  </span>
                </div>
            )}
            </div> :

          <div className="text-center py-8 text-gray-500">
              <Upload className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No files uploaded yet</p>
            </div>
          }
        </Card>
      </div>
    </div>);

}