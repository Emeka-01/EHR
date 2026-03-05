import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Camera, Save } from 'lucide-react';
export function UpdateProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        gender: currentUser.gender || '',
        dob: currentUser.dob || '',
        profilePicture: currentUser.profilePicture || ''
      });
    }
  }, [currentUser]);
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPEG and PNG files are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    if (!window.confirm('Are you sure you want to update your profile?')) return;
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsDirty(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b border-gray-100">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
                {formData.profilePicture ?
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover" /> :


                <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-300">
                    <User className="h-12 w-12" />
                  </div>
                }
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">

                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange} />

              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-medium text-gray-900">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                JPG or PNG no larger than 5MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required />


            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required />


            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000" />


            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none"
                required>

                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]} />

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!isDirty}
              className="min-w-[120px]">

              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>);

}