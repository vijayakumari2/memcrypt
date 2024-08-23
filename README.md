# Memcrypt SaaS Controlplane Frontend

This project is the frontend application for a SaaS platform, utilizing Keycloak for authentication. Below are the instructions to set up and run the frontend project.

## Prerequisites

- Docker and Docker Compose
- Node.js and Yarn
- Git Bash (for Windows users)

## Setup Instructions

1. **Start the Docker containers for Keycloak:**
   Navigate to the `docker` folder and run:

   ```
   docker-compose  -p memcrypt-keycloak up -d
   ```

2. **Verify Keycloak is running:**
   Open a web browser and go to `http://localhost:8081`
   Login with:

   - Username: admin
   - Password: admin

3. **Set up Keycloak:**
   Navigate to the `keycloak` folder in the project and run scripts in following order:

   ```
   sh 1_copy_themes.sh
   sh 2_keycloak_setup.sh all
   ```

4. **Set up the Frontend:**
   Navigate to the `packages/frontend` folder and run:

   ```
   yarn
   yarn build
   ```

5. **Start the Frontend development server:**
   In the `packages/frontend` folder, run:
   ```
   yarn dev
   ```

## Running the Application

After completing the setup, you can access the frontend application at `http://localhost:3000` (or whichever port is specified in your frontend configuration).

## Development

- All frontend code is located in the `packages/frontend` directory.
- Keycloak configuration and themes are in the `docker/keycloak` directory.

## Additional Information

- The project uses Next.js for the frontend, as evident from the `next.config.mjs` file.
- Tailwind CSS is used for styling, configured in `tailwind.config.ts`.
- The project includes TypeScript support, as seen from the `tsconfig.json` file.
- Testing is set up with files like `vite.config.ts` and the `tests` directory.

## Troubleshooting

If you encounter any issues:

1. Ensure the Keycloak Docker container is running correctly.
2. Check if Keycloak is properly configured.
3. Verify that all dependencies are installed in the frontend project.
4. Check the console for any error messages during the build or run process.

Note: This project currently only includes a frontend implementation. There is no backend setup at this time.
