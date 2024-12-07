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
          className="flex min-h-screen flex-col sm:flex-row "
        >
          <aside
            className={` dark:sm:bg-slate-950 sm:bg-opacity-100 transform transition-transform duration-300 z-20 
              ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
              sm:translate-x-0 sm:relative sm:w-64 w-full sm:flex flex-col py-6 px-4 fixed h-full`}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">MY SITE</h1>
              <button className="sm:hidden" onClick={toggleMenu}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-4 flex-grow items-center">
              <NavLink
                to="/dashboard"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `hover:underline  ${
                    isActive ? "text-blue-500 font-semibold" : ""
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
                        isActive ? "text-blue-500 font-semibold" : ""
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
                        isActive ? "text-blue-500 font-semibold" : ""
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
                      `hover:underline hover:text-lg ${
                        isActive ? "text-blue-500 font-semibold " : ""
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
                      `hover:underline hover:text-lg ${
                        isActive ? "text-blue-500 font-semibold " : ""
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
                      `hover:underline hover:text-lg ${
                        isActive ? "text-blue-500 font-semibold" : ""
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
                      `hover:underline hover:text-lg ${
                        isActive ? "text-blue-500 font-semibold" : ""
                      }`
                    }
                  >
                    Work
                  </NavLink>
                )}
              <div className="mt-auto space-y-4">
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center p-2 rounded-md">
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
              className="fixed inset-0 dark:bg-black opacity-50 sm:hidden h-full"
              onClick={toggleMenu}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
            <header className="flex justify-between items-center mb-4">
              <button className="sm:hidden p-2" onClick={toggleMenu}>
                {menuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex-grow flex justify-end mr-6">
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
              <div className="fixed bottom-4 right-4 p-4 dark:bg-gray-800 text-white rounded-lg shadow-lg">
                {notification}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
