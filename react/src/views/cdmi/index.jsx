import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu.jsx";
import { Download, Trash2 } from "lucide-react";
import {
  useBlockedFingerprintMutation,
  useDeleteTaskMutation,
  useDownloadTaskMutation,
  useGetTasksQuery,
  useToggleVisiblieMutation,
} from "@/redux/apiSlice.js";
import ErrorDialog from "@/components/ErrorDialog";
export default function CdmiData() {
  const navigate = useNavigate();
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [darkMode, setDarkMode] = useState("dark");
  const [fingerprint, setFingerprint] = useState();

  const {
    data: todos,
    isLoading: isgetTaskLoading,
    error: ErrorMsgTask,
    isError: isErroringet,
    refetch,
  } = useGetTasksQuery();
  const [
    deleteTask,
    {
      isLoading: isdeletingLoading,
      error: ErrorMsgDelete,
      isError: isErrordelete,
    },
  ] = useDeleteTaskMutation();
  const [
    downloadTask,
    {
      isLoading: isdownloadingLoading,
      error: ErrorMsgDownload,
      isError: isErrordownload,
    },
  ] = useDownloadTaskMutation();

  const [toggleVisiblie] = useToggleVisiblieMutation();
  const [blockedFingerprint] = useBlockedFingerprintMutation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode === "dark");
  }, [darkMode]);

  const onDeleteClick = (todo) => {
    setSelectedTodo(todo);

    deleteTask({ id: todo.id });
    setSelectedTodo(null);
  };

  const handleToggleVisiblie = async (data) => {
    try {
      const response = await toggleVisiblie(data.id).unwrap();
      // console.log("Visibility toggled:", response);
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
    refetch();
  };
  const handleFingerprintBlock = async (data) => {
    console.log(data);
    try {
      // Send the fingerprint to the API
      const response = await blockedFingerprint(data.fingerprint).unwrap();

      // Assuming the response has the fingerprint information, store it in state
      setFingerprint(response);

      // Log the response for debugging purposes
      console.log("Fingerprint toggled:", response.isBlocked);
      alert(response.isBlocked);
    } catch (error) {
      // Handle any error that occurs during the mutation
      console.error("Failed to toggle visibility:", error);
    }

    // Refetch the tasks to update the table if needed
    refetch();
  };

  const handleConfirmDelete = () => {
    deleteTask({ id: selectedTodo.id });
    setIsAlertOpen(false);
    setSelectedTodo(null);
  };

  const handleDownload = async (data) => {
    try {
      const blob = await downloadTask(data.id).unwrap();
      console.log(downloadTask.response?.headers);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      console.log(url);
      link.setAttribute(
        "download",
        `${data.id}_${Date.now()}_${data.title}_${Math.random()
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
            ? info.getValue()?.length > 25
              ? `${info.getValue().substring(0, 25)}...`
              : info.getValue()
            : " ",
      }),
      columnHelper.accessor("fingerprint", {
        header: "fingerprint",
        cell: (info) => (
          <Button
            onClick={() => handleFingerprintBlock(info.row.original)}
            className={`${info.row.original.isBlocked && "bg-red-500"} `}
          >
            {info.getValue()
              ? info.getValue().length > 25
                ? `${info.getValue().substring(0, 25)}...`
                : info.getValue()
              : "No Fingerprint"}
          </Button>
        ),
      }),
      columnHelper.accessor("ip", {
        header: "ip",
        cell: (info) =>
          info.getValue()
            ? info.getValue()?.length > 25
              ? `${info.getValue().substring(0, 25)}...`
              : info.getValue()
            : " ",
      }),
      columnHelper.accessor("created_at", {
        header: "created_at",
        cell: (info) =>
          info.getValue()
            ? info.getValue()?.length > 25
              ? `${info.getValue().substring(0, 25)}...`
              : info.getValue()
            : " ",
      }),
      columnHelper.accessor("isDelete", {
        header: "isDelete",
        cell: (info) => (
          <button
            onClick={() => handleToggleVisiblie(info.row.original)}
            className={`btn ${
              info.getValue() === 0 ? "btn-success" : "btn-danger"
            }`}
          >
            {info.getValue() === 0 ? "Active" : "Deleted"}
          </button>
        ),
      }),

      columnHelper.accessor("files", {
        header: "Files",
        cell: (info) => {
          const files = JSON.parse(info.getValue() || "[]");
          return files?.length > 0
            ? files.map((file, index) => (
                <p key={index}>View File {index + 1}</p>
              ))
            : "No files";
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const files = row.original.files
            ? JSON.parse(row.original.files)
            : [];
          return (
            <div className="flex flex-wrap items-center justify-around gap-2">
              {files.length > 0 && (
                <Button onClick={() => handleDownload(row.original)}>
                  <Download />
                </Button>
              )}
              <Button
                className="hover:bg-red-600"
                onClick={() => onDeleteClick(row.original)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        },
      }),
    ];

    return baseColumns;
  }, []);

  const table = useReactTable({
    data: todos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isdeletingLoading || isgetTaskLoading || isdownloadingLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center p-4">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-6xl">
      <div className="mb-4 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="text-2xl font-semibold">Date For معنی</h1>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:space-x-4">
          <Input
            type="text"
            placeholder="Search"
            className="rounded-md px-4 py-2 focus:outline-none focus:ring-2 sm:order-2 xl:w-[200px]"
          />
          <Button
            className="rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:order-2 xl:w-[100px]"
            onClick={() => navigate("/cdmi-data/new")}
          >
            Create
          </Button>
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
        </div>
      </div>

      <div className="mt-8">
        <Card className="overflow-x-auto">
          {todos?.length > 0 ? (
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
          description="Are you sure you want to delete this row item? This action cannot be undone."
        />
      </div>
      {(isErroringet || isErrordelete || isErrordownload) && (
        <ErrorDialog
          msg={
            ErrorMsgDelete?.status ||
            ErrorMsgTask?.data?.status ||
            ErrorMsgDownload?.status
          }
          errorTitle={
            ErrorMsgDelete?.data?.message ||
            ErrorMsgTask?.data?.message ||
            ErrorMsgDownload?.data?.message
          }
        />
      )}
    </div>
  );
}
