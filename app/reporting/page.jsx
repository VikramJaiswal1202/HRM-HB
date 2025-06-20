"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EmployeeReportForm() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Interns", icon: "👥", route: "/intern" },
    { label: "Attendance and Timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Reporting", icon: "⏱️", route: "/reporting" },
    { label: "View Reporting", icon: "⏱️", route: "/viewreporting" },
  ];

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch((err) => console.error("Failed to fetch employees", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleOpenCamera = async () => {
    setShowCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setCameraStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setFile(new File([blob], "captured-image.png", { type: "image/png" }));
        handleCloseCamera();
      }, "image/png");
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!formData.employeeId || !formData.date) {
      setError("Employee and Date are required.");
      return;
    }

    const data = new FormData();
    data.append("employeeId", formData.employeeId);
    data.append("date", formData.date);
    data.append("notes", formData.notes);
    if (file) data.append("image", file);

    setLoading(true);
    try {
      const res = await axios.post("/api/reports", data);
      setResponse(res.data);
      setFormData({ employeeId: "", date: "", notes: "" });
      setFile(null);
    } catch (err) {
      console.error("Error submitting report", err);
      setError("Error submitting report. Please try again.");
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
        <main className="flex-1 flex justify-center items-center p-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-[#0D1A33]">
              📋 Employee Reporting Update
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
              Choose Employee
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-[#4267b2]"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>

            <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded mb-4"
            />

            <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded mb-4"
              placeholder="Write your update here..."
              rows={3}
            />

            <label className="block mb-1 text-sm font-semibold text-[#0D1A33]">
              Attach Image / Capture
            </label>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="file"
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
              <div className="text-xs text-[#0D1A33] mb-2">
                Attached: {file.name}
              </div>
            )}

            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="rounded-lg w-64 h-48 object-cover"
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="bg-[#4267b2] text-white px-4 py-2 rounded font-bold"
                      onClick={handleCapture}
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-[#0D1A33] px-4 py-2 rounded font-bold"
                      onClick={handleCloseCamera}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-[#4267b2] text-white py-2 rounded hover:bg-[#37599d] transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {response && (
              <div className="mt-4 bg-green-100 border border-green-400 p-3 rounded text-sm text-green-700">
                ✅ Submitted Successfully!
                <pre className="mt-2 text-xs text-green-900 overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
