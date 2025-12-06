import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, FileItem } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { File, Folder, Calendar, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";

interface DetailDialogProps {
    item: FileItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DetailDialog({ item, open, onOpenChange }: DetailDialogProps) {
    const [mode, setMode] = useState<"private" | "shared" | "public">("private");
    const [access, setAccess] = useState<"view" | "edit">("view");
    const [emails, setEmails] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!item) return;
        // initialize from item if available
        const m: any = (item as any).mode || ((item as any).shared ? "shared" : "private");
        setMode(m);
        setAccess(((item as any).access as any) || "view");
    }, [item]);

    if (!item) return null;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return "0 B";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };


    const handleSubmit = async () => {
        if (!item) return;
        setLoading(true);

        await apiClient.setAccess(
            item.id || (item as any)._id,
            mode,
            emails.split(",").map((e) => e.trim()).filter((e) => e)
        );
        toast({
            title: "Success",
            description: "Access settings updated successfully!",
        });
        onOpenChange(false);

    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[430px] sm:w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {item.type === "folder" ? (
                            <Folder className="h-5 w-5 text-blue-600" />
                        ) : (
                            <File className="h-5 w-5 text-gray-500" />
                        )}
                        {item.name}
                    </DialogTitle>
                    <DialogDescription>
                        {item.type === "file" ? "File details" : "Folder details"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Controls: visibility / access / emails */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Visibility</div>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                            className="max-w-lg w-auto px-3 py-2 border rounded-md text-sm"
                        >
                            <option value="private">Private</option>
                            <option value="shared">Shared</option>
                            <option value="public">Public</option>
                        </select>
                        {/* 
                        <div className="mt-2">
                            <div className="text-sm font-medium text-muted-foreground">Access</div>
                            <select id="access" value={access} onChange={(e) => setAccess(e.target.value as any)} className="max-w-lg w-auto px-3 py-2 border rounded-md text-sm">
                                <option value="view">View</option>
                                <option value="edit">Edit</option>
                            </select>
                        </div> */}

                        {mode === "shared" && (
                            <div className="mt-2">
                                <div className="text-sm font-medium text-muted-foreground">Invite by email (comma separated)</div>
                                <Input id="emails" value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="user1@example.com, user2@example.com" />
                            </div>
                        )}


                    </div>

                    {/* Type */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium text-muted-foreground">Type</div>
                        <div className="text-sm font-semibold capitalize">{item.type}</div>
                    </div>

                    {/* Size (for files) */}
                    {item.type === "file" && item.size !== undefined && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <HardDrive className="h-4 w-4" />
                                Size
                            </div>
                            <div className="text-sm font-semibold">{formatSize(item.size)}</div>
                        </div>
                    )}

                    {/* Created At */}
                    {item.createdAt && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Created
                            </div>
                            <div className="text-sm font-semibold">{formatDate(item.createdAt)}</div>
                        </div>
                    )}

                    {/* Updated At */}
                    {item.updatedAt && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Modified
                            </div>
                            <div className="text-sm font-semibold">{formatDate(item.updatedAt)}</div>
                        </div>
                    )}

                    {/* Parent ID */}
                    {item.parentId && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium text-muted-foreground">Parent ID</div>
                            <div className="text-xs font-mono text-muted-foreground truncate">{item.parentId}</div>
                        </div>
                    )}

                    {/* ID */}


                    {/* S3 URL (for files) */}

                </div>
                <Button
                    onClick={handleSubmit}
                  
                    className="bg-green-600 hover:bg-green-700"
                >
                   OK
                </Button>
            </DialogContent>

        </Dialog>
    );
}
