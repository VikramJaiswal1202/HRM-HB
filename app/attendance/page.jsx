'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function HRMSAttendance() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Interns", icon: "👥", route: "/intern" },
    { label: "Attendance", icon: "🗓️", route: "/attendance" },
    { label: "Reporting", icon: "⏱️", route: "/reporting" },
  ];

  // ...existing code...
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

  // ...existing code for fetching employees, attendance, etc...

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

  // ...rest of your code remains unchanged...

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

  // ...rest of your code...

  // Get present employeeIds from backend
  const presentIds = attendanceRecords.filter(r => r.status === 'Present').map(r => r.employeeId);

  const handleMark = (employeeId) => {
    if (!selectedDate) return alert('Please select a date first.');
    if (presentIds.includes(employeeId) || localMarked.includes(employeeId)) return;
    setLocalMarked((prev) => [...prev, employeeId]);
  };

  const handleUndo = (employeeId) => {
    setLocalMarked((prev) => prev.filter((id) => id !== employeeId));
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
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">
            R
          </div>
          <nav className="flex flex-col gap-8 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
                onClick={() => item.route && router.push(item.route)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="mb-4 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
          style={{ color: "#fff", fontSize: "13px" }}
        >
          <span style={{ fontSize: "22px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span style={{ fontSize: "11px" }}>Logout</span>
        </button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        {/* --- Your original attendance code below --- */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
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
                      {/* Action column with Undo */}
                      <td className="py-3 px-4 border">
                        {localMarked.includes(emp.employeeId) ? (
                          <button
                            onClick={() => handleUndo(emp.employeeId)}
                            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            Undo
                          </button>
                        ) : allPresentIds.includes(emp.employeeId) ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded bg-gray-400 cursor-not-allowed text-white"
                          >
                            Marked
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMark(emp.employeeId)}
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Mark Attendance
                          </button>
                        )}
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
              <div className="fixed inset-0 bg-gradient-to-br from-blue-200/80 to-blue-400/80 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-8 relative border-4 border-blue-300">
                  <button
                    className="absolute top-4 right-6 text-blue-400 hover:text-blue-700 text-3xl font-bold transition"
                    onClick={() => setShowAllAttendance(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700  top-0 bg-white z-10 pb-4 border-b-2 border-blue-100 shadow-sm">
                    <span className="inline-block align-middle mr-2">📊</span>
                    All Attendance Records
                  </h2>
                  {allAttendanceLoading ? (
                    <div className="text-center py-8 text-lg text-blue-700">Loading...</div>
                  ) : Object.keys(groupedAttendance).length === 0 ? (
                    <div className="text-center py-8 text-lg text-blue-700">No attendance records found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {Object.entries(groupedAttendance).map(([key, records]) => {
                        const [date, shift] = key.split('__');
                        const presentList = records.filter(r => r.status === 'Present');
                        const absentList = records.filter(r => r.status === 'Absent');
                        return (
                          <div
                            key={key}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200 hover:scale-[1.02] transition-transform"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                <span className="inline-block text-2xl">🗓️</span>
                                {date}
                              </div>
                              <span className={`px-4 py-1 rounded-full text-sm font-semibold shadow
                                ${shift === 'Morning' ? 'bg-blue-200 text-blue-800' :
                                  shift === 'Evening' ? 'bg-blue-400 text-white' :
                                  'bg-blue-700 text-white'}`}>
                                {shift}
                              </span>
                            </div>
                            <div className="flex flex-col gap-4">
                              <div>
                                <div className="font-semibold text-blue-700 flex items-center gap-2 mb-1">
                                  <span className="text-xl">✅</span> Present
                                </div>
                                {presentList.length > 0 ? (
                                  <ul className="list-none pl-0">
                                    {presentList.map((r, idx) => (
                                      <li
                                        key={`${r.employeeId}_${r.date}_${r.shift}_${r.status}_${idx}`}
                                        className="flex items-center gap-2 py-1"
                                      >
                                        <span className="inline-block text-blue-500">●</span>
                                        <span className="font-medium text-blue-900">{r.name}</span>
                                        <span className="text-xs text-blue-400">({r.employeeId})</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-blue-300 italic">None</div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-blue-400 flex items-center gap-2 mb-1">
                                  <span className="text-xl">❌</span> Absent
                                </div>
                                {absentList.length > 0 ? (
                                  <ul className="list-none pl-0">
                                    {absentList.map((r, idx) => (
                                      <li
                                        key={`${r.employeeId}_${r.date}_${r.shift}_${r.status}_${idx}`}
                                        className="flex items-center gap-2 py-1"
                                      >
                                        <span className="inline-block text-blue-200">●</span>
                                        <span className="font-medium text-blue-700">{r.name}</span>
                                        <span className="text-xs text-blue-300">({r.employeeId})</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-blue-200 italic">None</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
      </div>
    </div>
  );
}