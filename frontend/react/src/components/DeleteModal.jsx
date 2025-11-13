const DeleteModal = ({ show, filename, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-11/12 max-w-md">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
          Confirm delete
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-200 mb-4">
          Are you sure you want to delete <strong>{filename}</strong>? This
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
