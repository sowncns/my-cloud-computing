import { useState } from "react";
import { Upload, FolderPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload?: (files: File[]) => void;
  onCreateFolder?: (folderName: string) => void;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onFileUpload,
  onCreateFolder,
}: FileUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "upload" | "folder">("menu");
  const [folderName, setFolderName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
      setActiveTab("upload");
    }
  };

  const handleUpload = () => {
    if (uploadedFiles.length === 0) return;
    const doUpload = async () => {
      try {
        if (!onFileUpload) return;
        setUploading(true);
        // Allow handler to be async and await it
        await onFileUpload(uploadedFiles);
        setUploadedFiles([]);
        onOpenChange(false);
      } catch (err) {
        // swallow here; caller should show toast
      } finally {
        setUploading(false);
      }
    };

    doUpload();
  };

  const handleCreateFolder = () => {
    if (folderName.trim() && onCreateFolder) {
      onCreateFolder(folderName);
      setFolderName("");
      onOpenChange(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "menu" && "Tạo mới"}
            {activeTab === "upload" && "Tải file lên"}
            {activeTab === "folder" && "Tạo thư mục"}
          </DialogTitle>
        </DialogHeader>

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("folder")}
              className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <FolderPlus size={20} className="text-blue-600" />
              <div>
                <p className="font-medium">Tạo folder</p>
                <p className="text-sm text-gray-600">Tạo một thư mục mới</p>
              </div>
            </button>

            <button
              onClick={() => document.getElementById("file-input")?.click()}
              className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <Upload size={20} className="text-green-600" />
              <div>
                <p className="font-medium">Tải file lên</p>
                <p className="text-sm text-gray-600">Chọn file từ máy tính</p>
              </div>
            </button>

            <button
              onClick={() => document.getElementById("folder-input")?.click()}
              className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
            >
              <Upload size={20} className="text-purple-600" />
              <div>
                <p className="font-medium">Tải thư mục lên</p>
                <p className="text-sm text-gray-600">Chọn thư mục từ máy tính</p>
              </div>
            </button>

            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              id="folder-input"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              {...{ webkitdirectory: "true", directory: "true" } as any}
            />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">File được chọn:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab("menu")}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button onClick={handleUpload} className="flex-1 bg-blue-600" disabled={uploading}>
                {uploading ? "Đang tải..." : "Tải lên"}
              </Button>
            </div>
          </div>
        )}

        {/* Create Folder Tab */}
        {activeTab === "folder" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên thư mục
              </label>
              <Input
                placeholder="Nhập tên thư mục"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab("menu")}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
                className="flex-1 bg-blue-600"
              >
                Tạo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
