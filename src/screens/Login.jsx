import React from "react";
import { FcGoogle } from "react-icons/fc";
import icon from "../assets/cloud-vault.png"
import { Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useStore from "../../store";

const Login = () => {
    const { setUserEmail, isDarkMode, setUserImage, userEmail, setUserName } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (userEmail) {
            navigate("/");
        }
    }, [userEmail]);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log("User:", user);
            
            return user;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-[#f3f6fb]'}`}>
            <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8`}>
                {/* Logo / Title */}
                <div className="justify-self-center">
                    <img src={icon} style={{ height: "40px", width: "40px" }} alt="CloudVault Logo" />
                </div>
                <div className="mb-6">
                    <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sign in</h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Use your account to continue
                    </p>
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
                        placeholder="Enter your password"
                        className={`w-full px-3 py-2 border ${isDarkMode ?
                            'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                            'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                            } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                </div>

                {/* Forgot password */}
                <div className="flex justify-between items-center mb-6">
                    <span></span>
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                    </a>
                </div>

                {/* Sign in button */}
                <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4">
                    Sign in
                </button>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    <span className={`mx-3 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
                    <div className={`flex-grow border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                </div>

                {/* Google sign in */}
                <button
                    onClick={signInWithGoogle}
                    className={`w-full flex items-center justify-center gap-3 border ${isDarkMode ?
                        'border-gray-600 text-gray-300 hover:bg-gray-700' :
                        'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } py-2 rounded-md transition`}
                >
                    <FcGoogle size={20} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sign in with Google
                    </span>
                </button>

                {/* Signup link */}
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-6`}>
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>

                {/* Footer */}
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-6`}>
                    © 2025 CloudVault. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;