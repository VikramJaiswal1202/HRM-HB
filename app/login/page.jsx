"use client"
import React, { useState } from 'react';
import { User, Lock, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

const AuthUI = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const roles = [
    { value: 'superadmin', label: 'Super Admin', color: 'text-red-600' },
    { value: 'hr', label: 'HR', color: 'text-purple-600' },
    { value: 'manager', label: 'Manager', color: 'text-blue-600' },
    { value: 'user', label: 'User', color: 'text-green-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setMessage({ text: 'Username is required', type: 'error' });
      return false;
    }
    if (!formData.password.trim()) {
      setMessage({ text: 'Password is required', type: 'error' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        
        if (isLogin && data.token) {
          // Store token and user info
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // You can redirect or update app state here
          setTimeout(() => {
            // Redirect to dashboard or home page
            window.location.href = '/homepage'; // Adjust the path as needed
          }, 1000);
        } else if (!isLogin) {
          // Switch to login after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ username: '', password: '', role: 'user' });
            setMessage({ text: 'Registration successful! Please login.', type: 'success' });
          }, 1500);
        }
      } else {
        setMessage({ text: data.message || 'An error occurred', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', role: 'user' });
    setMessage({ text: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to your account' : 'Register for a new account'}
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={loading}
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              disabled={loading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Role Descriptions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Role Descriptions:</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-red-600 font-medium">Super Admin:</span>
              <span>Full system access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600 font-medium">HR:</span>
              <span>Human resources management</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 font-medium">Manager:</span>
              <span>Team and project oversight</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600 font-medium">User:</span>
              <span>Standard user access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;