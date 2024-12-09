import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu.jsx";
import { LogOut, Menu, X } from "lucide-react";

export default function DefaultLayout() {
  const { user, token, setUser, setToken, notification } = useStateContext();
  const [darkMode, setDarkMode] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!token && !user?.role) return;

    axiosClient.get("/user").then(({ data }) => {
      setUser(data);
    });
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode === "dark");
  }, [darkMode]);

  const onLogout = (ev) => {
    ev.preventDefault();

    axiosClient.post("/logout").then(() => {
      setUser({});
      setToken(null);
    });
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setMenuOpen(false); // Close the menu on mobile view
    }
  };

  return (
    <>
      {!token && !user?.role ? (
        <Navigate to="/login" />
      ) : (
        <div
          id="defaultLayout"
          className="flex min-h-screen flex-col sm:flex-row"
        >
          <aside
            className={`z-20 transform transition-transform duration-300 sm:bg-opacity-100 dark:sm:bg-slate-950 ${menuOpen ? "translate-x-0" : "-translate-x-full"} fixed h-full w-full flex-col px-4 py-6 sm:relative sm:flex sm:w-64 sm:translate-x-0`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">MY SITE</h1>
              <button className="sm:hidden" onClick={toggleMenu}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-grow flex-col items-center space-y-4">
              <NavLink
                to="/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `hover:underline ${
                    isActive ? "font-semibold text-blue-500" : ""
                  }`
                }
              >
                Dashboard
              </NavLink>
              {user?.role &&
                ["owner", "row"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/row"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    Row Items
                  </NavLink>
                )}
              {user?.role &&
                ["owner", "cdmir"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/cdmi-data"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    cdmi row
                  </NavLink>
                )}
              {user?.role &&
                ["owner", "science"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/science"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:text-lg hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    Data Science Lecturers
                  </NavLink>
                )}
              {user?.role &&
                ["owner", "log"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/log"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:text-lg hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    Log
                  </NavLink>
                )}
              {user?.role &&
                ["owner", "money"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/money"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:text-lg hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    Money
                  </NavLink>
                )}
              {user?.role &&
                ["owner", "work"].some((s) => user.role.includes(s)) && (
                  <NavLink
                    to="/work"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `hover:text-lg hover:underline ${
                        isActive ? "font-semibold text-blue-500" : ""
                      }`
                    }
                  >
                    Work
                  </NavLink>
                )}
              <div className="mt-auto space-y-4">
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center rounded-md p-2">
                      Theme
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={darkMode}
                        onValueChange={setDarkMode}
                      >
                        <DropdownMenuRadioItem value="dark">
                          Dark Mode
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="light">
                          Light Mode
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span>{user.name}</span>
              </div>
            </nav>
          </aside>

          {/* Backdrop for mobile menu */}
          {menuOpen && (
            <div
              className="fixed inset-0 h-full opacity-50 dark:bg-black sm:hidden"
              onClick={toggleMenu}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 bg-gray-100 p-4 dark:bg-gray-900">
            <header className="mb-4 flex items-center justify-between">
              <button className="p-2 sm:hidden" onClick={toggleMenu}>
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="mr-6 flex flex-grow justify-end">
                <LogOut
                  size={33}
                  color="#df2626"
                  strokeWidth={2.5}
                  className="cursor-pointer hover:text-red-800"
                  onClick={onLogout}
                />
              </div>
            </header>

            <main>
              <Outlet />
            </main>

            {notification && (
              <div className="fixed bottom-4 right-4 rounded-lg p-4 text-white shadow-lg dark:bg-gray-800">
                {notification}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
