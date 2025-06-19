'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.success) setEmployees(data.employees);
      } catch (err) {
        console.error('Failed to load employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance?date=${selectedDate}&shift=${selectedShift}`);
        const data = await res.json();
        if (data.success) {
          setAttendanceRecords(data.data);
        } else {
          setAttendanceRecords([]);
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
        setAttendanceRecords([]);
      }
    };

    fetchAttendance();
  }, [selectedDate, selectedShift]);

  const presentIds = attendanceRecords.map((r) => r.employeeId);
  const unmarkedEmployees = employees.filter((e) => !presentIds.includes(e.employeeId));
  
  const filteredEmployees = unmarkedEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toString().includes(searchTerm) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(filteredEmployees.map(emp => emp.employeeId));
  };

  const deselectAll = () => {
    setSelectedEmployees([]);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedShift) {
      alert('Please select date and shift.');
      return;
    }

    const toSubmit = unmarkedEmployees
      .filter((emp) => selectedEmployees.includes(emp.employeeId))
      .map((emp) => ({
        employeeId: emp.employeeId,
        name: emp.name,
        date: selectedDate,
        shift: selectedShift,
        status: 'Present',
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
      }));

    if (toSubmit.length === 0) {
      alert('No employees selected.');
      return;
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toSubmit),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Attendance submitted!');
        setAttendanceRecords((prev) => [...prev, ...toSubmit]);
        setSelectedEmployees([]);
      } else {
        alert(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit attendance');
    }
  };

  const getShiftIcon = (shift) => {
    switch (shift) {
      case 'Morning': return '🌅';
      case 'Evening': return '🌆';
      case 'Night': return '🌙';
      default: return '⏰';
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'HR': 'bg-purple-100 text-purple-800',
      'IT': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Operations': 'bg-orange-100 text-orange-800',
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
          </div>
          <p className="text-slate-600 text-lg">Mark employee attendance with ease</p>
        </div>

        {/* Controls Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700"
              />
            </div>

            {/* Shift Selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4" />
                Select Shift
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700"
              >
                <option value="Morning">🌅 Morning Shift</option>
                <option value="Evening">🌆 Evening Shift</option>
                <option value="Night">🌙 Night Shift</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Search className="w-4 h-4" />
                Search Employees
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Loading employees...</p>
          </div>
        ) : unmarkedEmployees.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">All Set!</h3>
            <p className="text-slate-600">All employees are marked present for {getShiftIcon(selectedShift)} {selectedShift} shift</p>
          </div>
        ) : (
          <>
            {/* Stats and Actions Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{filteredEmployees.length}</div>
                    <div className="text-sm text-slate-600">Unmarked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedEmployees.length}</div>
                    <div className="text-sm text-slate-600">Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceRecords.length}</div>
                    <div className="text-sm text-slate-600">Present</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className={`relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                    selectedEmployees.includes(emp.employeeId)
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-white ring-2 ring-green-200'
                      : 'border-white/50 hover:border-blue-200'
                  }`}
                  onClick={() => toggleSelect(emp.employeeId)}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full transition-all duration-200 ${
                    selectedEmployees.includes(emp.employeeId)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  } flex items-center justify-center`}>
                    {selectedEmployees.includes(emp.employeeId) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-slate-400"></div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Employee Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                      {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>

                    {/* Employee Info */}
                    <div className="text-center space-y-2">
                      <h3 className="font-bold text-slate-800 text-lg">{emp.name}</h3>
                      <p className="text-slate-600 font-medium">ID: {emp.employeeId}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDepartmentColor(emp.department)}`}>
                        {emp.department}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(emp.employeeId);
                        }}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          selectedEmployees.includes(emp.employeeId)
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {selectedEmployees.includes(emp.employeeId) ? 'Remove' : 'Mark Present'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={selectedEmployees.length === 0}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  selectedEmployees.length > 0
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  Submit Attendance ({selectedEmployees.length} selected)
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}