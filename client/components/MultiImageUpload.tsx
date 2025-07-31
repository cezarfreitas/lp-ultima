import { useState, useRef } from "react";

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  originalSize: number;
  compressedSize: number;
  progress: number;
}

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  maxWidth?: number;
  quality?: number;
}

export default function MultiImageUpload({
  onImagesUploaded,
  maxFiles = 10,
  maxWidth = 1200,
  quality = 0.8,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      setUploadError(`Máximo de ${maxFiles} imagens permitido`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageId = Date.now() + i;

      const newImage: UploadedImage = {
        id: imageId.toString(),
        url: "",
        file: file,
        originalSize: file.size,
        compressedSize: 0,
        progress: 0,
      };

      newImages.push(newImage);
    }

    setImages((prev) => [...prev, ...newImages]);

    // Process each image
    const uploadedUrls: string[] = [];

    for (let i = 0; i < newImages.length; i++) {
      const imageData = newImages[i];

      try {
        // Update progress to compression
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageData.id ? { ...img, progress: 25 } : img,
          ),
        );

        // Compress image
        const compressedFile = await compressImage(imageData.file);

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageData.id
              ? { ...img, compressedSize: compressedFile.size, progress: 50 }
              : img,
          ),
        );

        // Upload to server with multi-format processing
        const formData = new FormData();
        formData.append("file", compressedFile);

        const response = await fetch("/api/upload-multi", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageData.id
                ? { ...img, url: data.url, progress: 100 }
                : img,
            ),
          );
          uploadedUrls.push(data.url);
        } else {
          throw new Error(data.error || "Erro no upload");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setImages((prev) => prev.filter((img) => img.id !== imageData.id));
        setUploadError(`Erro ao fazer upload de ${imageData.file.name}`);
      }
    }

    onImagesUploaded(uploadedUrls);
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const clearAll = () => {
    setImages([]);
    setUploadError(null);
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + "KB";
  };

  const getCompressionPercentage = (original: number, compressed: number) => {
    if (compressed === 0) return 0;
    return (((original - compressed) / original) * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelection}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2">Adicione múltiplas imagens de uma vez</p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-indigo-500 text-white px-6 py-3 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? "Processando..." : "Selecionar Imagens"}
          </button>

          <div className="text-sm text-gray-500">
            PNG, JPG até 5MB cada • Máximo {maxFiles} imagens • Compressão
            automática
          </div>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {uploadError}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">
              Imagens Selecionadas ({images.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Limpar Tudo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative bg-white border border-gray-200 rounded-lg p-4"
              >
                {/* Image Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        <div className="text-sm text-gray-500">
                          {image.progress}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="font-medium truncate" title={image.file.name}>
                    {image.file.name}
                  </div>

                  {image.compressedSize > 0 && (
                    <div className="text-green-600">
                      {formatFileSize(image.originalSize)} →{" "}
                      {formatFileSize(image.compressedSize)}
                      <span className="ml-1">
                        (
                        {getCompressionPercentage(
                          image.originalSize,
                          image.compressedSize,
                        )}
                        % menor)
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {image.progress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${image.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
