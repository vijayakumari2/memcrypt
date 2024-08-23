"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { User } from "@/types/keycloak";
import LoadingIndicator from "../common/LoadingIndicator";
import apiClient from "@/utils/apiClient";
import { getKeycloakToken } from "@/lib/keyCloakUtil";
import NoUsersFound from "../common/NoUsersFound";

export const PendingApproval = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pending users
  const {
    data: pendingUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "pending"],
    queryFn: async () => {
      const token = await getKeycloakToken();
      const response = await apiClient.get("/users/pending", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data;
    },
  });

  // Mutation for approving a user
  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getKeycloakToken();
      await apiClient.post(
        `/users/${userId}/approve`,
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "pending"], // Specify the query key to invalidate
      });
    },
  });

  // Mutation for rejecting a user
  const rejectUser = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getKeycloakToken();
      await apiClient.post(
        `/users/${userId}/reject`,
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "pending"], // Specify the query key to invalidate
      });
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
        Organizations Pending Approval
      </h2>
      {pendingUsers && pendingUsers.length > 0 ? (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <Table className="min-w-full bg-white">
            <TableHeader className="bg-gray-100 border-b">
              <TableRow>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                  Name
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                  User Id
                </TableHead>
                <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user: User) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="px-2 py-2 text-gray-800">
                    {user.lastName}, {user.firstName}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                    {user.username}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-gray-800">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm mr-2">
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-full max-w-lg mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this user?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white border hover:bg-gray-100 border-gray-300 text-gray-700 py-1 px-2 rounded text-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm"
                            onClick={() => approveUser.mutate(user.id)}
                          >
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm">
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-full max-w-lg mx-auto">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this user?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white border hover:bg-gray-100 border-gray-300 text-gray-700 py-1 px-2 rounded text-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
                            onClick={() => rejectUser.mutate(user.id)}
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-lg text-gray-600">
            <NoUsersFound
              heading="No pending users found"
              message="There are currently no users waiting for approval."
            />
          </p>
        </div>
      )}
    </div>
  );
};
