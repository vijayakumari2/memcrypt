"use client";
import { BellIcon, PersonIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiOutlineLogout } from "react-icons/ai";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "../ui/menubar";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname.startsWith("/verify-email")
  ) {
    return null;
  }

  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-end">
        <div className="flex items-center space-x-6">
          <BellIcon className="h-6 w-6 text-red-600 cursor-pointer hover:text-red-700 transition-colors duration-200" />
          <Menubar className="border-none focus:outline-none focus:ring-0">
            <MenubarMenu>
              <MenubarTrigger className="flex items-center focus:outline-none">
                <Avatar className="h-8 w-8 border-2 border-red-600">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-red-100 text-red-600">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {user?.name}
                </span>
              </MenubarTrigger>
              <MenubarContent className="w-48 bg-white shadow-lg rounded-md py-1 mt-1">
                <MenubarItem
                  onSelect={() => router.push("/org-profile")}
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                  <PersonIcon className="mr-2 text-red-600" />
                  <span>Profile</span>
                </MenubarItem>
                <MenubarSeparator className="bg-gray-200" />
                <MenubarItem
                  onSelect={logout}
                  className="px-4 py-2 hover:bg-red-50 cursor-pointer"
                >
                  <AiOutlineLogout className="mr-2 text-red-600" />
                  <span>Logout</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>
    </header>
  );
}
