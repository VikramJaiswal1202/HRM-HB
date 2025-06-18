'use client';

import React, { useEffect, useState } from 'react';

export default function HRMSAttendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [localMarked, setLocalMarked] = useState([]);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [allAttendance, setAllAttendance] = useState([]);
  const [allAttendanceLoading, setAllAttendanceLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        } else {
          console.error(data.message || 'Failed to load employees.');
        }
      } catch (error) {
        console.error('Error fetching employees:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch attendance for selected date/shift
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedDate) {
        setAttendanceRecords([]);
        return;
      }
      try {
        const res = await fetch(`/api/attendance?date=${selectedDate}&shift=${selectedShift}`);
        const data = await res.json();
        if (data.success) {
          setAttendanceRecords(data.data);
        } else {
          setAttendanceRecords([]);
        }
      } catch (error) {
        setAttendanceRecords([]);
      }
    };
    fetchAttendance();
    setLocalMarked([]);
  }, [selectedDate, selectedShift, message]);

  // Get present employeeIds from backend
  const presentIds = attendanceRecords.filter(r => r.status === 'Present').map(r => r.employeeId);

  const handleMark = (employeeId) => {
    if (!selectedDate) return alert('Please select a date first.');
    if (presentIds.includes(employeeId) || localMarked.includes(employeeId)) return;
    setLocalMarked((prev) => [...prev, employeeId]);
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }
    if (localMarked.length === 0) {
      alert('Mark at least one employee present.');
      return;
    }
    try {
      setIsSubmitting(true);
      setMessage('');
      const records = employees.map((emp) => {
        const isPresent = presentIds.includes(emp.employeeId) || localMarked.includes(emp.employeeId);
        return {
          employeeId: emp.employeeId,
          name: emp.name,
          date: selectedDate,
          shift: selectedShift,
          status: isPresent ? 'Present' : 'Absent',
          checkInTime: isPresent ? new Date().toISOString() : null,
          checkOutTime: null,
        };
      });
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
      });
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Server error: Non-JSON response received.');
      }
      if (res.ok && data.success) {
        setMessage('✅ Attendance submitted successfully!');
        setLocalMarked([]);
      } else {
        throw new Error(data.message || '❌ Attendance submission failed.');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      setMessage('❌ Failed to submit attendance. ' + (error.message || 'Unexpected error.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute present and absent based on backend and local marks
  const allPresentIds = [...presentIds, ...localMarked];
  const present = employees.filter((e) => allPresentIds.includes(e.employeeId));
  const absent = employees.filter((e) => !allPresentIds.includes(e.employeeId));

  // Fetch all attendance records for the "View All Attendance" button
  const handleViewAllAttendance = async () => {
    setShowAllAttendance(true);
    setAllAttendanceLoading(true);
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (data.success) {
        setAllAttendance(data.data);
      } else {
        setAllAttendance([]);
      }
    } catch (error) {
      setAllAttendance([]);
    } finally {
      setAllAttendanceLoading(false);
    }
  };

  // Group attendance by date and shift
  const groupedAttendance = {};
  allAttendance.forEach((rec) => {
    const dateStr = new Date(rec.date).toISOString().slice(0, 10);
    const key = `${dateStr}__${rec.shift}`;
    if (!groupedAttendance[key]) groupedAttendance[key] = [];
    groupedAttendance[key].push(rec);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">HRMS Attendance System</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-lg w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Shift:</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-lg w-full text-black"
            >
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </div>
          <button
            onClick={handleViewAllAttendance}
            className="ml-0 md:ml-4 mb-2 md:mb-0 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            View All Attendance
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-green-800">Present</h2>
            <p className="text-2xl font-bold text-green-700">{present.length}</p>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-red-800">Absent</h2>
            <p className="text-2xl font-bold text-red-700">{absent.length}</p>
          </div>
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-blue-800">Total Employees</h2>
            <p className="text-2xl font-bold text-blue-700">{employees.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="w-full text-sm md:text-base border border-gray-300">
            <thead className="bg-gray-300 text-gray-800">
              <tr>
                <th className="py-3 px-4 border text-left">ID</th>
                <th className="py-3 px-4 border text-left">Name</th>
                <th className="py-3 px-4 border text-left">Status</th>
                <th className="py-3 px-4 border text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-t hover:bg-gray-100">
                  <td className="py-3 px-4 border text-black">{emp.employeeId}</td>
                  <td className="py-3 px-4 border text-black">{emp.name}</td>
                  <td className="py-3 px-4 border">
                    {allPresentIds.includes(emp.employeeId) ? (
                      <span className="text-green-600 font-semibold">Present</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Absent</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border">
                    <button
                      onClick={() => handleMark(emp.employeeId)}
                      disabled={allPresentIds.includes(emp.employeeId)}
                      className={`px-4 py-2 rounded ${
                        allPresentIds.includes(emp.employeeId)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {allPresentIds.includes(emp.employeeId) ? 'Marked' : 'Mark Attendance'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Presentees */}
        {selectedDate && (
          <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Presentees on {selectedDate} ({selectedShift})
            </h2>
            {present.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-700">
                {present.map((emp, idx) => (
                  <li key={`${emp._id}_${idx}`}>{emp.name} ({emp.employeeId})</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No one marked present yet.</p>
            )}
          </div>
        )}

        {/* All Attendance Modal/Section */}
        {showAllAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
                onClick={() => setShowAllAttendance(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">All Attendance Records</h2>
              {allAttendanceLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : Object.keys(groupedAttendance).length === 0 ? (
                <div className="text-center py-8">No attendance records found.</div>
              ) : (
                Object.entries(groupedAttendance).map(([key, records]) => {
                  const [date, shift] = key.split('__');
                  const presentList = records.filter(r => r.status === 'Present');
                  const absentList = records.filter(r => r.status === 'Absent');
                  return (
                    <div key={key} className="mb-6 border-b pb-4">
                      <div className="font-semibold mb-2">
                        Date: <span className="text-blue-700">{date}</span> | Shift: <span className="text-blue-700">{shift}</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div>
                          <div className="font-semibold text-green-700">Present:</div>
                          {presentList.length > 0 ? (
                            <ul className="list-disc pl-6">
                              {presentList.map((r, idx) => (
                                <li key={`${r.employeeId}_${r.date}_${r.shift}_${r.status}_${idx}`}>{r.name} ({r.employeeId})</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-500">None</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-red-700">Absent:</div>
                          {absentList.length > 0 ? (
                            <ul className="list-disc pl-6">
                              {absentList.map((r, idx) => (
                                <li key={`${r.employeeId}_${r.date}_${r.shift}_${r.status}_${idx}`}>{r.name} ({r.employeeId})</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-500">None</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}