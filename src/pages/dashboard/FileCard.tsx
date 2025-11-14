import { File, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { on } from "events";

export const FileCard = ({
  item,
  onOpenFolder,
  onDelete,
  onShare,
  onDownload,
  onPreview,
  onRename,
  onDetail,
}: any) => {
  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
      onClick={() => (item.type === "folder" ? onOpenFolder(item) : onPreview?.(item))}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          {item.type === "folder" ? (
            <Folder className="h-6 w-6 text-primary" />
          ) : (
            <File className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(item); }}>Share</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(item); }}>Download</DropdownMenuItem>
             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(item); }}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDetail(item); }}>Detail</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-medium truncate">{item.name}</h3>
      <p className="text-sm text-muted-foreground">
        {item.type === "file" ? `${(item.size / 1024).toFixed(1)}KB` : "Folder"}
      </p>
    </div>
  );
};
