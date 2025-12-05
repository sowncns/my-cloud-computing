import { File, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { on } from "events";

export default function FileItem({
  item,
  onOpenFolder,
  onDelete,
  onShare,
  onDownload,
  onPreview,
  onRename,
  onDetail,
  path,
  onRestore,
  
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
          onClick={() => {
            // Allow opening folders in both dashboard and trash
            if (item.type === "folder") {
              onOpenFolder?.(item);
            } else if (path !== "trash") {
              // Only preview files in dashboard, not in trash
              onPreview?.(item);
            }
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-shrink-0">
              {item.type === "folder" ? (
                <Folder className="h-6 w-6 text-blue-600" />
              ) : (() => {
                const url: string | undefined = (item as any).s3Url;
                const isImage = url && /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(url);
                
                return <File className="h-6 w-6 text-gray-500" />;
              })()}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>

              {
                path !== "trash" ? (<DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(item); }}>Share</DropdownMenuItem>
                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(item); }}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDetail(item); }}>Detail</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item); }}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>):(<DropdownMenuContent>
  
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRestore &&onRestore(item); }}>Restore</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item); }}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>)
              }
            </DropdownMenu>
          </div>

          <h3 className="font-medium truncate">{item.name || item.filename}</h3>
          <p className="text-sm text-muted-foreground">
            {item.type === "file" ? `${(item.size / 1024).toFixed(1)}KB` : "Folder"}
          </p>
        </div>
      </HoverCardTrigger>

      <HoverCardContent>
        {item.type === "file" ? (
          item.s3Url ? (
            // If it's an image, show image preview; otherwise show link and metadata
            (/(?:jpg|jpeg|png|gif|webp|bmp)$/i).test(item.s3Url) ? (
              <img src={item.s3Url} alt={item.name} className="w-full h-40 object-contain rounded" />
            ) : (
              <div>
                <p className="font-semibold truncate">{item.name || item.filename}</p>
                <a href={item.s3Url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Open file</a>
                <p className="text-xs text-muted-foreground mt-2">{item.size ? `${(item.size / 1024).toFixed(1)}KB` : ""}</p>
              </div>
            )
          ) : (
            <div>
              <p className="font-semibold truncate">{item.name || item.filename}</p>
              <p className="text-xs text-muted-foreground mt-2">{item.size ? `${(item.size / 1024).toFixed(1)}KB` : ""}</p>
            </div>
          )
        ) : (
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-2">Folder</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
