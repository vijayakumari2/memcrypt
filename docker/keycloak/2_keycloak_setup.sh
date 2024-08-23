#!/bin/bash

# Keycloak configuration
KEYCLOAK_URL="http://localhost:8081"
REALM_NAME="memcrypt"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"

# app configuration
FRONTEND_CLIENT_ID="memcrypt-frontend"
BACKEND_CLIENT_ID="memcrypt-backend"

# Function to get access token
get_access_token() {
    curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN_USERNAME}" \
    -d "password=${ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token'
}

# Get access token
TOKEN=$(get_access_token)

# Function to create realm
create_realm() {
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "realm": "'"${REALM_NAME}"'",
        "enabled": true,
        "displayName": "'"${REALM_NAME}"'",
        "organizationsEnabled": true
    }')
    echo "Realm creation response: ${response}"
}

# Function to create frontend client
create_frontend_client() {
    local CLIENT_ID="$1"
    local REDIRECT_URI_1="$2"
    local REDIRECT_URI_2="$3"
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'"${CLIENT_ID}"'",
        "enabled": true,
        "publicClient": true,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "redirectUris": ["'"${REDIRECT_URI_1}"'", "'"${REDIRECT_URI_2}"'"],
        "webOrigins": ["+"],
        "protocol": "openid-connect",
        "attributes": {
            "pkce.code.challenge.method": "S256"
        }
    }')
    echo "Frontend client creation response: ${response}"
}

# Function to create backend client
create_backend_client() {
    local CLIENT_ID="$1"
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "'"${CLIENT_ID}"'",
        "enabled": true,
        "bearerOnly": false,
        "publicClient": false,
        "standardFlowEnabled": false,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": false,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "protocol": "openid-connect"
    }')
    echo "Backend client creation response: ${response}"
}

# Function to create superadmin user
create_superadmin_user() {
    local USERNAME="$1"
    local PASSWORD="$2"
    local EMAIL="$3"

    # Create user
    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "'"${USERNAME}"'",
        "enabled": true,
        "emailVerified": true,
        "email": "'"${EMAIL}"'",
        "credentials": [{
            "type": "password",
            "value": "'"${PASSWORD}"'",
            "temporary": false
        }]
    }')
    echo "User creation response: ${response}"

    # Get user ID
    USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?username=${USERNAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" | jq -r '.[0].id')

    echo "Superadmin user created: ${USERNAME}"
}

# Function to create a client scope
create_client_scope() {
    local SCOPE_NAME="$1"
    local DESCRIPTION="$2"
    local SCOPE_TYPE="$3"

    echo "Creating client scope: $SCOPE_NAME" >&2

    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "'"${SCOPE_NAME}"'",
        "description": "'"${DESCRIPTION}"'",
        "type": "'"${SCOPE_TYPE}"'",
        "protocol": "openid-connect",
        "attributes": {
            "display.on.consent.screen": "true",
            "consent.screen.text": "",
            "include.in.token.scope": "false",
            "gui.order": ""
        }
    }')

    # Check if response is empty (which indicates success)
    if [ -z "$response" ]; then
        echo "Client scope created successfully" >&2
    elif echo "$response" | jq -e . >/dev/null 2>&1; then
        # Valid JSON response
        if echo "$response" | jq -e '.error' >/dev/null 2>&1; then
            echo "Failed to create client scope. Error: $(echo "$response" | jq -r '.error')" >&2
            return 1
        fi
    else
        echo "Unexpected response: $response" >&2
        return 1
    fi

    # Get the ID of the created scope
    sleep 2  # Add a small delay to ensure the scope is created before we fetch it
    SCOPE_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" | jq -r ".[] | select(.name == \"${SCOPE_NAME}\") | .id")

    if [ -z "$SCOPE_ID" ]; then
        echo "Failed to retrieve the ID of the created client scope" >&2
        return 1
    fi

    echo "$SCOPE_ID"
}

# Function to add a protocol mapper to a client scope
add_protocol_mapper() {
    local SCOPE_ID="$1"
    local MAPPER_NAME="$2"
    local USER_ATTRIBUTE="$3"

    echo "Adding protocol mapper to scope ID: $SCOPE_ID" >&2

    response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/client-scopes/${SCOPE_ID}/protocol-mappers/models" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "protocol": "openid-connect",
        "protocolMapper": "oidc-usermodel-attribute-mapper",
        "name": "'"${MAPPER_NAME}"'",
        "config": {
            "claim.name": "'"${MAPPER_NAME}"'",
            "jsonType.label": "String",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true",
            "introspection.token.claim": "true",
            "user.attribute": "'"${USER_ATTRIBUTE}"'",
            "lightweight.claim": "false"
        }
    }')

    if [ -z "$response" ]; then
        echo "Protocol mapper created successfully" >&2
    else
        echo "Protocol mapper creation response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Function to assign a client scope to a client
