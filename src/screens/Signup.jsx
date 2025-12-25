import React from "react";
import { FcGoogle } from "react-icons/fc";
import icon from "../assets/icon.png"
import { Link } from "react-router-dom";
import useStore from "../../store";

const Signup = () => {
    const { isDarkMode } = useStore();

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-[#f3f6fb]'}`}>
            <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
                {/* Title */}
                <div className="mb-6">
                    <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create account</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Sign up to get started
                    </p>
                </div>

                {/* Full Name */}
                <div className="mb-4">
                    <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Full name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className={`w-full px-3 py-2 border ${isDarkMode ?
                            'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                            'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                            } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full px-3 py-2 border ${isDarkMode ?
                            'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                            'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                            } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Password</label>
                    <input
                        type="password"
                        placeholder="Create a password"
                        className={`w-full px-3 py-2 border ${isDarkMode ?
                            'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                            'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                            } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Confirm password</label>
                    <input
                        type="password"
                        placeholder="Confirm your password"
                        className={`w-full px-3 py-2 border ${isDarkMode ?
                            'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                            'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                            } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                </div>

                {/* Sign up button */}
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4">
                    Create account
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    <span className={`mx-3 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
                    <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                </div>

                {/* Google signup */}
                <button
                    className={`w-full flex items-center justify-center gap-3 border ${isDarkMode ?
                        'border-gray-600 text-gray-300 hover:bg-gray-700' :
                        'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } py-2 rounded-md transition`}
                >
                    <FcGoogle size={20} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sign up with Google
                    </span>
                </button>

                {/* Login link */}
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-6`}>
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>

                {/* Footer */}
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-4`}>
                    © 2025 CloudVault. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Signup;