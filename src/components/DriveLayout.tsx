import { useState } from "react";
import DriveHeader from "./header/DriveHeader";
import Sidebar from "./sidebar/Sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

export default function DriveLayout({ children, onCreateFolder, onFileUpload, onSearch, breadcrumbs, onNavigateBreadcrumb, currentFolderId, paths }) {
  const [view, setView] = useState("grid");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex flex-col flex-1">
        <DriveHeader 
          view={view} 
          onChangeView={setView}
          onFileUpload={onFileUpload}
          onCreateFolder={onCreateFolder}
          onSearch={onSearch}
          currentFolderId={currentFolderId}
        />

        {/* BREADCRUMB - Show in both dashboard and trash when navigating into folders */}
        {breadcrumbs && breadcrumbs.length > 1 && (paths !== "trash" || currentFolderId) && (
          <div className="px-6 pt-4 pb-2">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigateBreadcrumb && onNavigateBreadcrumb(index);
                        }}
                        className={index === breadcrumbs.length - 1 ? "text-foreground font-semibold" : ""}
                      >
                        {crumb.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {children(view)}
        </div>
      </div>
    </div>
  );
}