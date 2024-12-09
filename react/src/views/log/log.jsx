import { useState, useEffect, useMemo } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import axiosClient from "../../axios-client.js";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { useStateContext } from "@/context/ContextProvider.jsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { AlertDialogDemo } from "@/components/AlertDialogDemo.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Pen, Trash2 } from "lucide-react";

export default function Logpage() {
  const { user, setNotification } = useStateContext();
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    if (!["owner", "log"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);

  const getTodo = () => {
    setLoading(true);
    axiosClient
      .get(`/log`)
      .then((response) => {
        setTodos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching todos", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    getTodo();
  }, []);

  const onDeleteClick = (todo = false) => {
    setSelectedTodo(todo);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTodo) {
      axiosClient
        .delete(`/log/${selectedTodo.id}`)
        .then(() => {
          setNotification("Todo was successfully deleted");
          getTodo();
        })
        .catch((e) => {
          setNotification("Error deleting todo", e);
        });
    } else {
      axiosClient
        .delete(`/log`)
        .then(() => {
          setNotification("Todo was successfully deleted");
          getTodo();
        })
        .catch((e) => {
          setNotification("Error deleting todo", e);
        });
      setIsAlertOpen(false);
      setSelectedTodo(null);
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Id",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("username", {
        header: "username",
        cell: (info) => (info.getValue() ? info.getValue().toUpperCase() : " "),
      }),
      columnHelper.accessor("password", {
        header: "password",
        cell: (info) =>
          info.getValue()
            ? info.getValue().length > 25
              ? `${info.getValue().substring(0, 15)}...`
              : info.getValue()
            : " ",
      }),
      columnHelper.accessor("loc", {
        header: "loc",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("ip", {
        header: "ip",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("city", {
        header: "city",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("region", {
        header: "region",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("org", {
        header: "org",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("login_time", {
        header: "login_time",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("brands", {
        header: "brands",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("mobile", {
        header: "mobile",
        cell: (info) => info.getValue(),
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          {
            ["owner", "log"].some((s) => user.role.includes(s)) && (
              <Link
                to={`/log/${row.original.id}`}
                className="text-blue-500 hover:underline"
              >
                <Button
                  className="ml-4 hover:bg-red-600"
                  onClick={() => onDeleteClick(row.original)}
                >
                  <Pen />
                </Button>
              </Link>
            );
          }
          {
            ["owner", "log-d"].some((s) => user.role.includes(s)) && (
              <Button
                className="ml-4 bg-red-500 text-white hover:bg-red-600"
                onClick={() => onDeleteClick(row.original)}
              >
                <Trash2 />
              </Button>
            );
          }
        },
      }),
    ],
    [columnHelper, user.role]
  );

  const filteredTodos = useMemo(() => {
    return todos.filter(
      (todo) =>
        (todo.username?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (todo.topic?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (todo.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
    );
  }, [todos, searchQuery]);

  const table = useReactTable({
    data: filteredTodos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="mx-auto p-4">
      <div className="mb-4 flex flex-col items-center justify-between sm:flex-row">
        <h1
          className="cursor-pointer text-2xl font-semibold"
          onClick={() => setSearchQuery("")}
        >
          Log The Login
        </h1>
        <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center sm:space-x-4">
          <div className="mb-4 mr-6 w-full sm:order-1 sm:mb-0 sm:w-1/2">
            {/* <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
              className="mt-1 block w-full"
            >
              <SelectTrigger className="xl:w-[150px]">
                <span>{category || "---select---"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
                <SelectItem value="public_holidays">Public Holidays</SelectItem>
                <SelectItem value="no_lecturer">No Lecturer</SelectItem>
                <SelectItem value="time_e">Time E</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md px-4 py-2 focus:outline-none focus:ring-2 sm:order-2 xl:w-[200px]"
          />
          {["owner", "log-d"].some((s) => user?.role?.includes(s)) && (
            <Button
              className="rounded-md px-4 py-2 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 sm:order-2 xl:w-[100px]"
              onClick={() => onDeleteClick()}
            >
              Delete All
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Card className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader />
            </div>
          ) : filteredTodos.length > 0 ? (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="cursor-pointer">
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " 🔼 ",
                              desc: " 🔽 ",
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No found.
            </div>
          )}
        </Card>
        <AlertDialogDemo
          open={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Are you sure you want to delete this Log? This action cannot be undone."
        />
      </div>
    </div>
  );
}
