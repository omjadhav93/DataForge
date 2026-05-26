import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDatasetStore from '../store/useDatasetStore';
import { apiUrl } from '../lib/api';

const UploadModal = ({ onClose }) => {
  const navigate = useNavigate();
  const setUploadInfo = useDatasetStore((s) => s.setUploadInfo);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selected) => {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Only CSV files are accepted.');
      setFile(null);
      return;
    }
    setErrorMsg('');
    setFile(selected);
    setStatus('idle');
    setUploadedDataset(null);
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(apiUrl('/api/datasets/upload'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setUploadedDataset(data);
      setStatus('success');
      // Persist to Zustand store and navigate to dataset view
      setUploadInfo(data);
      setTimeout(() => {
        onClose();
        navigate('/dataset');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(19, 27, 46, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">upload_file</span>
            </div>
            <h2 id="upload-modal-title" className="text-[20px] font-bold text-on-surface">
              Upload CSV File
            </h2>
          </div>
          <button
            id="upload-modal-close"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Success State */}
          {status === 'success' && uploadedDataset ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <p className="text-[16px] font-bold text-on-surface">Upload Successful!</p>
                  <p className="text-[13px] text-on-surface-variant mt-1">
                    Your dataset is ready to explore.
                  </p>
                </div>
              </div>

              {/* Dataset info */}
              <div className="bg-surface-container-low rounded-xl p-4 space-y-2 text-[14px]">
                {uploadedDataset.tableName && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Table name</span>
                    <span className="font-semibold text-primary">{uploadedDataset.tableName}</span>
                  </div>
                )}
                {uploadedDataset.rowCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Rows inserted</span>
                    <span className="font-semibold">{uploadedDataset.rowCount?.toLocaleString()}</span>
                  </div>
                )}
                {uploadedDataset.columns !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Columns</span>
                    <span className="font-semibold">{uploadedDataset.columns}</span>
                  </div>
                )}
                {uploadedDataset.message && (
                  <div className="pt-1 text-on-surface-variant text-[13px] italic">
                    {uploadedDataset.message}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-[14px] font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                id="csv-drop-zone"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-3
                  border-2 border-dashed rounded-xl p-8 cursor-pointer
                  transition-all duration-200
                  ${isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-outline-variant bg-surface-container-low hover:border-primary/60 hover:bg-primary/5'
                  }
                `}
              >
                <input
                  id="csv-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={onFileChange}
                />

                {file ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                      description
                    </span>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-on-surface">{file.name}</p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5">
                        {formatBytes(file.size)} &bull; CSV
                      </p>
                    </div>
                    <span className="text-[12px] text-on-surface-variant">Click to replace</span>
                  </>
                ) : (
                  <>
                    <span
                      className={`material-symbols-outlined text-4xl transition-colors ${isDragging ? 'text-primary' : 'text-outline'}`}
                    >
                      cloud_upload
                    </span>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-on-surface">
                        {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV here'}
                      </p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5">
                        or <span className="text-primary font-semibold">browse files</span>
                      </p>
                    </div>
                    <span className="text-[12px] text-on-surface-variant">
                      .csv files only &bull; No file size limit
                    </span>
                  </>
                )}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
                  <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                id="csv-submit-btn"
                onClick={handleSubmit}
                disabled={!file || status === 'uploading'}
                className={`
                  w-full py-3.5 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2
                  transition-all duration-200
                  ${!file || status === 'uploading'
                    ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20'
                  }
                `}
              >
                {status === 'uploading' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    Upload &amp; Process
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
