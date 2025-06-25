"use client";
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, CheckCircle, AlertCircle, Loader2, Search } from 'lucide-react';

const ManagerAssignmentDashboard = () => {
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState({ users: null, managers: null });

  // Fetch unassigned users and managers on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchingData(true);
    setMessage({ text: '', type: '' });
    
    try {
      console.log('Fetching data from APIs...');
      
      // Fetch users
      const usersResponse = await fetch('/api/hr/unassigned-users');
      console.log('Users response status:', usersResponse.status);
      
      let userData = null;
      if (usersResponse.ok) {
        userData = await usersResponse.json();
        console.log('Users data:', userData);
        setUnassignedUsers(userData.users || []);
        setDebugInfo(prev => ({ ...prev, users: userData }));
      } else {
        const userError = await usersResponse.text();
        console.error('Users API error:', userError);
        setDebugInfo(prev => ({ ...prev, users: { error: `${usersResponse.status}: ${userError}` } }));
      }

      // Fetch managers
      const managersResponse = await fetch('/api/hr/assign-manager');
      console.log('Managers response status:', managersResponse.status);
      
      let managerData = null;
      if (managersResponse.ok) {
        managerData = await managersResponse.json();
        console.log('Managers data:', managerData);
        setManagers(managerData.managers || []);
        setDebugInfo(prev => ({ ...prev, managers: managerData }));
      } else {
        const managerError = await managersResponse.text();
        console.error('Managers API error:', managerError);
        setDebugInfo(prev => ({ ...prev, managers: { error: `${managersResponse.status}: ${managerError}` } }));
      }

      // Set appropriate messages
      if (!usersResponse.ok && !managersResponse.ok) {
        setMessage({ text: 'Failed to fetch data from both APIs. Check console for details.', type: 'error' });
      } else if (!usersResponse.ok) {
        setMessage({ text: 'Failed to fetch users. Check console for details.', type: 'error' });
      } else if (!managersResponse.ok) {
        setMessage({ text: 'Failed to fetch managers. Check console for details.', type: 'error' });
      } else if ((userData?.users?.length || 0) === 0 && (managerData?.managers?.length || 0) === 0) {
        setMessage({ text: 'No unassigned users or managers found.', type: 'info' });
      }
      
    } catch (error) {
      console.error('Network error:', error);
      setMessage({ text: `Network error: ${error.message}`, type: 'error' });
      setDebugInfo({ users: { error: error.message }, managers: { error: error.message } });
    } finally {
      setFetchingData(false);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const handleAssignManager = async () => {
    if (selectedUsers.length === 0) {
      setMessage({ text: 'Please select at least one user', type: 'error' });
      return;
    }

    if (!selectedManager) {
      setMessage({ text: 'Please select a manager', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hr/assign-manager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId: selectedManager,
          userIds: selectedUsers,
          action: 'assign'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Successfully assigned ${data.modifiedCount} users to manager`, type: 'success' });
        setSelectedUsers([]);
        setSelectedManager('');
        fetchData(); // Refresh the data
      } else {
        setMessage({ text: data.message || 'Failed to assign manager', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignUsers = async () => {
    if (selectedUsers.length === 0) {
      setMessage({ text: 'Please select at least one user', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hr/assign-manager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: 'unassign'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Successfully unassigned ${data.modifiedCount} users`, type: 'success' });
        setSelectedUsers([]);
        fetchData(); // Refresh the data
      } else {
        setMessage({ text: data.message || 'Failed to unassign users', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return unassignedUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredUsers = getFilteredUsers();

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Manager Assignment Dashboard</h1>
          </div>
          <p className="text-gray-600">Assign managers to employees and interns who don't currently have one assigned.</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : message.type === 'info'
              ? 'bg-blue-50 border border-blue-200 text-blue-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Debug Information */}
        {(debugInfo.users?.error || debugInfo.managers?.error) && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Information</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              {debugInfo.users?.error && (
                <div>
                  <strong>Users API Error:</strong> {debugInfo.users.error}
                </div>
              )}
              {debugInfo.managers?.error && (
                <div>
                  <strong>Managers API Error:</strong> {debugInfo.managers.error}
                </div>
              )}
              <div className="mt-2 text-xs">
                <p><strong>Expected endpoints:</strong></p>
                <p>• GET /api/unassigned-users</p>
                <p>• GET /api/assign-manager</p>
                <p>• PATCH /api/assign-manager</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Unassigned Users ({filteredUsers.length})
                  </h2>
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    {searchTerm ? (
                      <p>No users found matching "{searchTerm}"</p>
                    ) : unassignedUsers.length === 0 ? (
                      <div>
                        <p className="mb-2">No unassigned users found</p>
                        <p className="text-xs text-gray-400">
                          This could mean:
                          <br />• All users have managers assigned
                          <br />• No users exist in the system
                          <br />• API authentication failed
                        </p>
                      </div>
                    ) : (
                      <p>No unassigned users found</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUsers.includes(user._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleUserSelection(user._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelection(user._id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Panel */}
          <div className="space-y-6">
            {/* Manager Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Manager</h3>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {managers.length === 0 ? 'No managers available' : 'Choose a manager...'}
                </option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} (@{manager.username})
                  </option>
                ))}
              </select>
              
              {managers.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No managers found. Make sure users with role "manager" exist in your system.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAssignManager}
                  disabled={loading || selectedUsers.length === 0 || !selectedManager}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Assign Manager
                </button>

                <button
                  onClick={handleUnassignUsers}
                  disabled={loading || selectedUsers.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserMinus className="w-4 h-4" />
                  )}
                  Unassign Selected
                </button>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                <p className="text-sm text-blue-700">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
                {selectedManager && (
                  <p className="text-sm text-blue-700 mt-1">
                    Manager: {managers.find(m => m._id === selectedManager)?.name}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAssignmentDashboard;  