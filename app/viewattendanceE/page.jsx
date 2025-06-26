'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AttendancePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('morning');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageE" },
    { label: "View Attendance", icon: "📅", route: "/viewattendanceE" },
    { label: "Task Assign", icon: "📝", route: "/taskassignE" },
  ];

  // Mock data - replace with actual API call
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data based on selected date and shift
      const mockData = [
        { 
          id: 1, 
          name: "John Doe", 
          employeeId: "EMP001",
          status: shift === 'morning' ? 'Present' : shift === 'evening' ? 'Late' : 'Absent',
          timeIn: shift === 'morning' ? '08:45 AM' : shift === 'evening' ? '04:15 PM' : null,
          timeOut: shift === 'morning' ? '05:30 PM' : shift === 'evening' ? '11:45 PM' : null
        },
        { 
          id: 2, 
          name: "Jane Smith", 
          employeeId: "EMP002",
          status: shift === 'morning' ? 'Late' : shift === 'evening' ? 'Present' : 'Absent',
          timeIn: shift === 'morning' ? '09:15 AM' : shift === 'evening' ? '04:00 PM' : null,
          timeOut: shift === 'morning' ? '05:45 PM' : shift === 'evening' ? '11:30 PM' : null
        },
        // Add more mock data as needed
      ];
      
      setAttendanceData(mockData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, shift]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleShiftChange = (e) => {
    setShift(e.target.value);
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between z-40">
        <div className="w-full">
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow mx-auto">
            R
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors ${
                  item.label === "View Attendance" ? "bg-[#1a2b4c]" : ""
                }`}
                onClick={() => router.push(item.route)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="w-full flex justify-center">
          <button
            onClick={() => router.push("/login")}
            className="fixed bottom-6 left-6 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors z-50"
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
        </div>
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

        {/* Attendance Content */}
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-6xl flex flex-col gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-[#0D1A33]">Your Attendance</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="date" className="font-medium text-[#0D1A33]">Date:</label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label htmlFor="shift" className="font-medium text-[#0D1A33]">Shift:</label>
                    <select
                      id="shift"
                      value={shift}
                      onChange={handleShiftChange}
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    >
                      <option value="morning">Morning Shift</option>
                      <option value="evening">Evening Shift</option>
                      <option value="night">Night Shift</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading attendance data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-3 px-6 border-b text-left">Employee ID</th>
                        <th className="py-3 px-6 border-b text-left">Name</th>
                        <th className="py-3 px-6 border-b text-left">Status</th>
                        <th className="py-3 px-6 border-b text-left">Time In</th>
                        <th className="py-3 px-6 border-b text-left">Time Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-400 py-6">
                            No attendance records found for selected date and shift
                          </td>
                        </tr>
                      ) : (
                        attendanceData.map((employee) => (
                          <tr
                            key={employee.id}
                            className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition"
                          >
                            <td className="py-3 px-6 border-b">{employee.employeeId}</td>
                            <td className="py-3 px-6 border-b">{employee.name}</td>
                            <td className="py-3 px-6 border-b">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.status === 'Present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : employee.status === 'Late' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="py-3 px-6 border-b">{employee.timeIn || '-'}</td>
                            <td className="py-3 px-6 border-b">{employee.timeOut || '-'}</td>
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
      </div>
    </div>
  );
};

export default AttendancePage;