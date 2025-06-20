'use client';

import { useEffect, useState } from 'react';

export default function AddStaffPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    department: '',
    designation: '',
    employeeId: '',
  });

  const [resume, setResume] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [message, setMessage] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔁 Fetch existing staff
  const fetchStaff = async () => {
    const res = await fetch('/api/staff');
    const data = await res.json();
    if (data.success) {
      setStaffList(data.staffList);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 📝 Handle text input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📤 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume || !documents) {
      setMessage('Please upload both resume and documents.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    formData.append('resume', resume);
    formData.append('documents', documents);

    try {
      setLoading(true);
      const res = await fetch('/api/staff', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Staff added successfully!');
        setForm({
          name: '',
          email: '',
          mobileNumber: '',
          department: '',
          designation: '',
          employeeId: '',
        });
        setResume(null);
        setDocuments(null);
        fetchStaff(); // refresh list
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (err) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h2>Add Employee</h2>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        ))}

        <label>Resume:</label><br />
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => setResume(e.target.files[0])} required /><br /><br />

        <label>Documents:</label><br />
        <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setDocuments(e.target.files[0])} required /><br /><br />

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Employee'}
        </button>
      </form>

      <hr style={{ margin: '3rem 0' }} />
      <h3>Saved Employees</h3>
      <ul>
        {staffList.map((staff) => (
          <li key={staff._id} style={{ marginBottom: '1.5rem' }}>
            <strong>{staff.name}</strong> ({staff.designation}, {staff.department})<br />
            <a href={staff.resumeUrl} target="_blank" rel="noopener noreferrer">Resume</a> |
            <a href={staff.documentsUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>Documents</a><br />
            <small>Email: {staff.email} | ID: {staff.employeeId}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
