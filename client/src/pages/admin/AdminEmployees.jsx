import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';

const AdminEmployees = () => {
  // Mock data for MVP
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Rahul Sharma', role: 'MANAGER', email: 'rahul.s@dineops.com', status: 'Active' },
    { id: 2, name: 'Priya Patel', role: 'CASHIER', email: 'priya.p@dineops.com', status: 'Active' },
    { id: 3, name: 'Amit Kumar', role: 'WAITER', email: 'amit.k@dineops.com', status: 'Inactive' },
  ]);

  const [showForm, setShowForm] = useState(false);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Branch Employees
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage staff members for your branch.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Add New Employee</h3>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); alert("Employee addition is a work in progress."); setShowForm(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" required className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required className="input-field" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select className="input-field cursor-pointer">
                  <option value="MANAGER">Manager</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="WAITER">Waiter</option>
                  <option value="KITCHEN_STAFF">Kitchen Staff</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium shadow-md shadow-primary/20">Save Employee</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold capitalize">
                        {emp.role.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{emp.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 dark:bg-gray-700 dark:hover:bg-primary/20 rounded-md">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-red-900/20 rounded-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmployees;
