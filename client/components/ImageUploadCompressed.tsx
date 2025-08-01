import { useState, useRef } from "react";

interface ImageUploadCompressedProps {
  label?: string;
  currentUrl?: string;
  onUrlChange?: (url: string) => void;
  onUpload?: (formats: ImageFormats) => void;
  placeholder?: string;
  previewHeight?: string;
  preferredFormat?: "thumbnail" | "small" | "medium" | "large";
}

interface ImageFormats {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
}

export default function ImageUploadCompressed({
  label = "Imagem",
  currentUrl = "",
  onUrlChange,
  onUpload,
  placeholder = "https://exemplo.com/imagem.jpg",
  previewHeight = "h-48",
  preferredFormat = "medium",
}: ImageUploadCompressedProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setCompressionInfo("Comprimindo e enviando...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-multi", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update URL for backwards compatibility
        if (onUrlChange) {
          onUrlChange(data.url);
        }

        // Create formats object for onUpload callback if provided
        if (onUpload) {
          const formats: ImageFormats = {
            thumbnail: data.url,
            small: data.url,
            medium: data.url,
            large: data.url,
          };
          onUpload(formats);
        }

        // Update compression info
        setCompressionInfo("Upload realizado com sucesso!");
      } else {
        setUploadError(data.error || "Erro no upload");
        setCompressionInfo("");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Erro ao fazer upload do arquivo");
      setCompressionInfo("");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* URL Input */}
      {onUrlChange && (
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
          placeholder={placeholder}
        />
      )}

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            ou faça upload de um arquivo
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Comprimindo e enviando..." : "Escolher Arquivo"}
          </button>

          <div className="text-xs text-gray-500">
            PNG, JPG até 5MB • Compressão automática
          </div>

          {/* Compression info */}
          {compressionInfo && (
            <div className="text-xs text-green-600 font-medium">
              {compressionInfo}
            </div>
          )}
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="mt-2 text-red-600 text-sm">{uploadError}</div>
      )}

      {/* Preview */}
      {currentUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            className={`relative ${previewHeight} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center`}
          >
            <img
              src={currentUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
