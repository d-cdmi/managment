import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../axios-client.js";
import { useStateContext } from "../../context/ContextProvider.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import Loader from "@/components/ui/Loader.jsx";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState({
    id: null,
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState({
    row: false,
    "row-e": false,
    "row-d": false,
    science: false,
    "data-c": false,
    data: false,
    log: false,
    work: false,
    "log-c": false,
    "work-c": false,
    "data-e": false,
    "log-e": false,
    "work-e": false,
    "data-d": false,
    "log-d": false,
    "work-d": false,
    beta: false,
  });
  const [loading, setLoading] = useState(false);
  const { setNotification } = useStateContext();

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient
        .get(`/users/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setUser(data);
          // Set roles based on user's current roles
          const initialRoles = { ...roles };
          data.roles.split(",").forEach((role) => {
            if (initialRoles[role]) {
              initialRoles[role] = true;
            }
          });
          setRoles(initialRoles);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id, roles]);

  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add("dark");
  }, []);

  const handleRoleChange = (e) => {
    const { name, checked } = e.target;
    setRoles((prev) => ({ ...prev, [name]: checked }));
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    setLoading(true);

    // Create a string of selected roles
    const selectedRoles = Object.keys(roles)
      .filter((role) => roles[role]) // Get keys of checked roles
      .join(","); // Join them into a comma-separated string

    const updatedUser = {
      ...user,
      role: selectedRoles, // Set the role field to the selected roles string
    };
    const request = user.id
      ? axiosClient.put(`/users/${user.id}`, updatedUser)
      : axiosClient.post("/users", updatedUser);

    request
      .then(() => {
        setNotification(
          `User was successfully ${user.id ? "updated" : "created"}`
        );
        navigate("/users");
      })
      .catch((err) => {
        setLoading(false);
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white p-8 text-black dark:bg-gray-800 dark:text-white">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          {user.id ? `Update User: ${user.name}` : "New User"}
        </h1>
        {loading && <Loader />}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded border border-red-500 p-4 text-red-500">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        )}
        {!loading && (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="text"
              value={user.name}
              onChange={(ev) =>
                setUser((prevUser) => ({ ...prevUser, name: ev.target.value }))
              }
              placeholder="Name"
              required
              className="w-full"
            />
            <Input
              type="text"
              value={user.username}
              onChange={(ev) =>
                setUser((prevUser) => ({
                  ...prevUser,
                  username: ev.target.value,
                }))
              }
              placeholder="Username"
              required
              className="w-full"
            />

            {/* Checkboxes for roles */}
            <div className="mb-4">
              <h2 className="mb-2 font-semibold">Roles</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {Object.keys(roles).map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      name={role}
                      checked={roles[role]}
                      onChange={handleRoleChange}
                      className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 capitalize">
                      {role.replace("-", " ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Input
              type="email"
              value={user.email}
              onChange={(ev) =>
                setUser((prevUser) => ({ ...prevUser, email: ev.target.value }))
              }
              placeholder="Email"
              required
              className="w-full"
            />
            <Input
              type="password"
              value={user.password}
              onChange={(ev) =>
                setUser((prevUser) => ({
                  ...prevUser,
                  password: ev.target.value,
                }))
              }
              placeholder="Password"
              required={!user.id}
              className="w-full"
            />
            <Input
              type="password"
              value={user.password_confirmation}
              onChange={(ev) =>
                setUser((prevUser) => ({
                  ...prevUser,
                  password_confirmation: ev.target.value,
                }))
              }
              placeholder="Password Confirmation"
              required={!user.id}
              className="w-full"
            />
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Save
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
