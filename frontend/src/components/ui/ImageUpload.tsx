"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  onUpload: (formData: FormData) => Promise<{ url?: string; error?: string }>;
  fieldName?: string;
  accept?: string;
  maxSizeMB?: number;
  currentImageUrl?: string | null;
  label?: string;
  shape?: "square" | "circle";
  className?: string;
}

export function ImageUpload({
  onUpload,
  fieldName = "image",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  currentImageUrl,
  label = "Upload Image",
  shape = "square",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum: ${maxSizeMB}MB`);
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append(fieldName, file);

    const result = await onUpload(formData);
    setIsUploading(false);

    if (result.error) {
      setError(result.error);
      setPreview(currentImageUrl ?? null);
    } else if (result.url) {
      setPreview(result.url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer overflow-hidden transition-all duration-300
          ${shapeClass}
          ${shape === "circle" ? "w-24 h-24" : "w-full aspect-video"}
          ${isDragging
            ? "border-2 border-dashed border-primary-400 bg-primary-500/10 scale-102"
            : "border-2 border-dashed border-white/20 hover:border-primary-400/60 bg-white/5 hover:bg-white/10"
          }
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className={`w-full h-full object-cover ${shapeClass}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-gray-400">
            <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            {shape !== "circle" && (
              <span className="text-xs text-center leading-tight">
                Drag & drop or click to upload
              </span>
            )}
          </div>
        )}

        {/* Upload overlay */}
        {isUploading && (
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center ${shapeClass}`}>
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {/* Success checkmark */}
        {!isUploading && preview && preview !== currentImageUrl && (
          <div className={`absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg`}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isUploading ? "Uploading..." : label}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
