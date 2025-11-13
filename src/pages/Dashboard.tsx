import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient, FileItem } from "@/lib/api";
import { 
  Cloud, 
  Upload, 
  FolderPlus, 
  LogOut, 
  File, 
  Folder,
  MoreVertical,
  Share2,
  Trash2,
  Download,
  Archive,
  ArrowLeft,
  Home
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    loadFiles();
  }, [currentFolderId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getFileTree(currentFolderId);
      setFiles(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: error instanceof Error ? error.message : "Failed to load files",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    navigate("/login");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await apiClient.uploadFile(selectedFile, currentFolderId);
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      setIsUploadOpen(false);
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      await apiClient.createFolder(folderName, currentFolderId);
      toast({
        title: "Folder created",
        description: "Your folder has been created successfully.",
      });
      setIsFolderOpen(false);
      setFolderName("");
      loadFiles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create folder",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleDelete = async (fileId?: string, folderId?: string) => {
    try {
      await apiClient.deleteItem(fileId, folderId);
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully.",
      });
      loadFiles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete item",
      });
    }
  };

  const handleDownload = async (item: FileItem) => {
    try {
      if (item.type === "folder") {
        await apiClient.downloadFolderAsZip(item.id, item.name);
        toast({
          title: "Download started",
          description: "Folder is being downloaded as ZIP.",
        });
      } else {
        await apiClient.downloadFile(item.id, item.name);
        toast({
          title: "Download started",
          description: "File is being downloaded.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">DataStore Cloud</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        {currentFolderId && (
          <div className="mb-4 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentFolderId(undefined)}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Root
            </Button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {currentFolderId ? "Folder Contents" : "My Files"}
          </h2>
          <div className="flex gap-2">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleUpload} disabled={!selectedFile} className="w-full">
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter folder name"
                    />
                  </div>
                  <Button onClick={handleCreateFolder} disabled={!folderName.trim()} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Files Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground">Upload your first file or create a folder to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((item) => (
              <div
                key={item.id}
                className="group relative border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-card"
                onClick={() => item.type === "folder" && setCurrentFolderId(item.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {item.type === "folder" ? (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                      >
                        {item.type === "folder" ? (
                          <>
                            <Archive className="h-4 w-4 mr-2" />
                            Download as ZIP
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(
                            item.type === "file" ? item.id : undefined,
                            item.type === "folder" ? item.id : undefined
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <h3 className="font-medium truncate mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.type === "file" ? formatFileSize(item.size) : "Folder"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
