import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, FileItem } from "@/lib/api";
import DriveLayout from "../components/DriveLayout";
import { toast } from "@/hooks/use-toast";
import { FileGrid } from "../components/drive/FileGrid";

export default function Shared() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: "Được chia sẻ" }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) navigate("/login");
    loadShared();
  }, [currentFolderId]);

  const loadShared = async () => {
    try {
      setIsLoading(true);
      // Get current user info to determine which items are shared with this account
      const me: any = await apiClient.getUserInfo().catch(() => ({}));
        console.log("Current user info:", me);
      // Load full file tree from API
      const tree: any[] = await apiClient.getFileTree().catch(() => []);

      const results: FileItem[] = [];

      const matchesShared = (node: any) => {
        // Several possible fields/backends: mode, shared, sharedWith, sharedTo, sharedWithEmails
        if (!node) return false;
        const userId = me?.id || me?._id || me?.userId || me?.email;

        if (node.mode === "shared") return true;
        if (node.shared === true) return true;
        if (Array.isArray(node.sharedWith) && userId && node.sharedWith.includes(userId)) return true;
        if (Array.isArray(node.sharedTo) && userId && node.sharedTo.includes(userId)) return true;
        if (Array.isArray(node.sharedWithEmails) && me?.email && node.sharedWithEmails.includes(me.email)) return true;
        // sometimes owner field differs: if owner !== me and node has permissions list, try to check
        if (node.sharedBy && node.sharedBy !== userId && (node.sharedBy === userId)) return true;
        return false;
      };

      const traverse = (nodes: any[]) => {
        if (!nodes) return;
        for (const n of nodes) {
          if (matchesShared(n)) {
            results.push(n);
          }
          if (n.children && n.children.length) traverse(n.children);
        }
      };

      traverse(tree || []);

      setFiles(results);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load shared items", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onOpenFolder = (folder: FileItem) => {
    const folderId = (folder as any).id || (folder as any)._id || null;
    setCurrentFolderId(folderId);
    setBreadcrumbs((b) => [...b, { id: folderId, name: folder.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === 0) {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(breadcrumbs[index].id);
    }
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <DriveLayout
      onCreateFolder={undefined}
      onFileUpload={undefined}
      onSearch={undefined}
      breadcrumbs={breadcrumbs}
      onNavigateBreadcrumb={navigateToBreadcrumb}
      currentFolderId={currentFolderId}
      paths="shared"
    >
      {(view) => (
        <FileGrid
          files={files}
          view={view}
          onOpenFolder={onOpenFolder}
          path="shared"
          isLoading={isLoading}
        />
      )}
      
    </DriveLayout>
  );
}
