import FileItem from "./FileItem";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { File, Folder } from "lucide-react";
import { DetailDialog } from "../dialog/DetailDialog";

export function FileGrid({ files, path, view, onRestore, onOpenFolder, onDelete, onShare, onDownload, onPreview, onRename, onDetail, isSearchActive, isSearching, searchResultCount, selectedItems, onToggleSelect, onToggleSelectAll, onDeleteSelected, onRestoreSelected }: any) {
  // If search is active
  if (isSearchActive) {
    // Show loading state
    if (isSearching) {
      return <p className="text-center text-muted-foreground py-10">Searching...</p>;
    }
    
    // Show empty state for search
    if (!files || files.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10">
          <p>No results found</p>
        </div>
      );
    }
  } else {
    // Normal view (not searching)
    if (!files || files.length === 0) {
      return <p className="text-center text-muted-foreground py-10">Empty</p>;
    }
  }

  if (view === "grid") {
    return (
      <div>
        {isSearchActive && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">Found {searchResultCount} result(s)</p>
          </div>
        )}
        
       
       
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((item: any) => {
            const itemId = item.id || item._id;
            return (
            <div
              key={itemId}
              className="relative"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                  onToggleSelect?.(itemId);
                }
              }}
            >
              {selectedItems && (
                <div className="absolute bottom-2 right-2 z-10">
                  <Checkbox
                    checked={selectedItems.has(itemId)}
                    onCheckedChange={() => onToggleSelect?.(itemId)}
                  />
                </div>
              )}
              <FileItem
                key={itemId}
                item={item}
                onOpenFolder={onOpenFolder}
                onDelete={onDelete}
                onShare={onShare}
                onDownload={onDownload}
                onPreview={onPreview}
                onRename={onRename}
                onDetail={onDetail}
                path={path}
                onRestore={onRestore}
                
              />
            </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      {isSearchActive && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">Found {searchResultCount} result(s)</p>
        </div>
      )}
      
      {/* Bulk Actions Toolbar */}
   
      
      <div className="divide-y border rounded-lg bg-white">
        {files.map((item: any) => {
          const itemId = item.id || item._id;
          return (
          <div
            key={itemId}
            className="flex items-center justify-between p-3 hover:bg-gray-50"
          >
            {/* LEFT SIDE - CHECKBOX + ICON + NAME */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {selectedItems && (
                <Checkbox
                  checked={selectedItems.has(itemId)}
                  onCheckedChange={() => onToggleSelect?.(itemId)}
                  className="flex-shrink-0"
                />
              )}
              <div className="flex-shrink-0">
                {item.type === "folder" ? (
                  <Folder className="h-5 w-5 text-blue-600" />
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <span className="text-sm truncate">{item.name || item.filename}</span>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3 ml-3 flex-shrink-0">
            
              {path !== "trash" && <button onClick={() => onRename && onRename(item)} className="text-xs text-gray-700 hover:underline">Đổi tên</button>}
              {path == "trash" && <button onClick={() => onRestore && onRestore(item)} className="text-xs text-gray-700 hover:underline">Phục hồi</button>}
               {path == "trash" && <button onClick={() => onDelete && onDelete(item)} className="text-xs text-gray-700 hover:underline">Xóa</button>}
               {path !== "trash" && <button onClick={() => onDelete && onDelete(item)} className="text-xs text-red-600 hover:underline">Xóa</button>}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
