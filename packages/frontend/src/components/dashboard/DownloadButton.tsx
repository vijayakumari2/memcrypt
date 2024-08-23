import React from "react";
import Image from "next/image";
interface DownloadButtonProps {
  icon: string;
  label: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ icon, label }) => (
  <div className="flex overflow-hidden gap-10 self-stretch px-4 py-5 my-auto rounded border border-red-700 border-solid bg-red-400 bg-opacity-10 min-w-[240px] w-[260px] max-md:pl-5">
    <div className="flex gap-2 font-bold text-black">
      <Image
        src={icon}
        alt=""
        className="object-contain shrink-0 aspect-square w-[30px]"
        height={30}
        width={30}
      ></Image>
      <div className="my-auto">{label}</div>
    </div>
    <button className="px-4 py-3 text-center text-white bg-red-700 rounded">
      Download
    </button>
  </div>
);

export default DownloadButton;
