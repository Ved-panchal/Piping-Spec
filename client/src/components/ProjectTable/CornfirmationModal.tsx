import React from 'react';

interface Project {
  projectCode: string;        
  projectDescription: string; 
  companyName: string;        
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (project: Project) => void;
  project?: Project | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, project }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (project) {
      onConfirm(project);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete this project?</p>
        <div className="flex justify-end mt-4">
          <button className="mr-2 text-gray-500" onClick={onClose}>Cancel</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
