'use client';

import { useState, useEffect } from 'react';

export default function AddInternPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    roll: '',
    department: '',
    employeeId: '',
  });
  const [resume, setResume] = useState(null);
  const [more, setMore] = useState(null);
  const [message, setMessage] = useState('');
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInterns = async () => {
    const res = await fetch('/api/interns');
    const data = await res.json();
    if (data.success) {
      setInterns(data.interns);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !more) {
      setMessage('Please upload both resume and more files.');
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    formData.append('resume', resume);
    formData.append('more', more);

    try {
      setLoading(true);
      const res = await fetch('/api/interns', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Intern added successfully!');
        setForm({
          name: '',
          email: '',
          mobileNumber: '',
          roll: '',
          department: '',
          employeeId: '',
        });
        setResume(null);
        setMore(null);
        fetchInterns(); // Refresh list
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (error) {
      setMessage('Error submitting form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: 'auto' }}>
      <h2>Add Intern</h2>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <input
              type="text"
              name={key}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              onChange={handleChange}
              required
            /><br /><br />
          </div>
        ))}
        <label>Resume:</label><br />
        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => setResume(e.target.files[0])} required /><br /><br />
        <label>More File:</label><br />
        <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setMore(e.target.files[0])} required /><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Add Intern'}
        </button>
      </form>

      <hr style={{ margin: '3rem 0' }} />
      <h3>Saved Interns</h3>
      <ul>
        {interns.map((intern) => (
          <li key={intern._id} style={{ marginBottom: '1.5rem' }}>
            <strong>{intern.name}</strong> ({intern.department})<br />
            <a href={intern.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a> |
            <a href={intern.moreFileUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px' }}>More File</a><br />
            <small>Email: {intern.email} | ID: {intern.employeeId}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
