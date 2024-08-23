"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import LoadingIndicator from "../common/LoadingIndicator";
import apiClient from "@/utils/apiClient";
import { getKeycloakToken } from "@/lib/keyCloakUtil";
import { UserWithOrg } from "@/types/keycloak";
import NoUsersFound from "../common/NoUsersFound";

export const UserList = () => {
  const { user } = useAuth();

  // Fetch all users
  const {
    data: usersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const token = await getKeycloakToken();
      const response = await apiClient.get("/users/", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data;
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-4">
        <LoadingIndicator />
      </div>
    );
  if (isError)
    return (
      <div className="text-center py-4 text-red-500">Error loading users.</div>
    );

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Organization Users
      </h2>
      {usersData && usersData.data.length > 0 ? (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <Table className="min-w-full bg-white">
            <TableHeader className="bg-gray-100 border-b">
              <TableRow>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  Organization
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                  Name
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  User Id
                </TableHead>

                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.data.map((user: UserWithOrg) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.organization?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800">
                    {user.username}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.id}
                  </TableCell>

                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.enabled ? "Active" : "Inactive"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4">
          <NoUsersFound
            heading="No Users Found"
            message="There are currently no users in the platform."
          />
        </div>
      )}
    </div>
  );
};
