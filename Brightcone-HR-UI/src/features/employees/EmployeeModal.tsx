import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { CreateEmployeePayload, Employee } from '../../types/employee.types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateEmployeePayload) => Promise<void>;
  editingEmployee?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEmployee,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [grade, setGrade] = useState('L5');
  const [location, setLocation] = useState('Hyderabad');
  const [manager, setManager] = useState('Naresh Vemparala');
  const [status, setStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setEmail(editingEmployee.email);
      setRole(editingEmployee.role);
      setDepartment(editingEmployee.department);
      setGrade(editingEmployee.grade);
      setLocation(editingEmployee.location);
      setManager(editingEmployee.manager);
      setStatus(editingEmployee.status);
    } else {
      setName('');
      setEmail('');
      setRole('');
      setDepartment('Engineering');
      setGrade('L5');
      setLocation('Hyderabad');
      setManager('Naresh Vemparala');
      setStatus('Active');
    }
  }, [editingEmployee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        id: editingEmployee?.id,
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
        role,
        department,
        grade,
        location,
        manager,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEmployee ? `Edit Employee (${editingEmployee.id})` : 'Add New Employee'}
      subtitle={
        editingEmployee
          ? 'Update personnel record in PostgreSQL database'
          : 'Create a new employee profile in Brightcone HR directory'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Varma"
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.varma@brightcone.ai"
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role / Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Backend Engineer"
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
            >
              <option value="Leadership">Leadership</option>
              <option value="People Ops">People Ops</option>
              <option value="AI Research">AI Research</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Product">Product</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Grade <span className="text-rose-500">*</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
            >
              <option value="L9">L9 (Executive / Founder)</option>
              <option value="L8">L8 (Principal)</option>
              <option value="L7">L7 (Manager / Staff)</option>
              <option value="L6">L6 (Senior / Lead)</option>
              <option value="L5">L5 (Mid-Senior)</option>
              <option value="L4">L4 (Engineer)</option>
              <option value="L3">L3 (Associate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad"
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Reporting Manager
          </label>
          <input
            type="text"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="e.g. Naresh Vemparala or no manager"
            className="w-full bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingEmployee ? 'Save Changes' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
