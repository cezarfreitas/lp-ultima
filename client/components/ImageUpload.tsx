import { useState, useRef } from "react";

interface ImageUploadProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string) => void;
  placeholder?: string;
  previewHeight?: string;
}

export default function ImageUpload({ 
  label, 
  currentUrl = '', 
  onUrlChange, 
  placeholder = "https://exemplo.com/imagem.jpg",
  previewHeight = "h-48"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onUrlChange(data.url);
      } else {
        setUploadError(data.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* URL Input */}
      <input
        type="text"
        value={currentUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
        placeholder={placeholder}
      />

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            ou faça upload de um arquivo
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Fazendo upload...' : 'Escolher Arquivo'}
          </button>
          
          <div className="text-xs text-gray-500">
            PNG, JPG até 5MB
          </div>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-2 text-red-600 text-sm">
          {uploadError}
        </div>
      )}

      {/* Preview */}
      {currentUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className={`relative ${previewHeight} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center`}>
            <img
              src={currentUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
