import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Cloud, LogOut, KeyRound, User } from "lucide-react";

export const HeaderBar = ({ onLogout, onChangePassword, user }: any) => {
  console.log("HeaderBar user:", user);
  return (
    <header className="border-b bg-card fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">DataStore Cloud</h1>
        </div>

        {/* Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
              <img
                src={`https://images.unsplash.com/photo-1614398306313-aa5a4c465e9e?q=80&w=694&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                alt="avatar"
                className="rounded-full h-10 w-10"
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            {/* User info */}
           

            <DropdownMenuItem onClick={onChangePassword}>
              <KeyRound className="h-4 w-4 mr-2" />
              Change Password
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
      </div>
    </header>
  );
};
