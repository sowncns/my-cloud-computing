
import { useState } from "react";
import { Search, Grid, List, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUploadDialog } from "../dialog/FileUploadDialog";
import { ProfileMenu } from "./ProfileMenu";

export default function DriveHeader({ view, onChangeView, onCreateFolder, onFileUpload, onSearch, currentFolderId }) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const handleFileUpload = (files: File[]) => {
    if (onFileUpload) {
      onFileUpload(files);
    }
    setShowUploadDialog(false);
  };

  const handleCreateFolder = (folderName: string) => {
    if (onCreateFolder) {
      onCreateFolder(folderName, currentFolderId);
    }
    setShowUploadDialog(false);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  

  return (
    <div className="h-16 border-b flex items-center px-6 bg-white justify-between">
      <div className="flex items-center flex-1 max-w-2xl mx-6">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full gap-2 hover:shadow">
          <Search className="text-gray-600" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm trong Drive"
            className="bg-transparent outline-none w-full text-sm"
            onChange={(e) => handleSearch(e.target.value)}
            value={searchValue}
          />
        </div>
      </div>

      <div className="flex gap-3 align-items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={() => setShowUploadDialog(true)} className="px-3 py-1 rounded-md bg-white border text-sm flex items-center gap-2 hover:shadow hover:bg-gray-50 transition-colors">
              <PlusCircle size={16} />
              Mới
            </button>
          </DropdownMenuTrigger>
          
        </DropdownMenu>

        <div className="p-1 rounded-md hover:bg-gray-100 cursor-pointer border">
          <button
            aria-label="grid view"
            onClick={() => onChangeView("grid")}
            className={`p-2 rounded border hover:bg-gray-100 ${
              view === "grid" ? "bg-blue-50 text-blue-600 border-blue-300" : ""
            }`}
          >
            <Grid size={18} />
          </button>
        </div>

        <div className="p-1 rounded-md hover:bg-gray-100 cursor-pointer border">
          <button
            aria-label="list view"
            onClick={() => onChangeView("list")}
            className={`p-2 rounded border hover:bg-gray-100 ${
              view === "list" ? "bg-blue-50 text-blue-600 border-blue-300" : ""
            }`}
          >
            <List size={18} />
          </button>
        </div>

        <ProfileMenu />
      </div>

      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onFileUpload={handleFileUpload}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
}    
