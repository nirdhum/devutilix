"use client";

import { useState, useRef } from "react";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Simple EXIF marker scanner for JPEG images (detects APP1 metadata marker 0xFFE1)
function scanExifMarkers(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return { hasExif: false, isJpeg: false };
  }

  let offset = 2;
  let hasExif = false;
  let hasGps = false;

  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);

    if (marker === 0xe1) {
      // APP1 Marker (EXIF)
      hasExif = true;
      // Search for GPS tag or marker
      for (let i = offset; i < Math.min(offset + 500, view.byteLength - 4); i++) {
        if (
          view.getUint8(i) === 0x47 &&
          view.getUint8(i + 1) === 0x50 &&
          view.getUint8(i + 2) === 0x53
        ) {
          hasGps = true;
          break;
        }
      }
      break;
    }
    const len = view.getUint16(offset + 2);
    offset += 2 + len;
  }

  return { hasExif, hasGps, isJpeg: true };
}

export default function EXIFRemover() {
  const [fileInfo, setFileInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [sanitizedBlob, setSanitizedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setSanitizedBlob(null);

    const buffer = await file.arrayBuffer();
    const exifScan = scanExifMarkers(buffer);

    const info = {
      name: file.name,
      size: formatBytes(file.size),
      rawSize: file.size,
      type: file.type || "image/jpeg",
      lastModified: new Date(file.lastModified).toLocaleString(),
      hasExif: exifScan.hasExif,
      hasGps: exifScan.hasGps,
    };
    setFileInfo(info);

    // Create object preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Sanitize by redrawing to pure HTML5 canvas and re-encoding
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          setSanitizedBlob(blob);
          setIsProcessing(false);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.95
      );
    };
    img.src = objectUrl;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSanitized = () => {
    if (!sanitizedBlob) return;
    const url = URL.createObjectURL(sanitizedBlob);
    const a = document.createElement("a");
    a.href = url;
    const ext = fileInfo?.type === "image/png" ? "png" : "jpg";
    a.download = `sanitized_${fileInfo?.name?.replace(/\.[^/.]+$/, "") || "image"}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>EXIF Metadata Inspector & Remover</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                100% Local Privacy
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Inspect embedded camera and GPS metadata from photos and strip all privacy-sensitive tags client-side.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Choose Photo</span>
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="text-4xl">📸</div>
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Drag and drop any photograph here, or click to browse
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supports JPEG, PNG, and WebP. Photos are cleaned in local browser canvas memory.
          </p>
        </div>
      </div>

      {/* Metadata & Actions */}
      {fileInfo && (
        <div className="space-y-6">
          {/* Metadata Bar */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block pb-2 border-b border-gray-100 dark:border-gray-700">
              Metadata Analysis
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">File Name</span>
                <span className="font-bold text-gray-900 dark:text-white truncate block">{fileInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">Original Size</span>
                <span className="font-bold text-gray-900 dark:text-white">{fileInfo.size}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">EXIF Headers</span>
                <span className={`font-bold block ${fileInfo.hasExif ? "text-amber-600" : "text-green-600"}`}>
                  {fileInfo.hasExif ? "EXIF Present" : "None Detected"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold text-[10px] uppercase">GPS Coordinates</span>
                <span className={`font-bold block ${fileInfo.hasGps ? "text-red-600 font-black" : "text-green-600"}`}>
                  {fileInfo.hasGps ? "Location Tagged" : "No Location Tag"}
                </span>
              </div>
            </div>

            {/* Sanitized Download Box */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm block">
                  Sanitized Image Ready
                </span>
                <p className="text-emerald-800 dark:text-emerald-400 mt-0.5">
                  100% of EXIF, camera, lens, and GPS coordinates have been stripped.
                </p>
              </div>
              <button
                onClick={handleDownloadSanitized}
                disabled={isProcessing || !sanitizedBlob}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
              >
                {isProcessing ? "Processing..." : "⬇ Download Sanitized Image"}
              </button>
            </div>
          </div>

          {/* Image Preview Card */}
          {previewUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">
                Visual Inspection Viewport
              </span>
              <div className="max-h-96 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="max-h-96 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
