import Keycloak, { KeycloakConfig } from "keycloak-js";

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  realm: process.env.NEXT_PUBLIC_APP_REALM || "memcrypt",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "memcrypt-frontend",
};

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
  keycloak = new Keycloak(keycloakConfig);
  console.log("Keycloak config", keycloakConfig);
}


export default keycloak;
