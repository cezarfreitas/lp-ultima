import { useState } from "react";
import MultiImageUpload from "./MultiImageUpload";
import ImageUploadCompressed from "./ImageUploadCompressed";

interface UploadedImage {
  id: string;
  formats: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  };
  file: File;
  originalSize: number;
  totalOptimizedSize: number;
  savingsPercent: number;
  progress: number;
}

interface ImageFormats {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
}

export default function TestMultiUpload() {
  const [multiImages, setMultiImages] = useState<UploadedImage[]>([]);
  const [singleImage, setSingleImage] = useState<ImageFormats | null>(null);
  const [singleImageUrl, setSingleImageUrl] = useState("");

  const handleMultiUpload = (images: UploadedImage[]) => {
    setMultiImages(images);
    console.log("Múltiplas imagens uploaded:", images);
  };

  const handleSingleUpload = (formats: ImageFormats) => {
    setSingleImage(formats);
    console.log("Imagem única uploaded:", formats);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teste de Upload Multi-Formato
        </h1>
        <p className="text-gray-600">
          Sistema que gera automaticamente 4 formatos: thumbnail (150x150), small (400x400), medium (800x800), large (1200x1200)
        </p>
      </div>

      {/* Multi Image Upload Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Múltiplo de Imagens</h2>
        <MultiImageUpload 
          onImagesUploaded={handleMultiUpload}
          maxFiles={5}
          preferredFormat="medium"
        />
        
        {multiImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Imagens Processadas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {multiImages.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {image.file.name}
                  </div>
                  
                  {/* Format Previews */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <img 
                        src={image.formats.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full h-16 object-cover rounded"
                      />
                      <div className="text-xs text-gray-500">Thumb</div>
                    </div>
                    <div className="text-center">
                      <img 
                        src={image.formats.small} 
                        alt="Small" 
                        className="w-full h-16 object-cover rounded"
                      />
                      <div className="text-xs text-gray-500">Small</div>
                    </div>
                    <div className="text-center">
                      <img 
                        src={image.formats.medium} 
                        alt="Medium" 
                        className="w-full h-16 object-cover rounded"
                      />
                      <div className="text-xs text-gray-500">Medium</div>
                    </div>
                    <div className="text-center">
                      <img 
                        src={image.formats.large} 
                        alt="Large" 
                        className="w-full h-16 object-cover rounded"
                      />
                      <div className="text-xs text-gray-500">Large</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Original: {formatBytes(image.originalSize)}</div>
                    <div>Total otimizado: {formatBytes(image.totalOptimizedSize)}</div>
                    <div className="text-green-600 font-medium">
                      Economia: {image.savingsPercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single Image Upload Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload de Imagem Única</h2>
        <ImageUploadCompressed
          label="Teste de Imagem Única"
          currentUrl={singleImageUrl}
          onUrlChange={setSingleImageUrl}
          onUpload={handleSingleUpload}
          preferredFormat="medium"
        />
        
        {singleImage && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Formatos Gerados:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <img 
                  src={singleImage.thumbnail} 
                  alt="Thumbnail" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-600 mt-1">Thumbnail (150x150)</div>
              </div>
              <div className="text-center">
                <img 
                  src={singleImage.small} 
                  alt="Small" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-600 mt-1">Small (400x400)</div>
              </div>
              <div className="text-center">
                <img 
                  src={singleImage.medium} 
                  alt="Medium" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-600 mt-1">Medium (800x800)</div>
              </div>
              <div className="text-center">
                <img 
                  src={singleImage.large} 
                  alt="Large" 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="text-sm text-gray-600 mt-1">Large (1200x1200)</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">URLs dos Formatos:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div><span className="font-medium">Thumbnail:</span> {singleImage.thumbnail}</div>
                <div><span className="font-medium">Small:</span> {singleImage.small}</div>
                <div><span className="font-medium">Medium:</span> {singleImage.medium}</div>
                <div><span className="font-medium">Large:</span> {singleImage.large}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Teste de Migração</h2>
        <p className="text-gray-600 mb-4">
          Execute a migração do banco de dados para suportar múltiplos formatos:
        </p>
        <button
          onClick={async () => {
            try {
              const response = await fetch("/api/migrate-multi-format", {
                method: "POST",
              });
              const data = await response.json();
              alert(response.ok ? "Migração executada com sucesso!" : `Erro: ${data.error}`);
            } catch (error) {
              alert(`Erro na migração: ${error}`);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Executar Migração
        </button>
      </div>
    </div>
  );
}
