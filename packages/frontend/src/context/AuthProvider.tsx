"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { KeycloakTokenParsed } from "keycloak-js";

import keycloak from "@/lib/keycloakConfig";
import { LoginResponse } from "@/types/login";
import { AuthContext, AuthContextType } from "./AuthContext";
import LoadingIndicator from "@/components/common/LoadingIndicator";

interface CustomTokenParsed extends KeycloakTokenParsed {
  org_id?: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const keycloakInitialized = useRef(false);
  const router = useRouter();

  const updateUserInfo = useCallback(() => {
    if (keycloak?.tokenParsed) {
      const tokenParsed = keycloak.tokenParsed as CustomTokenParsed;
      const userInfo = {
        id: keycloak.subject,
        name: tokenParsed.preferred_username,
        email: tokenParsed.email,
        tenantId: tokenParsed.org_id,
      } as LoginResponse["user"];
      setUser(userInfo);
    }
  }, []);

  useEffect(() => {
    const initKeycloak = async () => {
      console.log("Initializing Keycloak...");
      console.log(keycloak?.clientId);
      try {
        const authenticated = await keycloak?.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
        });
        if (authenticated) {
          updateUserInfo();
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!keycloakInitialized.current) {
      initKeycloak();
      keycloakInitialized.current = true;
    }
  }, [router, updateUserInfo]);

  const login = useCallback(() => {
    keycloak?.login({
      redirectUri: `${window.location.origin}/dashboard`,
    });
  }, []);

  const logout = useCallback(() => {
    keycloak?.logout({
      redirectUri: `${window.location.origin}/login`,
    });
  }, []);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error: null,
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
