import { Upload, X, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export const FileUploadSidebar = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const validExtensions = [".xlsx", ".csv", ".xls"];
    const uploadPromises: Promise<void>[] = [];

    Array.from(fileList).forEach((file) => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      
      if (validExtensions.includes(ext)) {
        const uploadPromise = (async () => {
          try {
            const filePath = `public/${Date.now()}-${file.name}`;
            
            const { data, error } = await supabase.storage
              .from('spreadsheets')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) throw error;

            const newFile: UploadedFile = {
              id: data.path,
              name: file.name,
              size: (file.size / 1024).toFixed(2) + " KB",
              uploadedAt: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setFiles((prev) => [...prev, newFile]);
          } catch (error) {
            console.error("Erro ao fazer upload:", error);
            toast.error(`Falha ao carregar ${file.name}`);
          }
        })();

        uploadPromises.push(uploadPromise);
      } else {
        toast.error(`Formato inválido: ${file.name}`);
      }
    });

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
      toast.success(`${uploadPromises.length} arquivo(s) carregado(s)`);
    }

    event.target.value = "";
  };

  const removeFile = async (id: string) => {
    try {
      const { error } = await supabase.storage
        .from('spreadsheets')
        .remove([id]);

      if (error) throw error;

      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success("Arquivo removido");
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      toast.error("Falha ao remover arquivo");
    }
  };

  return (
    <div className="w-64 h-screen border-r border-border flex flex-col" style={{ backgroundColor: "hsl(var(--sidebar-bg))" }}>
      <div className="p-4 border-b border-border">
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline" className="w-full" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Carregar Planilha
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.csv,.xls"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          .xlsx, .csv, .xls
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {files.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-8">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum arquivo carregado</p>
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
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
