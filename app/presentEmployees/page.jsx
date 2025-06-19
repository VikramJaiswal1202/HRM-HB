'use client';

import React, { useEffect, useState } from 'react';

export default function PresentEmployeesTable() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!selectedDate) {
      setRecords([]);
      return;
    }

    const fetchData = async () => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-10 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">✅ Present Employees</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-4 py-2 rounded text-black"
        />
        <select
          value={selectedShift}
          onChange={(e) => setSelectedShift(e.target.value)}
          className="border px-4 py-2 rounded text-black"
        >
          <option>Morning</option>
          <option>Evening</option>
          <option>Night</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-64 text-black"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left">Employee ID</th>
              <th className="px-4 py-2 border text-left">Name</th>
              <th className="px-4 py-2 border text-left">Check-In Time</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((rec, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border">{rec.employeeId}</td>
                  <td className="px-4 py-2 border">{rec.name}</td>
                  <td className="px-4 py-2 border">
                    {rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  No present employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-semibold text-blue-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
