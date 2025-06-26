"use client";
import { useState, useEffect } from "react";

export default function InternsPage() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interns");
      const data = await res.json();
      if (data.success) {
        setInterns(data.interns);
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">
            R
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/homepageM"}
            >
              <span className="text-2xl">🏠</span>
              <span className="text-[11px] font-medium">Homepage</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/employeesM"}
            >
              <span className="text-2xl">👥</span>
              <span className="text-[11px] font-medium">Employees</span>
            </button>
            <button className="flex flex-col items-center gap-1 bg-[#1a2b4c] rounded py-2 w-16 transition-colors">
              <span className="text-2xl">👥</span>
              <span className="text-[11px] font-medium">Interns</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/attendance"}
            >
              <span className="text-2xl">🗓️</span>
              <span className="text-[11px] font-medium">Attendance</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/presentEmployees"}
            >
              <span className="text-2xl">🗓️</span>
              <span className="text-[11px] font-medium">View Attendance</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/reporting"}
            >
              <span className="text-2xl">⏱️</span>
              <span className="text-[11px] font-medium">Reporting</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors" 
              onClick={() => window.location.href = "/taskAssign"}
            >
              <span className="text-2xl">📝</span>
              <span className="text-[11px] font-medium">Task Assign</span>
            </button>
          </nav>
        </div>
        <button
          onClick={() => window.location.href = "/login"}
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
      <div className="flex-1 flex flex-col">
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-6xl flex flex-col gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0D1A33] flex items-center gap-2">
                  Interns
                </h2>
              </div>
              {loading ? (
                <div className="text-center py-8">Loading interns...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-3 px-6 border-b">Intern ID</th>
                        <th className="py-3 px-6 border-b">Name</th>
                        <th className="py-3 px-6 border-b">Email</th>
                        <th className="py-3 px-6 border-b">Department</th>
                        <th className="py-3 px-6 border-b">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-400 py-6">
                            No interns found.
                          </td>
                        </tr>
                      ) : (
                        interns.map((intern, idx) => (
                          <tr
                            key={intern._id || idx}
                            className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition cursor-pointer"
                            onClick={() => setSelectedIntern(intern)}
                          >
                            <td className="py-3 px-6 border-b">{intern.employeeId}</td>
                            <td className="py-3 px-6 border-b">{intern.name}</td>
                            <td className="py-3 px-6 border-b">{intern.email}</td>
                            <td className="py-3 px-6 border-b">{intern.department}</td>
                            <td className="py-3 px-6 border-b">{intern.roll || intern.role || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
        {selectedIntern && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                onClick={() => setSelectedIntern(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                Intern Details
              </h3>
              <div className="mb-4 bg-[#e9eef6] rounded-lg p-4 text-[#0D1A33]">
                <div className="mb-2">
                  <span className="font-semibold">Name:</span> {selectedIntern.name}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Intern ID:</span> {selectedIntern.employeeId}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Email:</span> {selectedIntern.email}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Department:</span> {selectedIntern.department}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Role:</span> {selectedIntern.roll || selectedIntern.role || "-"}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Resume:</span>{" "}
                  {selectedIntern.resumeUrl ? (
                    <a 
                      href={selectedIntern.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">More File:</span>{" "}
                  {selectedIntern.moreFileUrl ? (
                    <a 
                      href={selectedIntern.moreFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedIntern(null)}
                className="w-full mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}