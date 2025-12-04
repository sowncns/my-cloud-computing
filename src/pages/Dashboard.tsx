import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, FileItem } from "@/lib/api";
import DriveLayout from "../components/DriveLayout";
import { toast } from "@/hooks/use-toast";
import { FileGrid } from "../components/drive/FileGrid";
import { set } from "date-fns";
import { on } from "events";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export default function Dashboard({ paths }: { paths: string }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "My Drive" }]);
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [trashItems, setTrashItems] = useState<FileItem[]>([]);
  const [temporary, setTemporary] = useState<FileItem[]>([]);
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) navigate("/login");

    // Reset navigation state for trash view
    if (paths === "trash") {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: null, name: "Thùng rác" }]);
    } else {
      setCurrentFolderId(null);
      setBreadcrumbs([{ id: null, name: "My Drive" }]);
    }

    loadFiles();
    trashLoadFiles();
    refreshQuota();
  }, [paths]);

  useEffect(() => {
    // Reload files when currentFolderId changes
    loadFiles();
  }, [currentFolderId]);

  const loadFiles = async () => {
    try {
      const data = await apiClient.getFileTree();
      setFiles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load files",
        variant: "destructive",
      });
    }
  };

  const refreshQuota = async () => {
    try {
      const info: any = await apiClient.getUserInfo();
      const storageUsed = info.storageUsed ?? info.storage?.used ?? 0;
      const storageLimit = info.storageLimit ?? info.storage?.total ?? (15 * 1024 * 1024 * 1024);
      setQuota({ used: storageUsed, total: storageLimit });
      // notify other components (ProfileMenu) to update
      try {
        window.dispatchEvent(new CustomEvent("quotaUpdated", { detail: { storageUsed, storageLimit, plan: info.plan } }));
      } catch (e) {
        // ignore
      }
    } catch (err) {
      // ignore
    }
  };

  const handleCreateFolder = async (folderName: string, parentFolderId?: string) => {
    try {
      await apiClient.createFolder(folderName, parentFolderId || undefined);

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      loadFiles();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        await apiClient.uploadFiles(file, currentFolderId || undefined);
      }

      toast({
        title: "Success",
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

      loadFiles();
      // refresh quota after upload
      refreshQuota();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (item: any) => {
    try {
      console.log("[onDelete] item object:", item);
      console.log("[onDelete] paths:", paths);
      
      if (paths !== "trash") {
        const itemId = item.id || item._id;
        console.log("[onDelete] Moving to trash with id:", itemId);
        await apiClient.deleteItem(itemId);
        
        toast({
          title: "Success",
          description: "Item moved to trash",
        });
        loadFiles();
      } else {
        const itemId = item._id || item.id;
        console.log("[onDelete] Permanently deleting with id:", itemId);
        
        if (!itemId) {
          throw new Error("Item ID is missing (both _id and id are undefined)");
        }
        console.log("[onDelete] Confirmed itemId for permanent deletionjjjj:", itemId);
        await apiClient.permanentlyDeleteItem(itemId);
        
        toast({
          title: "Success",
          description: "Item permanently deleted",
        });
        
        trashLoadFiles();
        // refresh quota after permanent delete
        refreshQuota();
      }
    } catch (error: any) {
      console.error("[onDelete] Error:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const trashLoadFiles = async () => {
    try {
      const res = await apiClient.getTrashItems();

      setTrashItems(res);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load files",
        variant: "destructive",
      });
    }
  };

  const onRename = async (item: any) => {
    const newName = prompt("Enter new name", item.name);
     console.log(item)

    if (!newName) return;
    try {
      await apiClient.renameItem(item.id, newName);
      toast({
        title: "Success",
        description: "Item renamed successfully",
      });
       loadFiles();
    } catch (error: any) {
      toast({
        title: "Rename Failed",
        description: error.message || "Failed to rename itemmmmm",
        variant: "destructive",
      });
    }
  };
  const onRestore = async(item:any)=>{
    try {
  
      await apiClient.restoreItem(item.id || item._id); 
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
       trashLoadFiles();
    } catch (error: any) {
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore item",

        variant: "destructive",
      });
    }
  }

  const handleSearch = async (keyword: string) => {
    setSearchQuery(keyword);
    
    if (!keyword.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await apiClient.searchFilesByKeyword(keyword);
      setSearchResults(res || []);
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search files",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
    if(keyword.startsWith("@"))
    {
      const userview = keyword.slice(1);
      const res = await apiClient.searchFilesByUser(userview);
      setSearchResults(res || []);
    }
  };

  const onOpenFolder = (folder: FileItem) => {
    const folderId = folder.id;
    setCurrentFolderId(folderId);
    // Add to breadcrumb trail
    setBreadcrumbs([...breadcrumbs, { id: folderId, name: folder.name }]);
    // Clear search when navigating into folder
    setSearchQuery("");
    setSearchResults([]);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === 0) {
      // Navigate to root
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(breadcrumbs[index].id);
    }
    // Trim breadcrumbs to the clicked level
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };
  
  return (
    <DriveLayout
      onCreateFolder={handleCreateFolder}
      onFileUpload={handleFileUpload}
      onSearch={handleSearch}
      breadcrumbs={breadcrumbs}
      onNavigateBreadcrumb={navigateToBreadcrumb}
      currentFolderId={currentFolderId}
      paths={paths}
    >
      {(view) => (
        <FileGrid
          files={searchQuery.trim() ? searchResults : (paths==="trash"?trashItems:files)}
          view={view}
          onDelete={onDelete}
          onRename={onRename}
          isLoading={isUploading || isSearching}
          path ={paths}
          onRestore={onRestore}
          isSearchActive={searchQuery.trim() ? true : false}
          isSearching={isSearching}
          searchResultCount={searchResults.length}
          onOpenFolder={onOpenFolder}
        />
      )}
    </DriveLayout>
  );
}