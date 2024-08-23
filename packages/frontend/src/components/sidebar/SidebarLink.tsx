import Link from "next/link";

function SidebarLink({
  href,
  icon,
  text,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-2 rounded-lg ${
        active ? "bg-gray-100 text-red-600" : "text-gray-700 hover:bg-gray-50"
      } transition duration-150 ease-in-out`}
    >
      <div
        className={`flex items-center justify-center text-xl ${
          active ? "text-red-600" : "text-gray-500"
        }`}
      >
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </Link>
  );
}

export default SidebarLink;
