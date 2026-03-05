import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
const DOCTORS = [
'Dr. Emily Chen',
'Dr. James Wilson',
'Dr. Maria Santos',
'Dr. Robert Kim'];

const TIME_SLOTS = [
'09:00',
'09:30',
'10:00',
'10:30',
'11:00',
'11:30',
'13:00',
'13:30',
'14:00',
'14:30',
'15:00',
'15:30',
'16:00'];

export function AppointmentPage() {
  const { bookAppointment, getAppointments } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const appointments = getAppointments();
  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return {
      days,
      firstDay
    };
  };
  const { days, firstDay } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date < today || date.getDay() === 0 || date.getDay() === 6; // Disable past dates & weekends
  };
  const isSlotTaken = (time: string) => {
    if (!selectedDate) return false;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments.some(
      (a) =>
      a.date === dateStr &&
      a.time === time &&
      a.doctorName === selectedDoctor
    );
  };
  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsBooking(true);
    try {
      const success = await bookAppointment({
        doctorName: selectedDoctor,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        userId: '' // Handled by context
      });
      if (success) {
        setShowSuccess(true);
        setSelectedTime(null);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBooking(false);
    }
  };
  const changeMonth = (offset: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + offset,
      1
    );
    setCurrentMonth(newDate);
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Appointment
          </h1>
          <p className="text-gray-500">
            Book a consultation with our specialists
          </p>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border">

            {DOCTORS.map((doc) =>
            <option key={doc} value={doc}>
                {doc}
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Column */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded-full">

                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="font-medium text-gray-900 w-32 text-center">
                {currentMonth.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-gray-100 rounded-full">

                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) =>
            <div key={d} className="py-2">
                {d}
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({
              length: firstDay
            }).map((_, i) =>
            <div key={`empty-${i}`} className="aspect-square" />
            )}

            {Array.from({
              length: days
            }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === currentMonth.getMonth();
              const isToday =
              day === today.getDate() &&
              currentMonth.getMonth() === today.getMonth();
              return (
                <button
                  key={day}
                  onClick={() => {
                    const date = new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    );
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  disabled={disabled}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105' : disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                    ${isToday && !isSelected ? 'ring-2 ring-blue-600 ring-inset' : ''}
                  `}>

                  {day}
                </button>);

            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600" /> Selected
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full ring-2 ring-blue-600" />{' '}
              Today
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-200" /> Unavailable
            </div>
          </div>
        </Card>

        {/* Time Slots Column */}
        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Available Times
            </h2>

            {!selectedDate ?
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                <p>Select a date to view times</p>
              </div> :

            <>
                <p className="text-sm text-gray-600 mb-4 font-medium">
                  {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {TIME_SLOTS.map((time) => {
                  const taken = isSlotTaken(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      disabled={taken}
                      className={`
                          py-2 px-3 rounded-lg text-sm font-medium border transition-all
                          ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : taken ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'}
                        `}>

                        {time}
                      </button>);

                })}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                  <Button
                  fullWidth
                  disabled={!selectedTime || !selectedDate}
                  onClick={handleBook}
                  isLoading={isBooking}>

                    Confirm Booking
                  </Button>
                </div>
              </>
            }
          </Card>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {showSuccess &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-600 mb-6">
              Your appointment with <strong>{selectedDoctor}</strong> has been
              scheduled successfully. We've sent a confirmation email to your
              inbox.
            </p>
            <Button onClick={() => setShowSuccess(false)} fullWidth>
              Done
            </Button>
          </Card>
        </div>
      }
    </div>);

}