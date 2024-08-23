
#!/bin/bash

WORKSPACE="/Users/shaik/Memcrypt/memcrypt-saas-controlplane"
#update your file location according to your local env 

docker cp $WORKSPACE/docker/keycloak/theme/memcrypt/keycloak_memcrypt_theme.sh memcrypt_keycloak:/opt/keycloak_memcrypt_theme.sh
echo "##################"
docker exec -it memcrypt_keycloak /bin/bash /opt/keycloak_memcrypt_theme.sh
echo "##################"
docker cp $WORKSPACE/docker/keycloak/theme/memcrypt/memcrypt-logo.svg memcrypt_keycloak:/opt/keycloak/themes/memcrypt/login/resources/img/
echo "##################"
docker cp $WORKSPACE/docker/keycloak/theme/memcrypt/memcrypt-background.svg memcrypt_keycloak:/opt/keycloak/themes/memcrypt/login/resources/img/
echo "##################"
docker cp $WORKSPACE/docker/keycloak/theme/memcrypt/favicon.ico memcrypt_keycloak:/opt/keycloak/themes/memcrypt/login/resources/img/
