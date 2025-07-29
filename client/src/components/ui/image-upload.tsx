import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export function ImageUpload({ onImageUpload, currentImageUrl, label = "Product Image" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [useUrl, setUseUrl] = useState(!!currentImageUrl);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token'
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const uploadedImageUrl = data.imageUrl;
      
      setImageUrl(uploadedImageUrl);
      onImageUpload(uploadedImageUrl);
      setUseUrl(false);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onImageUpload(url);
  };

  const removeImage = () => {
    setImageUrl('');
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Toggle between URL and Upload */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => setUseUrl(true)}
        >
          Use URL
        </Button>
        <Button
          type="button"
          variant={!useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => setUseUrl(false)}
        >
          Upload Image
        </Button>
      </div>

      {useUrl ? (
        /* URL Input */
        <div>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </div>
      ) : (
        /* Drag & Drop Upload */
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-wine bg-soft-pink' : 'border-gray-300 hover:border-wine'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-wine">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Drag & drop an image here, or click to select</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative">
          <div className="border rounded-lg p-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-1 right-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}