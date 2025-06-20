'use client';

import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function PresentEmployeesTable() {
  const router = useRouter();

  // Sidebar items (copied from reporting page)
  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Interns", icon: "👥", route: "/intern" },
    { label: "Attendance and Timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Reporting", icon: "⏱️", route: "/reporting" },
    { label: "view Reporting", icon: "⏱️", route: "/viewreporting" },
  ];

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!selectedDate) {
      setRecords([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance?date=${selectedDate}&shift=${selectedShift}`);
        const data = await res.json();
        if (data.success) {
          const presentOnly = data.data.filter((r) => r.status === 'Present');
          setRecords(presentOnly);
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedShift]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      records.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.employeeId.toLowerCase().includes(term)
      )
    );
    setCurrentPage(1);
  }, [search, records]);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'Morning': return 'from-amber-500 to-orange-500';
      case 'Evening': return 'from-purple-500 to-pink-500';
      case 'Night': return 'from-indigo-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">
            R
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
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
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Present Employees
                </h1>
              </div>
              <p className="text-slate-600 text-lg">Track and manage employee attendance in real-time</p>
            </div>

            {/* Main Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Controls Section */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm border-b border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Date Picker */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md"
                      />
                    </div>
                  </div>

                  {/* Shift Selector */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md appearance-none"
                      >
                        <option>Morning</option>
                        <option>Evening</option>
                        <option>Night</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                {selectedDate && (
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`px-4 py-2 bg-gradient-to-r ${getShiftColor(selectedShift)} text-white rounded-full text-sm font-semibold shadow-lg`}>
                      {selectedShift} Shift
                    </div>
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      {filtered.length} Present
                    </div>
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Table Section */}
              <div className="p-6 md:p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-slate-600">Loading employees...</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200/50 shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                              Employee ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                              Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-gray-200">
                              Check-In Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {paginated.length > 0 ? (
                            paginated.map((rec, idx) => (
                              <tr key={idx} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-sm font-mono font-semibold text-slate-900">{rec.employeeId}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                      {rec.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900">{rec.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className="text-sm text-slate-600 font-medium">
                                      {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <p className="text-lg font-semibold text-slate-600 mb-2">No present employees found</p>
                                  <p className="text-sm text-slate-400">
                                    {!selectedDate ? 'Please select a date to view attendance' : 'No employees marked as present for this date and shift'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modern Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-slate-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} results
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = pageNum === currentPage;
                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                                isActive 
                                  ? 'bg-blue-600 text-white shadow-lg' 
                                  : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 hover:shadow-md'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}