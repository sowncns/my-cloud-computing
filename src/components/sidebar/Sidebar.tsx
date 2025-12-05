
import SidebarItem from "./SidebarItem";
import { Link } from "react-router-dom";
export default function Sidebar() {

  return (
    <div className="w-64 bg-white border-r p-4">
      <div className="flex flex-col gap-1">
         <Link to="/dashboard">
        <div className="flex items-center gap-3 mr-6">
         
          <div className="h-9 w-9 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold">G</div>
          <div className="text-sm font-semibold">Drive của tôi</div>
        
        </div>
          </Link>
        <SidebarItem href="/dashboard" label="Trang chủ"  />
        <SidebarItem href="/shared" label="Được chia sẻ" />
        <SidebarItem href="/trash" label="Thùng rác" />
      </div>
    </div>
  );
}
