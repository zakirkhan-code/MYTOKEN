import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Upload, X } from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null,
    phone: user?.phone || '',
    country: user?.country || '',
    joinedDate: user?.createdAt || new Date().toISOString()
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response.data?.user) {
        setProfileData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profileData.fullName) newErrors.fullName = 'Full name is required';
    if (!profileData.username) newErrors.username = 'Username is required';
    if (!profileData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setLoading(true);
      await userAPI.updateProfile(profileData);
      setUser({ ...user, ...profileData });
      toast.success('✅ Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result);
        setProfileData({ ...profileData, avatar: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your profile information</p>
      </div>

      {/* Avatar Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Picture</h2>
        <div className="flex flex-col items-center gap-6">
          {/* Avatar Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {previewImage ? (
                <img src={previewImage} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(profileData.fullName)
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 cursor-pointer shadow-lg transition">
              <Upload size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {previewImage && (
            <button
              onClick={() => {
                setPreviewImage(null);
                setProfileData({ ...profileData, avatar: null });
              }}
              className="btn btn-ghost flex items-center gap-2"
            >
              <X size={18} /> Remove Image
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => {
                setProfileData({ ...profileData, fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              placeholder="John Doe"
              className={`input ${errors.fullName ? 'input-error' : ''}`}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => {
                setProfileData({ ...profileData, username: e.target.value });
                if (errors.username) setErrors({ ...errors, username: '' });
              }}
              placeholder="johndoe"
              className={`input ${errors.username ? 'input-error' : ''}`}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => {
                setProfileData({ ...profileData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="john@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="label">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              rows={4}
              className="input resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {profileData.bio.length} / 500 characters
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="input"
            />
          </div>

          {/* Country */}
          <div>
            <label className="label">Country</label>
            <input
              type="text"
              value={profileData.country}
              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
              placeholder="United States"
              className="input"
            />
          </div>

          {/* Joined Date */}
          <div>
            <label className="label">Member Since</label>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-900">
              {new Date(profileData.joinedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-blue-600" size={24} />
            <p className="text-gray-600 text-sm">Account Status</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">Active</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="text-green-600" size={24} />
            <p className="text-gray-600 text-sm">Email Verified</p>
          </div>
          <p className="text-2xl font-bold text-green-600">✓ Yes</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <User className="text-purple-600" size={24} />
            <p className="text-gray-600 text-sm">Account Role</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 capitalize">{user?.role || 'User'}</p>
        </div>
      </div>
    </div>
  );
}