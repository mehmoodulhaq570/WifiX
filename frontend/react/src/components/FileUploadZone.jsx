import { useState } from "react";

const FileUploadZone = ({ fileInputRef, onUpload, onFileSelect, pinProtectionEnabled, onTogglePinProtection }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

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
    const files = e.target?.files || e.dataTransfer?.files;
    console.log('handleFileUpload called, files:', files);
    
    if (files && files.length > 0) {
      // Update the file input ref to contain the selected files for drag-drop
      if (fileInputRef.current && e.dataTransfer?.files) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      
      // Update selected files display
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      console.log('Files selected:', fileArray.map(f => f.name));
      
      if (onFileSelect) {
        onFileSelect(files);
      }
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFiles([]);
    console.log('Files cleared');
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
        <div className="text-base sm:text-lg">
          {selectedFiles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">
                ✓ {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} Selected:
              </p>
              <div className="max-h-32 overflow-y-auto px-4">
                {selectedFiles.map((file, idx) => (
                  <p key={idx} className="text-sm text-gray-700 dark:text-gray-300 break-all">
                    {idx + 1}. {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <p>
              Drag & drop files here or{" "}
              <span className="text-blue-600 font-semibold">click to select</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {/* PIN Protection Toggle */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <input
            type="checkbox"
            id="pinProtection"
            checked={pinProtectionEnabled}
            onChange={onTogglePinProtection}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          />
          <label
            htmlFor="pinProtection"
            className="text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            🔒 Enable PIN Protection
          </label>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={onUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold transition w-full sm:w-auto"
          >
            Upload
          </button>
        </div>
      </div>
    </section>
  );
};

export default FileUploadZone;
