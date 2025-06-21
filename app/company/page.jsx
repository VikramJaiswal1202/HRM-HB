'use client';

import React, { useState, useEffect } from 'react';

const SIDEBAR_OPTIONS = [
  { key: 'manager', label: 'Managers' },
  { key: 'hr', label: 'HR' },
  { key: 'employees', label: 'Employees' },
];

export default function CompanyHomePage() {
  const [activeSection, setActiveSection] = useState('manager');
  const [managers, setManagers] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    role: 'Manager',
    name: '',
    email: '',
    id: '',
    country: '',
    password: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState('');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedManagers = localStorage.getItem('company_managers');
      const storedHrs = localStorage.getItem('company_hrs');
      const storedEmployees = localStorage.getItem('company_employees');
      if (storedManagers) setManagers(JSON.parse(storedManagers));
      if (storedHrs) setHrs(JSON.parse(storedHrs));
      if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  // Save managers to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_managers', JSON.stringify(managers));
    }
  }, [managers]);

  // Save HRs to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_hrs', JSON.stringify(hrs));
    }
  }, [hrs]);

  // Save employees to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_employees', JSON.stringify(employees));
    }
  }, [employees]);

  // Add Manager or HR
  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    const list = form.role === 'Manager' ? managers : hrs;
    // Check for duplicate email or ID
    const exists = list.some(
      (m) => m.email === form.email || m.id === form.id
    );
    if (exists) {
      setError(`${form.role} with this Email or ID already exists.`);
      return;
    }
    if (form.role === 'Manager') {
      setManagers([
        ...managers,
        { ...form },
      ]);
    } else {
      setHrs([
        ...hrs,
        { ...form },
      ]);
    }
    setForm({
      role: form.role,
      name: '',
      email: '',
      id: '',
      country: '',
      password: '',
    });
    setShowAddForm(false);
  };

  // Edit
  const handleEdit = (idx, role) => {
    setEditIdx(idx);
    setEditForm(role === 'Manager' ? managers[idx] : hrs[idx]);
    setShowAddForm(false);
    setError('');
  };

  // Save after edit
  const handleSave = (role) => {
    setError('');
    const list = role === 'Manager' ? managers : hrs;
    // Check for duplicate email or ID (excluding self)
    const exists = list.some(
      (m, i) =>
        i !== editIdx && (m.email === editForm.email || m.id === editForm.id)
    );
    if (exists) {
      setError(`${role} with this Email or ID already exists.`);
      return;
    }
    if (role === 'Manager') {
      const updated = [...managers];
      updated[editIdx] = { ...editForm, role: 'Manager' };
      setManagers(updated);
    } else {
      const updated = [...hrs];
      updated[editIdx] = { ...editForm, role: 'HR' };
      setHrs(updated);
    }
    setEditIdx(null);
    setEditForm({});
  };

  // Delete
  const handleDelete = (idx, role) => {
    if (role === 'Manager') {
      setManagers(managers.filter((_, i) => i !== idx));
    } else {
      setHrs(hrs.filter((_, i) => i !== idx));
    }
    setEditIdx(null);
    setEditForm({});
  };

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'id', label: 'ID' },
    { key: 'country', label: 'Country' },
    { key: 'password', label: 'Password' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col">
        <div className="p-5 text-2xl font-bold text-blue-600 border-b">Company Home</div>
        <nav className="mt-4 flex-1">
          {SIDEBAR_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition ${
                activeSection === opt.key
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveSection(opt.key);
                setEditIdx(null);
                setEditForm({});
                setShowAddForm(false);
                setError('');
              }}
            >
              {opt.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {(activeSection === 'manager' || activeSection === 'hr') && (
          <div>
            <h1 className="text-2xl font-semibold text-blue-700 mb-4">
              {activeSection === 'manager' ? 'Managers' : 'HR'}
            </h1>
            <div className="flex justify-end mb-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setForm({
                    role: activeSection === 'manager' ? 'Manager' : 'HR',
                    name: '',
                    email: '',
                    id: '',
                    country: '',
                    password: '',
                  });
                  setEditIdx(null);
                  setEditForm({});
                  setError('');
                }}
              >
                {showAddForm ? 'Cancel' : `+ Add ${activeSection === 'manager' ? 'Manager' : 'HR'}`}
              </button>
            </div>
            {showAddForm && (
              <form
                className="mb-8 p-4 bg-white rounded shadow flex flex-col gap-3 max-w-lg"
                onSubmit={handleAdd}
              >
                <input
                  className="border p-2 rounded"
                  placeholder="Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, role: activeSection === 'manager' ? 'Manager' : 'HR' })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value, role: activeSection === 'manager' ? 'Manager' : 'HR' })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="ID"
                  value={form.id}
                  onChange={e => setForm({ ...form, id: e.target.value, role: activeSection === 'manager' ? 'Manager' : 'HR' })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Country"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value, role: activeSection === 'manager' ? 'Manager' : 'HR' })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value, role: activeSection === 'manager' ? 'Manager' : 'HR' })}
                  required
                />
                {error && <div className="text-red-600">{error}</div>}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Add {activeSection === 'manager' ? 'Manager' : 'HR'}
                </button>
              </form>
            )}
            <h2 className="text-xl font-semibold mb-2">{activeSection === 'manager' ? 'Managers' : 'HR'} List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col.key} className="px-4 py-2 border-b text-left">{col.label}</th>
                    ))}
                    <th className="px-4 py-2 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeSection === 'manager' ? managers : hrs).length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-2 text-gray-500">
                        No {activeSection === 'manager' ? 'managers' : 'HR'} added.
                      </td>
                    </tr>
                  )}
                  {(activeSection === 'manager' ? managers : hrs).map((m, idx) => (
                    <tr key={idx}>
                      {editIdx === idx ? (
                        columns.map(col => (
                          <td key={col.key} className="px-4 py-2 border-b">
                            <input
                              className="border p-1 rounded w-full"
                              value={editForm[col.key]}
                              onChange={e =>
                                setEditForm({ ...editForm, [col.key]: e.target.value })
                              }
                            />
                          </td>
                        ))
                      ) : (
                        columns.map(col => (
                          <td key={col.key} className="px-4 py-2 border-b">{m[col.key]}</td>
                        ))
                      )}
                      <td className="px-4 py-2 border-b">
                        {editIdx === idx ? (
                          <>
                            <button
                              className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                              onClick={() => handleSave(activeSection === 'manager' ? 'Manager' : 'HR')}
                            >
                              Save
                            </button>
                            <button
                              className="px-2 py-1 bg-gray-300 rounded"
                              onClick={() => { setEditIdx(null); setEditForm({}); setError(''); }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="px-2 py-1 bg-yellow-400 text-white rounded mr-2"
                              onClick={() => handleEdit(idx, activeSection === 'manager' ? 'Manager' : 'HR')}
                            >
                              Edit
                            </button>
                            <button
                              className="px-2 py-1 bg-red-500 text-white rounded"
                              onClick={() => handleDelete(idx, activeSection === 'manager' ? 'Manager' : 'HR')}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        )}

        {activeSection === 'employees' && (
          <div>
            <h1 className="text-2xl font-semibold text-blue-700 mb-4">Company Employees</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.length === 0 && (
                <div className="col-span-full text-gray-500">No employees found.</div>
              )}
              {employees.map((emp, idx) => (
                <div key={idx} className="p-4 bg-white rounded shadow text-sm">
                  <div><span className="font-semibold">Name:</span> {emp.name}</div>
                  <div><span className="font-semibold">Email:</span> {emp.email}</div>
                  <div><span className="font-semibold">ID:</span> {emp.id}</div>
                  <div><span className="font-semibold">Country:</span> {emp.country}</div>
                  <div><span className="font-semibold">Department:</span> {emp.department}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}