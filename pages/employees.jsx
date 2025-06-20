'use client'; // Only needed if you're using App Router, otherwise remove

import { useEffect, useState } from 'react';

export default function EmployeesPage() {
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    mobileNumber: '',
    department: '',
    designation: '',
  });
  const [resume, setResume] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all employees
  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.employees);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume || !documents) {
      setMessage('Please upload both resume and documents.');
      return;
    }

    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    formData.append('resume', resume);
    formData.append('documents', documents);

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ Employee added!');
        setForm({
          employeeId: '',
          name: '',
          email: '',
          mobileNumber: '',
          department: '',
          designation: '',
        });
        setResume(null);
        setDocuments(null);
        setEmployees(prev => [data.employee, ...prev]);
      } else {
        setMessage(data.error || '❌ Failed to add employee.');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      <h2>Add Employee</h2>
      {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {Object.entries(form).map(([key, val]) => (
          <div key={key} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name={key}
              placeholder={key}
              value={val}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        ))}
        <div style={{ marginBottom: '1rem' }}>
          <label>Resume:</label><br />
          <input type="file" accept=".pdf,.docx" onChange={e => setResume(e.target.files[0])} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Documents:</label><br />
          <input type="file" onChange={e => setDocuments(e.target.files[0])} required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Employee'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />
      <h3>Employee List</h3>
      {employees.length === 0 ? (
        <p>No employees yet.</p>
      ) : (
        <ul>
          {employees.map(emp => (
            <li key={emp.employeeId} style={{ marginBottom: '1rem' }}>
              <strong>{emp.name}</strong> ({emp.employeeId}) — {emp.department}<br />
              Email: {emp.email}<br />
              {emp.resumeUrl && <a href={emp.resumeUrl} target="_blank">Resume</a>}<br />
              {emp.documentsUrl && <a href={emp.documentsUrl} target="_blank">Documents</a>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
