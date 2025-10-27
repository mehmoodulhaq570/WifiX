import { useState } from "react";

const FileUploadZone = ({ fileInputRef, onUpload, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    const files = e.target?.files || e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Update the file input ref to contain the selected files for drag-drop
      if (fileInputRef.current && e.dataTransfer?.files) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      if (onFileSelect) {
        onFileSelect(files);
      }
    }
  };

  return (
    <section className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col">
      <h2 className="text-lg md:text-xl font-bold text-blue-600 mb-4 border-b pb-2">
        Upload Files
      </h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-xl flex-1 flex items-center justify-center p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300"
        }`}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-base sm:text-lg">
          Drag & drop files here or{" "}
          <span className="text-blue-600 font-semibold">click to select</span>
        </p>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={onUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold transition w-full sm:w-auto"
        >
          Upload
        </button>
      </div>
    </section>
  );
};

export default FileUploadZone;
