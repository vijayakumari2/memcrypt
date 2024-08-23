"use client";
import {
  HomeIcon,
  QuestionMarkCircledIcon,
  PersonIcon,
  ActivityLogIcon,
} from "@radix-ui/react-icons";
import SidebarLink from "./SidebarLink";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ListTodo, RecycleIcon, Users, Wrench } from "lucide-react";

const iconStyle = {
  width: "20px", // Adjust this size as needed
  height: "20px",
  strokeWidth: "2", // Ensure all icons have the same stroke width
};

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname.startsWith("/verify-email")
  ) {
    return null;
  }
  return (
    <aside className="bg-white w-64 min-h-screen p-4 ml-6">
      <Image
        alt="Company logo"
        src="/memcrypt/memcrypt-logo.svg"
        height={50}
        width={214}
        className="object-contain text-center max-w-full aspect-[7.35] w-[214px]"
        priority
        style={{ height: "auto" }}
      />
      <nav className="space-y-2 mt-7">
        <SidebarLink
          href="/dashboard"
          icon={<HomeIcon style={iconStyle} />}
          text="Dashboard"
          active={pathname === "/dashboard"}
        />
        {user && user.tenantId === undefined && (
          <>
            <SidebarLink
              href="/approval-signup-request"
              icon={<ListTodo style={iconStyle} />}
              text="Approval Requests"
              active={pathname === "/approval-signup-request"}
            />
            <SidebarLink
              href="/users"
              icon={<Users style={iconStyle} />}
              text="Users"
              active={pathname === "/users"}
            />
          </>
        )}
        {user && user.tenantId && (
          <>
            <SidebarLink
              href="/org-profile"
              icon={<PersonIcon style={iconStyle} />}
              text="Organization Profile"
              active={pathname === "/org-profile"}
            />
            <SidebarLink
              href="/activity-logs"
              icon={<ActivityLogIcon style={iconStyle} />}
              text="Activity Logs"
              active={pathname === "/activity-logs"}
            />
            <SidebarLink
              href="/recovery"
              icon={<RecycleIcon style={iconStyle} />}
              text="Recovery"
              active={pathname === "/recovery"}
            />
            <SidebarLink
              href="/tools"
              icon={<Wrench style={iconStyle} />}
              text="Tools"
              active={pathname === "/tools"}
            />
            <SidebarLink
              href="/help"
              icon={<QuestionMarkCircledIcon style={iconStyle} />}
              text="Help"
              active={pathname === "/help"}
            />
          </>
        )}
      </nav>
    </aside>
  );
}
