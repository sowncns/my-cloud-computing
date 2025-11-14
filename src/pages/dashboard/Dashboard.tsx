import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, FileItem } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

import { HeaderBar } from "../dashboard/HeaderBar";
import { QuotaCard } from "../dashboard/QuotaCard";
import { Breadcrumb } from "../dashboard/BreadCrumb";
import { FileGrid } from "../dashboard/FileGrid";
import { ShareDialog } from "../dashboard/ShareDialog";
import UploadDialog from "../dashboard/UploadDialog";
import CreateFolderDialog from "../dashboard/CreateFolderDialog";
import PreviewDialog from "../dashboard/PreviewDialog";
import UpgradeDialog from "../dashboard/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import { get } from "http";
import ChangePasswordDialog from "./changePasswordDialog";
const Dashboard = () => {
    const navigate = useNavigate();
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [path, setPath] = useState([{ id: undefined, name: "Root" }]);
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
    const [files, setFiles] = useState<any[]>([]);
    const [usedStorage, setUsedStorage] = useState(0);
    const [totalStorage, setTotalStorage] = useState(0);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareItem, setShareItem] = useState<any>(null);
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");
        if (!token) navigate("/login");

        loadFiles();
        loadQuota();

    }, [currentFolderId]);

    const loadFiles = async () => {
        try {
            const data = await apiClient.getFileTree(currentFolderId);
            setFiles(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load files",
                variant: "destructive",
            });
        }
    };

    const loadQuota = async () => {
        try {
            const user = await apiClient.getUserInfo();
            setUsedStorage(user.storageUsed);
            setTotalStorage(user.storageLimit);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load quota",
                variant: "destructive",
            });
        }
    };

    const openFolder = (folder: any) => {
        setCurrentFolderId(folder.id);
        setPath([...path, { id: folder.id, name: folder.name }]);
    };

    const goBreadcrumb = (id: string | undefined, idx: number) => {
        setCurrentFolderId(id);
        setPath(path.slice(0, idx + 1));
    };

    const handleLogout = async () => {
        await apiClient.logout();
        navigate("/login");
    };

    return (

        <div className="min-h-screen bg-background flex flex-col">
            <HeaderBar onLogout={handleLogout} user={user} onChangePassword={() => setPasswordOpen(true)} />
            {/* Fixed Header with Controls */}
          
            <div className="bg-background  z-40 fixed top-16 left-0 right-0">
                <div className="container mx-auto ">
                    <QuotaCard used={usedStorage} total={totalStorage} />

                    <div className="flex gap-2 mb-2 justify-end">
                        <Button onClick={() => setUpgradeOpen(true)} variant="default" style={{ backgroundColor: "red" }}>
                            Upgrade Storage
                        </Button>
                        <UploadDialog
                            onUpload={async (file: File) => {
                                try {
                                    await apiClient.uploadFile(file, currentFolderId);
                                    loadFiles();
                                    loadQuota();
                                    toast({
                                        title: "Success",
                                        description: "File uploaded successfully"
                                    });
                                } catch (error: any) {
                                    toast({
                                        title: "Upload Failed",
                                        description: error.message || "Failed to upload file",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        />

                        <CreateFolderDialog
                            onCreate={async (name: string) => {
                                try {
                                    await apiClient.createFolder(name, currentFolderId);
                                    loadFiles();
                                    toast({
                                        title: "Success",
                                        description: "Folder created successfully"
                                    });
                                } catch (error: any) {
                                    toast({
                                        title: "Creation Failed",
                                        description: error.message || "Failed to create folder",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto mt-[250px]">
                <div className="container mx-auto px-4 py-6">
                    <Breadcrumb path={path} onNavigate={goBreadcrumb} />

                    <FileGrid
                        files={files}
                        onOpenFolder={openFolder}
                        onDelete={async (id: string) => {
                            try {
                                setPreviewFile(null)
                                await apiClient.deleteItem(id);
                                loadFiles();
                                loadQuota();
                                toast({
                                    title: "Success",
                                    description: "Item deleted successfully"
                                });
                            } catch (error: any) {
                                toast({
                                    title: "Delete Failed",
                                    description: error.message || "Failed to delete item",
                                    variant: "destructive",
                                });
                            }
                        }}
                        onShare={(item: any) => {
                            setShareItem(item);
                            setShareLink(`${window.location.origin}/share/${item.id}`);
                            setShareOpen(true);
                        }}
                        onDownload={() => { }}
                        onPreview={(item: FileItem) => setPreviewFile(item)}
                        onRename={async (item: any) => {
                            const newName = prompt("Enter new name", item.name);
                            if (!newName) return;
                            try {
                                await apiClient.renameItem(item.id, newName);
                                loadFiles();
                                toast({
                                    title: "Success",
                                    description: "Item renamed successfully"
                                });
                            } catch (error: any) {
                                toast({
                                    title: "Rename Failed",
                                    description: error.message || "Failed to rename itemmmmm",
                                    variant: "destructive",
                                });
                            }
                        }}
                        onDetail={(item: any) => {
                            console.log("Detail item:", item);

                        }}
                    />
                </div>
            </main>

            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                item={shareItem}
                link={shareLink}
                copyLink={() => navigator.clipboard.writeText(shareLink)}
            />
            <PreviewDialog
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
            <UpgradeDialog
                open={upgradeOpen}
                onOpenChange={setUpgradeOpen}
                onSelectPlan={async (amount, upStore) => {
                    try {
                        const res = await apiClient.createPayment(amount, upStore);
                        console.log("Payment URL:", res.payUrl);
                        window.location.href = res.payUrl;

                    } catch (err) {
                        toast({
                            title: "Error",
                            description: "Failed to create payment",
                            variant: "destructive",
                        });
                    }
                }}

            />
              <ChangePasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
            />


        </div>
    );
};

export default Dashboard;
