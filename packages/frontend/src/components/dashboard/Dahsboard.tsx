"use client";
import { CopyIcon } from "lucide-react";
import DownloadButton from "./DownloadButton";
import IconButton from "./IconButton";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import ComingSoon from "../common/ComingSoon";

const DashboardComponent = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }
  if (user.tenantId === undefined) {
    return (
      <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <ComingSoon />{" "}
      </div>
    );
  }
  const downloadButtons = [
    {
      icon: "memcrypt/windows.svg",
      label: "Windows",
    },
  ];

  const iconButtons = [
    {
      src: "/memcrypt/mac.svg",
      alt: "Mac OS",
    },
    {
      src: "/memcrypt/linux.svg",
      alt: "Linux",
    },
    {
      src: "/memcrypt/android.svg",
      alt: "Android",
    },
    {
      src: "/memcrypt/ios.svg",
      alt: "iOS",
    },
  ];

  return (
    <main className="flex flex-col items-center max-w-[752px] lg:max-w-[1024px] p-4 ml-12">
      <header className="z-10 mt-0 text-2xl text-black">
        Welcome to MemCrypt!
      </header>
      <p className="mt-4 text-sm text-black max-w-full">
        {`Hi Admin, your account is set up. Let's secure your devices against
        ransomware.`}
      </p>
      <section className="relative flex flex-col items-start self-stretch bg-white rounded-lg shadow-sm pb-24 pl-12 mt-5 w-full max-md:pl-5 max-md:max-w-full z-10">
        <div className="flex items-start self-stretch text-black">
          <div className="flex flex-col grow shrink-0 self-end mt-20 mr-0 w-fit max-md:mt-10">
            <h2 className="text-xl max-w-full">
              Secure Your Devices: Install the MemCrypt Agent
            </h2>
            <p className="mt-4 text-sm leading-5 max-w-full">
              To get started, download and install the agent on your device. For
              mobile devices, follow the enrollment methods.
            </p>
          </div>
          <Image
            src="/memcrypt/lock.svg"
            alt="MemCrypt Agent"
            className="object-contain w-[109px] aspect-[0.93] max-w-full"
            height={109}
            width={100}
          />
        </div>
        <div className="flex flex-wrap gap-10 mt-6 w-full text-sm whitespace-nowrap max-w-[609px] max-md:max-w-full">
          <div className="flex flex-wrap gap-10 items-center flex-auto max-md:max-w-full">
            {downloadButtons.map((button, index) => (
              <DownloadButton
                key={index}
                icon={button.icon}
                label={button.label}
              />
            ))}
            {iconButtons.map((button, index) => (
              <IconButton key={index} src={button.src} alt={button.alt} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center px-5 w-full text-sm leading-none text-center text-black whitespace-nowrap border-b border-zinc-200 max-w-[800px]">
          <div className="px-3 py-1 w-auto bg-white">or</div>
        </div>

        <p className="mt-8 text-sm text-black">
          Use the below link to download and install an agent
        </p>

        <div className="flex flex-wrap gap-10 px-9 py-4 mt-2.5 bg-gray-100 rounded border border-zinc-200 w-full max-md:px-5 max-w-[800px]">
          <div className="flex items-center justify-between w-full max-md:flex-wrap">
            <span className="flex-1 truncate px-1">
              https://desktopcentral.manageengine.in/download?encapiKey=PHtE6r0KEey4jmMqph6Q
            </span>
            <CopyIcon size={16} className="ml-2 max-md:ml-0 max-md:mt-2" />
          </div>
        </div>
      </section>
      <Image
        src="/memcrypt/rocket.svg"
        alt="Rocket"
        className="absolute bottom-0 transform translate-y-[50%] z-[-1]"
        style={{ left: "290px" }}
        height={174}
        width={184}
      />
    </main>
  );
};

export default DashboardComponent;
