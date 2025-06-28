"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EmployeeReportForm() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageM" },
    { label: "Employees", icon: "👥", route: "/employeesM" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance and timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
    { label: "Task Assign", icon: "📝",route: "/taskAssign"},
  ];

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes] = await Promise.all([
          axios.get('/api/employees')
        ]);
        setEmployees(empRes.data.employees || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.employeeId) {
      fetchReports(formData.employeeId);
    }
  }, [formData.employeeId]);

  const fetchReports = async (empId) => {
    try {
      const res = await axios.get(`/api/reports?employeeId=${empId}`);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setFile(new File([blob], `capture-${Date.now()}.png`, { type: "image/png" }));
        }
      }, "image/png", 0.9);
      
      handleCloseCamera();
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!formData.employeeId || !formData.date) {
      setError("Employee and Date are required.");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("employeeId", formData.employeeId);
    formPayload.append("date", formData.date);
    formPayload.append("notes", formData.notes);
    
    // Properly append the file if it exists
    if (file) {
      formPayload.append("file", file); // Changed from "image" to "file" to match your working example
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/reports", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(res.data);
      fetchReports(formData.employeeId);
      setFile(null);
      setFormData(prev => ({ ...prev, notes: "" }));
    } catch (err) {
      console.error("Error submitting report", err);
      setError(err.response?.data?.error || "Error submitting report. Please try again.");
    } finally {
      setLoading(false);
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
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span style={{ fontSize: "11px" }}>Logout</span>
        </button>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8">
          {/* Report Form */}
          <div className="lg:w-1/2">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl shadow-lg w-full"
              encType="multipart/form-data" // Added form encoding
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-[#0D1A33]">
                📋 Employee Reporting Update
              </h2>

              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
                  Choose Employee
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded focus:outline-[#4267b2]"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="Write your update here..."
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
                  Attach Image / Capture
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    name="file" // Changed to match the working example
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    className="px-3 py-1 border border-[#4267b2] text-[#4267b2] rounded hover:bg-[#f4f7fb]"
                  >
                    📸 Camera
                  </button>
                </div>
                {file && (
                  <div className="text-xs text-[#0D1A33] mt-1">
                    Attached: {file.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full bg-[#4267b2] text-white py-2 rounded hover:bg-[#37599d] transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit"}
              </button>

              {response && (
                <div className="mt-4 bg-green-100 border border-green-400 p-3 rounded text-sm text-green-700">
                  ✅ Submitted Successfully!
                </div>
              )}
            </form>
          </div>

          {/* Report History */}
          <div className="lg:w-1/2">
            <div className="bg-white p-6 rounded-xl shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-4 text-[#0D1A33]">
                📜 Report History
              </h2>
              
              {formData.employeeId ? (
                reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((report) => (
                        <div key={report._id} className="border-b pb-4 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-[#0D1A33]">
                                {new Date(report.date).toLocaleDateString()}
                              </h3>
                              {report.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {report.notes}
                                </p>
                              )}
                            </div>
                            {report.imagePath && (
                              <a
                                href={report.imagePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-sm underline"
                              >
                                View Attachment
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No previous reports found for this employee.
                  </p>
                )
              ) : (
                <p className="text-gray-500">
                  Select an employee to view their report history.
                </p>
              )}
            </div>
          </div>
        </main>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-sm w-full">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Take Photo</h3>
                <button
                  onClick={handleCloseCamera}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 bg-black rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-center">
                <button
                  onClick={handleCapture}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Capture Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}