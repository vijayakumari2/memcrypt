#!/bin/bash

# Set variables
KEYCLOAK_DIR="/opt/keycloak"
CUSTOM_THEME_NAME="memcrypt"

# Check if the Keycloak directory exists
if [ ! -d "$KEYCLOAK_DIR" ]; then
    echo "Error: $KEYCLOAK_DIR does not exist."
    exit 1
fi

# Create directory structure
mkdir -p "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME"/{account,admin,login}/{resources/{css,img},messages}

# Create custom CSS files
for theme in account admin login; do
    cat << EOF > "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/$theme/resources/css/styles.css"
body {
    background: #1A1A1A; /* MemCrypt Dark Background */
}
.login-pf body {
    background: #f5f5f5;
    background-image: url(../img/memcrypt-background.svg); /* Update with MemCrypt background */
    background-size: cover;
    height: 100%;
}
.login-pf-page .card-pf p {
    color: #fff;
}
div#kc-header {
    margin-bottom: 20px;
}
div#kc-header-wrapper {
    padding: 20px;
    background-image: url(../img/memcrypt-logo.svg); /* Update with MemCrypt logo */
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    height: 100px;
    width: 300px;
    margin: 0 auto;
    color: transparent;
}
#kc-header-wrapper span {
    display: none;
    color: #fff;
}
#kc-content {
    # background-color: #252525; /* MemCrypt Content Background */
      background-color: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    # color: #ffffff;
}
.btn-primary {
    background-color: #C02427; /* MemCrypt Primary Button Color */
    border-color: #C02427;
}
.btn-primary:hover {
    background-color: #e53535; /* Lighter shade on hover */
    border-color: #e53535;
}
.form-group {
    margin-bottom: 20px;
}
.form-control {
    height: 40px;
}

.pf-c-button {
    border-radius: 4px;
}

.card-pf {
    border-color: #C02427;
}

#kc-login {
    background-color: #C02427;
}
.pf-c-form-control:focus {
    border-color: #C02427;
}
.pf-c-form-control {
    border-color: #C02427;
}
.pf-c-button.pf-m-control {
    border-color: #C02427;
}
.pf-c-button.pf-m-control:hover {
  --pf-c-button--m-control--after--BorderBottomColor: #C02427;
}
.pf-c-button.pf-m-control:focus {
  --pf-c-button--m-control--after--BorderBottomColor: #C02427;
}
.pf-c-button.pf-m-primary {
  --pf-c-button--m-primary--Color: #fff;
  --pf-c-button--m-primary--BackgroundColor: #C02427;
  --pf-c-button--m-primary--BorderColor: #C02427;
}
.pf-c-button.pf-m-primary:hover {
  --pf-c-button--m-primary--Color: #fff;
  --pf-c-button--m-primary--BackgroundColor: #e53535;
  --pf-c-button--m-primary--BorderColor: #e53535;
}

#kc-info-wrapper {
    background-color: #C02427;
    color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
#kc-registration > span >a {
     color: #fff;
} 
EOF
done

# Create theme.properties files
for theme in account admin login; do
    cat << EOF > "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/$theme/theme.properties"
parent=keycloak
import=common/keycloak
styles=css/login.css css/styles.css
EOF
done

# Create messages_en.properties file
cat << EOF > "$KEYCLOAK_DIR/themes/$CUSTOM_THEME_NAME/login/messages/messages_en.properties"
loginAccountTitle=Welcome to MemCrypt
accountDisabledMessage=Once your account is approved, you will be able to log in. You will receive an email notification once the approval process is complete.
EOF

# Find kcadm.sh location
KCADM_PATH="$KEYCLOAK_DIR/bin/kcadm.sh"
if [ ! -f "$KCADM_PATH" ]; then
    echo "Error: Unable to find kcadm.sh at $KCADM_PATH"
    exit 1
fi

# Print environment variables for debugging
env

# Update Keycloak configuration
#"$KCADM_PATH" config credentials --server 'https://localhost:8443' --realm master --user admin --password admin

#"$KCADM_PATH" update realms/master -s loginTheme=$CUSTOM_THEME_NAME -s accountTheme=$CUSTOM_THEME_NAME -s adminTheme=$CUSTOM_THEME_NAME 

echo "Keycloak theme update completed. Please restart the Keycloak service to apply changes."
