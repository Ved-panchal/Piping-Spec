import React from 'react';
import { ConfirmationModalProps } from '../../utils/interface';


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg text-black shadow-md max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button className="mr-2 text-gray-500 hover:underline" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
