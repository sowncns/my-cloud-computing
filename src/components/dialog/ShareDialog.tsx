import { useState } from "react";
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
import { Copy, Check } from "lucide-react";

interface ShareDialogProps {
  item: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ item, open, onOpenChange }: ShareDialogProps) {
  const [mode, setMode] = useState<"private" | "shared" | "public">("shared");
  const [access, setAccess] = useState<"view" | "edit">("view");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!item) return;

    setLoading(true);
    try {
      const itemId = item.id || (item as any)._id;
      if (!itemId) {
        throw new Error("Item ID is missing");
      }

      const response: any = item.type === "file"
        ? await apiClient.shareFile(itemId, mode, access)
        : await apiClient.shareFolder(itemId, mode, access);

      // Backend should return a URL in the response
      const url = response?.url || response?.shareUrl || response?.link || "";
      if (url) {
        setShareUrl(url);
        toast({
          title: "Success",
          description: "Item shared successfully!",
        });
      } else {
        toast({
          title: "Shared",
          description: "Item shared, but no URL was returned.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Link copied to clipboard" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{item?.name}"</DialogTitle>
          <DialogDescription>
            Share this {item?.type} with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div>
            <Label htmlFor="mode">Share Mode</Label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* Access Level */}
          <div>
            <Label htmlFor="access">Access Level</Label>
            <select
              id="access"
              value={access}
              onChange={(e) => setAccess(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          {/* Share URL Display */}
          {shareUrl && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <Label className="text-sm font-semibold">Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={loading || (mode === "private" && !shareUrl)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sharing..." : shareUrl ? "Update Share" : "Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
