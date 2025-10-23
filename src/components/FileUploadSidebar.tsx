import { RefreshCw, FileSpreadsheet, Cloud, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DriveFile {
  id: string;
  name: string;
  size: string;
  lastModified: string;
}

export const FileUploadSidebar = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDriveFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/drive/files');
      if (!response.ok) {
        throw new Error('Falha ao carregar arquivos do Google Drive');
      }
      const driveFiles = await response.json();
      setFiles(driveFiles);
      toast.success(`${driveFiles.length} planilhas encontradas no Google Drive`);
    } catch (error) {
      console.error("Erro ao carregar arquivos do Drive:", error);
      toast.error("Falha ao carregar arquivos do Google Drive");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    window.open('https://forms.gle/rB7FdginAyWuYY3D7', '_blank');
  };

  useEffect(() => {
    loadDriveFiles();
  }, []);

  return (
    <div className="w-64 h-screen border-r border-border flex flex-col" style={{ backgroundColor: "hsl(var(--sidebar-bg))" }}>
      <div className="p-4 border-b border-border space-y-3">
        <Button 
          variant="default" 
          className="w-full" 
          onClick={handleUploadClick}
        >
          <Upload className="w-4 h-4 mr-2" />
          Enviar Arquivo
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={loadDriveFiles}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Cloud className="w-4 h-4 mr-2" />
          )}
          {loading ? "Carregando..." : "Atualizar Drive"}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Planilhas do Google Drive
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground mt-8">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30 animate-spin" />
            <p>Carregando planilhas...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-8">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma planilha encontrada no Google Drive</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="bg-card border border-border rounded-lg p-3 animate-slide-up hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.lastModified}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Cloud className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
