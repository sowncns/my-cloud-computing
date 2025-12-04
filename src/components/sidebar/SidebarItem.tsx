import {Link} from "react-router-dom";
import { useState } from "react";
export default function SidebarItem({ href, label }) {
const [isActive, setIsActive] = useState(false);
  return (
    <Link 
    className={isActive ? "bg-blue-50 text-blue-600 hover:text-blue-600 text-sm font-medium block py-2 px-3 rounded-md active:bg-blue-50 active:text-blue-600" : "hover:text-blue-600 text-sm font-medium block py-2 px-3 rounded-md active:bg-blue-50 active:text-blue-600"}  
    onClick={()=>setIsActive(true)}
      to={href}
  
    >
      {label}
    </Link>
  );
}
