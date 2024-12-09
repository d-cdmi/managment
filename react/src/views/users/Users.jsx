import { useEffect, useState } from "react";
import axiosClient from "../../axios-client.js";
import { Link } from "react-router-dom";
import { useStateContext } from "../../context/ContextProvider.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { AlertDialogDemo } from "@/components/AlertDialogDemo.jsx"; // Adjust the import path as necessary

export default function Users() {
  const { user, setNotification } = useStateContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    getUsers();
  }, []);

  const onDeleteClick = (user) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      axiosClient
        .delete(`/users/${selectedUser.id}`)
        .then(() => {
          setNotification("User was successfully deleted");
          getUsers();
        })
        .catch(() => {
          setNotification("Error deleting user");
        });
    }
    setIsAlertOpen(false);
    setSelectedUser(null);
  };

  const getUsers = () => {
    setLoading(true);
    axiosClient
      .get("/users")
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link to="/users/new">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            Add New
          </Button>
        </Link>
      </div>
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader />
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Create Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    {" "}
                    {user.name == `${import.meta.env.VITE_ADMIN}` &&
                      "Actions"}{" "}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {u.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {u.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {u.role}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {u.created_at}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm font-medium">
                      {user.name == `${import.meta.env.VITE_ADMIN}` && (
                        <>
                          <Link
                            to={"/users/" + u.id}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <Button
                            className="ml-4 bg-red-500 text-white hover:bg-red-600"
                            onClick={() => onDeleteClick(u)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <AlertDialogDemo
        open={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
