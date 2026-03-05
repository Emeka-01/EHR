import React, { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
export function MedicalResultsPage() {
  const { uploadFile, getUploads } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const uploads = getUploads();
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, JPEG, and PNG are allowed.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max size is 10MB.');
      return false;
    }
    return true;
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    try {
      await uploadFile(file);
      setUploadProgress(100);
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Upload Medical Results
        </h1>
        <p className="text-gray-500">
          Securely upload and store your medical documents
        </p>
      </div>

      <Card className="p-8">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${file ? 'bg-gray-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}>

          {!file ?
          <>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drag & Drop your files here
              </h3>
              <p className="text-gray-500 mb-6">
                Supports PDF, JPEG, PNG (Max 10MB)
              </p>
              <label className="inline-flex">
                <Button
                onClick={() =>
                document.getElementById('file-upload')?.click()
                }>

                  Browse Files
                </Button>
                <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange} />

              </label>
            </> :

          <div className="max-w-sm mx-auto">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                <div className="p-2 bg-blue-50 rounded text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading &&
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500">

                    <X className="h-5 w-5" />
                  </button>
              }
              </div>

              {isUploading ?
            <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`
                  }} />

                  </div>
                </div> :

            <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={() => setFile(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload}>Upload Securely</Button>
                </div>
            }
            </div>
          }

          {error &&
          <div className="mt-6 flex items-center justify-center text-red-600 text-sm bg-red-50 p-2 rounded-lg inline-block">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          }
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Uploads
        </h2>
        {uploads.length > 0 ?
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploads.slice(0, 4).map((file) =>
          <Card key={file.id} className="p-4 flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {file.fileName}
                  </h4>
                  <p className="text-xs text-gray-500">{file.uploadDate}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {file.fileType}
                </span>
              </Card>
          )}
          </div> :

        <p className="text-gray-500 text-sm">No files uploaded yet.</p>
        }
      </div>
    </div>);

}