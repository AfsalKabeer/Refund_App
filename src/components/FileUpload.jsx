import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

export default function FileUpload({ onFileSelect, error }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const processFile = useCallback(
    (file) => {
      setFileError('');
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError('Please upload an image (JPEG, PNG, GIF, WebP) or PDF file.');
        return;
      }

      if (file.size > MAX_SIZE) {
        setFileError('File size must be less than 5MB.');
        return;
      }

      setFileName(file.name);
      onFileSelect(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    setFileError('');
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">
        Attachment <span className="text-white/40">(optional)</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <AnimatePresence mode="wait">
          {fileName ? (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto h-24 w-24 rounded-lg object-cover ring-2 ring-white/20"
                />
              )}
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-white/70 truncate max-w-[200px]">{fileName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="ml-2 text-red-400 hover:text-red-300 text-xs underline"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg className="mx-auto h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-white/50">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-white/30 mt-1">
                Image or PDF, max 5MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(fileError || error) && (
        <p className="text-sm text-red-400">{fileError || error}</p>
      )}
    </div>
  );
}
