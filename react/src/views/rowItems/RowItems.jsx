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
import { Download, Pen, Trash2 } from "lucide-react";

export default function RowItemShow() {
  const { user, setNotification } = useStateContext();
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    if (!["owner", "row"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);

  const getTodos = () => {
    setLoading(true);
    axiosClient
      .get(`/rows`)
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
    getTodos();
  }, []);

  const onDeleteClick = (todo) => {
    setSelectedTodo(todo);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTodo) {
      axiosClient
        .delete(`/row/${selectedTodo.id}`)
        .then(() => {
          setNotification("row was successfully deleted");
          getTodos();
        })
        .catch((e) => {
          setNotification("Error deleting todo", e);
        });
    }
    setIsAlertOpen(false);
    setSelectedTodo(null);
  };

  const handleDownload = async (id) => {
    try {
      const blob = await axiosClient.get(`/row/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(blob.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${id}_${Date.now()}__${Math.random()
          .toString(36)
          .substring(2, 10)}.zip`
      ); // File name for the download
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up
      window.URL.revokeObjectURL(url); // Release memory
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the file. Please try again.");
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) =>
          info.getValue()
            ? info.getValue().length > 25
              ? `${info.getValue().substring(0, 25)}...`
              : info.getValue()
            : " ",
      }),

      columnHelper.accessor("files", {
        header: "Files",
        cell: (info) => {
          const files = JSON.parse(info.getValue() || "[]");
          return files.length > 0
            ? files.map((file, index) => (
                <>
                  <div className="flex flex-wrap items-center justify-around gap-2">
                    <Link
                      key={index}
                      to={`${
                        import.meta.env.VITE_API_DOWNLOAD_URL
                      }/storage/${file}`}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                    >
                      View File {index + 1}
                    </Link>
                    {files.length > 0 && (
                      <Button
                        className="ml-4 hover:bg-blue-600"
                        onClick={() => handleDownload(info.row.original.id)}
                      >
                        <Download />
                      </Button>
                    )}
                  </div>
                </>
              ))
            : "No files";
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          user.role === "owner" || user.role === "admin" ? (
            <>
              <Link to={`/row/${row.original.id}`}>
                <Button
                  className="ml-4 hover:bg-blue-600"
                  onClick={() => onDeleteClick(row.original)}
                >
                  <Pen />
                </Button>
              </Link>

              {["owner", "row-d"].some((s) => user.role.includes(s)) && (
                <Button
                  className="ml-4 hover:bg-red-600"
                  onClick={() => onDeleteClick(row.original)}
                >
                  <Trash2 />
                </Button>
              )}
            </>
          ) : (
            <Link
              to={`/row/${row.original.id}`}
              className="text-blue-500 hover:underline"
            >
              Show
            </Link>
          ),
      }),
    ];

    // Conditionally add the "author" column if the user is an admin or owner
    if (user.role === "owner" || user.role === "admin") {
      baseColumns.push(
        columnHelper.accessor("author", {
          header: "Author",
          cell: (info) => info.getValue(),
        })
      );
    }

    return baseColumns;
  }, [columnHelper, user.role]);

  const filteredTodos = useMemo(() => {
    return (todos || []).filter(
      (todo) =>
        (todo.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
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
          Row Items
        </h1>
        <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center sm:space-x-4">
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md px-4 py-2 focus:outline-none focus:ring-2 sm:order-2 xl:w-[200px]"
          />
          <Button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:order-2 xl:w-[100px]"
            onClick={() => navigate("/row/new")}
          >
            Create
          </Button>
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
              No rows found.
            </div>
          )}
        </Card>
        <AlertDialogDemo
          open={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Are you sure you want to delete this todo? This action cannot be undone."
        />
      </div>
    </div>
  );
}
