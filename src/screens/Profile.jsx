import React, { useEffect, useState } from 'react';
import { Upload, User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Key, Bell, Shield, Trash2, ArrowBigLeft, ArrowLeft, Moon } from 'lucide-react';
import useStore from '../../store';
import icon from "../assets/cloud-vault.png"
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../firebase";
import {
    GoogleAuthProvider,
    reauthenticateWithPopup,
    deleteUser
} from "firebase/auth";
import axios from 'axios';


export default function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const { setUserEmail, userRegisteredTime, toggleDarkMode, isFirebaseGoogleAuthUser, isDarkMode, totalUploadedFile, totalUploadedFileSize, totalFileSizeUploadLimit, setUserImage, userEmail, userName, userImage, setUserName } = useStore();
    const [profileData, setProfileData] = useState({
        name: userName,
        email: userEmail,
        // phone: null,
        // location: 'San Francisco, CA',
        joinDate: userRegisteredTime,
        // bio: 'Cloud storage enthusiast and digital organization expert. Love keeping everything organized and accessible.',
        avatar: userImage,
        storageUsed: totalUploadedFileSize ? (totalUploadedFileSize / (1024 * 1024)) : 0,
        storageLimit: totalFileSizeUploadLimit ? (totalFileSizeUploadLimit / (1024 * 1024)) : 0,
        filesCount: totalUploadedFile,
        foldersCount: 18
    });

    const [editData, setEditData] = useState({ ...profileData });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        fileSharing: true,
        storageAlerts: true
    });


    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...profileData });
    };

    const handleAccountDelete = async () => {
        try {
            if (!window.confirm("Are you sure !! you want to delete the account?")) {
                return;
            }

            const user = auth.currentUser;
            if (!user) return alert("Not logged in");

            const provider = new GoogleAuthProvider();

            // Re-authenticate
            await reauthenticateWithPopup(user, provider);

            // Delete backend data FIRST
            const res = await axios.delete(
                `${import.meta.env.VITE_HOST_SERVER_ADDRESS}/api/user`,
                {
                    params: { user_email: userEmail }
                }
            );

            console.log("Backend delete:", res.data);

            // Delete Firebase account
            await deleteUser(user);

            alert("Account deleted successfully");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message);
        }
    };


    useEffect(() => {
        if (!userEmail) {
            navigate("/login");
        }
    }, [userEmail]);

    const handleSave = async () => {
        try {
            const response = await fetch('YOUR_API_ENDPOINT_HERE/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData)
            });

            if (response.ok) {
                setProfileData(editData);
                setIsEditing(false);
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update profile. Please check your connection.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({ ...profileData });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData({ ...editData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNotificationChange = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    const storagePercentage = (profileData.storageUsed / profileData.storageLimit) * 100;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
            {/* Header */}
            <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">

                            <Link to="/">
                                <ArrowLeft className={isDarkMode ? 'text-gray-300' : 'text-gray-900'} />
                            </Link>
                            <img src={icon} className="h-10 w-10" alt="CloudStore" />

                            <div>
                                <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    CloudVault
                                </h1>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>User Profile</p>
                            </div>

                        </div>

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
                            {/* Avatar Section */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    <img
                                        src={isEditing ? editData.avatar : profileData.avatar}
                                        alt="Profile"
                                        className={`w-32 h-32 rounded-full object-cover border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                                    />
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                            <Camera className="w-5 h-5 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-4`}>
                                    {profileData.name}
                                </h2>
                                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{profileData.email}</p>
                            </div>

                            {/* Storage Info */}
                            <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'} rounded-lg p-4 mb-6`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Storage Used</span>
                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                        {profileData.storageUsed.toFixed(2)} MB / {profileData.storageLimit.toFixed(2)} MB
                                    </span>
                                </div>
                                <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${storagePercentage}%` }}
                                    />
                                </div>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                                    {(profileData.storageLimit - profileData.storageUsed).toFixed(2)} MB remaining
                                </p>
                            </div>


                        </div>
                    </div>

                    {/* Right Content - Tabs */}
                    <div className="lg:col-span-2">
                        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
                            {/* Tabs */}
                            <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'profile'
                                            ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-blue-900/30' : 'text-blue-600 border-blue-600 bg-blue-50/50'} border-b-2`
                                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                                            }`}
                                    >
                                        <User className="w-5 h-5 inline mr-2" />
                                        Profile Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'settings'
                                            ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-blue-900/30' : 'text-blue-600 border-blue-600 bg-blue-50/50'} border-b-2`
                                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                                            }`}
                                    >
                                        <Bell className="w-5 h-5 inline mr-2" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${activeTab === 'security'
                                            ? `${isDarkMode ? 'text-blue-400 border-blue-400 bg-blue-900/30' : 'text-blue-600 border-blue-600 bg-blue-50/50'} border-b-2`
                                            : `${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                                            }`}
                                    >
                                        <Shield className="w-5 h-5 inline mr-2" />
                                        Security
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        {!isFirebaseGoogleAuthUser && <div className="flex items-center justify-between mb-6">
                                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                                            {!isEditing ? (
                                                <button
                                                    onClick={handleEdit}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    <span>Edit Profile</span>
                                                </button>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleCancel}
                                                        className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition-colors flex items-center space-x-2`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>Cancel</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSave}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        <span>Save</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>}

                                        <div className="space-y-4">
                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                    <User className="w-4 h-4 inline mr-2" />
                                                    Full Name
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                        className={`w-full px-4 py-2.5 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                                                    />
                                                ) : (
                                                    <p className={`${isDarkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'} px-4 py-2.5 rounded-lg`}>{profileData.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                    <Mail className="w-4 h-4 inline mr-2" />
                                                    Email Address
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        readOnly
                                                        value={editData.email}
                                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                                        className={`w-full px-4 py-2.5 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                                                    />
                                                ) : (
                                                    <p className={`${isDarkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'} px-4 py-2.5 rounded-lg`}>{profileData.email}</p>
                                                )}
                                            </div>


                                            <div>
                                                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                    <Calendar className="w-4 h-4 inline mr-2" />
                                                    Member Since
                                                </label>
                                                <p className={`${isDarkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-gray-50'} px-4 py-2.5 rounded-lg`}>{profileData.joinDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="space-y-6">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Notification Preferences</h3>

                                        <div className="space-y-4">

                                            <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                                <div className="flex items-center space-x-3">

                                                    <Moon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />

                                                    <div>
                                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Change to dark theme style</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isDarkMode}
                                                        onChange={toggleDarkMode}
                                                        className="sr-only peer"
                                                    />

                                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>


                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Security Settings</h3>

                                        <div className="space-y-4">
                                            <div className={`p-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <Key className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`} />
                                                        <div>
                                                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Change Password</p>
                                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your password to keep your account secure</p>
                                                        </div>
                                                    </div>
                                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap">
                                                        Change
                                                    </button>
                                                </div>
                                            </div>



                                            <div className={`p-6 ${isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'} rounded-lg border`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        <Trash2 className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'} mt-1`} />
                                                        <div>
                                                            <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-900'} mb-1`}>Delete Account</p>
                                                            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Permanently delete your account and all your data</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={handleAccountDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}