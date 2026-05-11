'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
}

interface Props {
  folder?: string;
  onUploaded?: (media: any) => void;
  multiple?: boolean;
}

export function MediaUploader({ folder = '/uploads', onUploaded, multiple = true }: Props) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const upload = async (uploadFile: UploadFile, index: number) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading', progress: 30 } : f));
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('folder', folder);
    try {
      const { data } = await mediaApi.upload(formData);
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'done', progress: 100, url: data.media.file_url } : f));
      onUploaded?.(data.media);
      toast.success(`تم رفع ${uploadFile.file.name}`);
    } catch (e: any) {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', error: e?.response?.data?.error || 'فشل الرفع' } : f));
      toast.error(`فشل رفع ${uploadFile.file.name}`);
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadFile[] = accepted.map(f => ({ file: f, progress: 0, status: 'pending' }));
    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      newFiles.forEach((nf, i) => {
        const idx = prev.length + i;
        setTimeout(() => upload({ ...nf }, idx), 100);
      });
      return updated;
    });
  }, [folder, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'image/*': [], 'video/*': [], 'audio/*': [],
      'application/pdf': [], 'application/msword': [],
    },
  });

  const remove = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}`}
        style={{ borderColor: isDragActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.2)' }}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm" style={{ color: 'var(--color-text)' }}>
          {isDragActive ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا أو اضغط للاختيار'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, MP4, PDF — حتى 50 ميجابايت</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              {f.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
              {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {(f.status === 'pending' || f.status === 'uploading') && (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0"
                  style={{ borderColor: 'var(--color-primary)' }} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>{f.file.name}</p>
                {f.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-gray-100 rounded-full">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${f.progress}%`, background: 'var(--color-primary)' }} />
                  </div>
                )}
                {f.error && <p className="text-xs text-red-500">{f.error}</p>}
              </div>
              <button onClick={() => remove(i)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
