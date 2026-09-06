import React from 'react';
import { Trash2 } from 'lucide-react';
import { Employee } from '../types/employee';

interface DeleteConfirmModalProps {
  employee: Employee | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  employee,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-icon-danger">
          <Trash2 size={26} />
        </div>
        <h3 className="modal-title">Are you sure?</h3>
        <p className="modal-text">
          This will permanently delete the employee record for{' '}
          <strong>
            {employee.firstName} {employee.lastName} (ID: {employee.employeeId})
          </strong>
          .<br />
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Employee'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
