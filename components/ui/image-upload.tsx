"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  className?: string;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  label = "Subir imagen",
  accept = "image/*",
  maxSize = 5,
  className = "",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);

    // Verificar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return false;
    }

    // Verificar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo debe ser menor a ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Llamar callback
    onImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageRemove?.();
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </Label>

      <Card className={`border-2 border-dashed transition-colors ${
        dragActive 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-300 hover:border-gray-400"
      }`}>
        <CardContent className="p-6">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          {preview ? (
            <div className="relative">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={90}
                  priority
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center space-y-4 py-8"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full bg-gray-100">
                  <ImageIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Arrastra y suelta tu imagen aquí, o{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                      onClick={onButtonClick}
                    >
                      haz clic para seleccionar
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF hasta {maxSize}MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onButtonClick}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Seleccionar archivo</span>
              </Button>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
