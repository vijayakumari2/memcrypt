"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import Image from "next/image";

const Login = () => {
  const { login } = useAuth();

  const features = [
    {
      name: "Track Threats",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    {
      name: "Detailed Reports",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    { name: "Optimize Resources", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    {
      name: "Prevent Damage",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url(/memcrypt/memcryptheader_medium_web.jpg)",
        }}
      ></div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Image
              src="/memcrypt/memcrypt-logo.svg"
              alt="MemCrypt Logo"
              height={60}
              width={240}
              className="mx-auto mb-4"
            />
            <p className="text-lg font-medium text-red-600">
              The last line of defense against Ransomware
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Secure your digital assets with MemCrypt
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-gray-600"
                  style={{ paddingLeft: "2rem" }} // Adjust padding as needed
                >
                  <svg
                    className="w-5 h-5 text-red-500 mr-3 flex-shrink-0"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d={feature.icon}></path>
                  </svg>
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={login}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-300 mb-6"
          >
            Sign In to Your Account
          </Button>
          <p className="text-center text-gray-600">
            New to MemCrypt?{" "}
            <a
              href="/signup"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Create an Account
            </a>
          </p>
          <div className="mt-8 text-center">
            <a
              href="https://memcrypt.io/"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Learn More About MemCrypt
            </a>
             <p className="text-center text-gray-600 mb-4">
            Trusted by leading enterprises worldwide
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