assign_client_scope() {
    local CLIENT_ID="$1"
    local SCOPE_ID="$2"

    echo "Assigning client scope $SCOPE_ID to client $CLIENT_ID" >&2

    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_ID}/default-client-scopes/${SCOPE_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")

    if [ -z "$response" ]; then
        echo "Client scope assigned successfully" >&2
    else
        echo "Client scope assignment response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Function to get client ID by client name
get_client_id() {
    local CLIENT_NAME="$1"
    response=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_NAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json")

    CLIENT_ID=$(echo "$response" | jq -r '.[0].id // empty')

    if [ -z "$CLIENT_ID" ]; then
        echo "Failed to get client ID for $CLIENT_NAME" >&2
        return 1
    fi

    echo "$CLIENT_ID"
}

# Function to update login theme
update_login_theme() {
    local THEME_NAME="$1"

    echo "Updating login theme to $THEME_NAME" >&2

    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "loginTheme": "'"${THEME_NAME}"'"
    }')

    if [ -z "$response" ]; then
        echo "Login theme updated successfully" >&2
    else
        echo "Login theme update response: ${response}" >&2
        # You might want to add more error handling here if needed
    fi
}

# Main function to set up a client scope and assign it to a client
setup_client_scope() {
    local SCOPE_NAME="$1"
    local DESCRIPTION="$2"
    local SCOPE_TYPE="$3"
    local USER_ATTRIBUTE="$4"
    local CLIENT_NAME="$5"

    # Create client scope
    SCOPE_ID=$(create_client_scope "$SCOPE_NAME" "$DESCRIPTION" "$SCOPE_TYPE")
    if [ $? -ne 0 ]; then
        echo "Failed to create client scope"
        return 1
    fi
    echo "Created client scope with ID: $SCOPE_ID"

    # Add protocol mapper
    add_protocol_mapper "$SCOPE_ID" "$SCOPE_NAME" "$USER_ATTRIBUTE"

    # Get client ID
    CLIENT_ID=$(get_client_id "$CLIENT_NAME")
    if [ $? -ne 0 ]; then
        echo "Failed to get client ID for $CLIENT_NAME"
        return 1
    fi
    echo "Found client ID: $CLIENT_ID"

    # Assign client scope to client
    assign_client_scope "$CLIENT_ID" "$SCOPE_ID"
}

setup_user_profile() {
    response=$(curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/profile" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
            "attributes": [
                {
                    "name": "username",
                    "displayName": "${username}",
                    "validations": {
                        "length": {
                            "min": 3,
                            "max": 255
                        },
                        "username-prohibited-characters": {},
                        "up-username-not-idn-homograph": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "email",
                    "displayName": "${email}",
                    "validations": {
                        "email": {},
                        "length": {
                            "max": 255
                        }
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "firstName",
                    "displayName": "${firstName}",
                    "validations": {
                        "length": {
                            "max": 255
                        },
                        "person-name-prohibited-characters": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "lastName",
                    "displayName": "${lastName}",
                    "validations": {
                        "length": {
                            "max": 255
                        },
                        "person-name-prohibited-characters": {}
                    },
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                },
                {
                    "name": "status",
                    "displayName": "Status",
                    "permissions": {
                        "edit": [
                            "admin",
                            "user"
                        ],
                        "view": [
                            "user",
                            "admin"
                        ]
                    },
                    "multivalued": false,
                    "annotations": {
                        "inputType": "select"
                    },
                    "validations": {
                        "options": {
                            "options": [
                                "pending",
                                "approved",
                                "rejected"
                            ]
                        }
                    }
                },
                {
                    "name": "verificationToken",
                    "displayName": "${verificationToken}",
                    "permissions": {
                        "view": [
                            "admin",
                            "user"
                        ],
                        "edit": [
                            "admin",
                            "user"
                        ]
                    },
                    "multivalued": false
                }
            ],
            "groups": [
                {
                    "name": "user-metadata",
                    "displayHeader": "User metadata",
                    "displayDescription": "Attributes, which refer to user metadata"
                }
            ]
        }')
    echo "User Profile setup response: ${response}"
}

# Main execution
case "$1" in
    realm)
        create_realm
        ;;
    frontend)
        create_frontend_client $FRONTEND_CLIENT_ID "http://localhost:3000/*" "https://oauth.pstmn.io/*"
        ;;
    backend)
        create_backend_client $BACKEND_CLIENT_ID
        ;;
    superadmin)
        create_superadmin_user "superadmin" "superadmin123" "superadmin@example.com"
        ;;
    userprofile)
        setup_user_profile
        ;;
    clientscope)
        setup_client_scope "org_id" "Organization ID scope" "Default" "kc.org" $FRONTEND_CLIENT_ID
        ;;
    logintheme)
        update_login_theme "memcrypt"
        ;;
    all)
        create_realm
        create_frontend_client $FRONTEND_CLIENT_ID "http://localhost:3000/*" "https://oauth.pstmn.io/*"
        create_backend_client $BACKEND_CLIENT_ID
        create_superadmin_user "superadmin" "superadmin123" "superadmin@example.com"
        setup_user_profile
        setup_client_scope "org_id" "Organization ID scope" "Default" "kc.org" $FRONTEND_CLIENT_ID
        update_login_theme "memcrypt"
        ;;
    *)
        echo "Usage: $0 {realm|frontend|backend|superadmin|userprofile|clientscope|logintheme|all}"
        exit 1
        ;;
esac
echo "Setup complete."