"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingIndicator from "../common/LoadingIndicator";
import { useSearchParams } from "next/navigation";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post("/api/auth/verify-email", {
          token: token,
        });
        if (response.status === 200) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "loading" && <LoadingIndicator />}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">
            Email Verified Successfully!
          </h1>
          <p className="mt-4 text-gray-700">
            Once your account is approved, you will be able to log in. You will
            receive an email notification once the approval process is complete.
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Verification Failed
          </h1>
          <p className="mt-4 text-gray-700">
            The verification link is invalid or has expired. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
