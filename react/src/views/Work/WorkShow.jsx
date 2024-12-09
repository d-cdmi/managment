import { useState, useEffect } from "react";
import axiosClient from "../../axios-client.js";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loader from "@/components/ui/loader";
import { useStateContext } from "@/context/ContextProvider.jsx";
import { AlertDialogDemo } from "@/components/AlertDialogDemo.jsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export default function WorkShow() {
  const { user, setNotification } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!["owner", "work"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);
  const [works, setWorks] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  function getWork() {
    axiosClient
      .get(`/works${category !== "all" ? `?category=${category}` : ""}`)
      .then((response) => {
        setWorks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching works", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    setLoading(true);
    getWork();
  }, [category]);

  const onDeleteClick = (work) => {
    setSelectedUser(work);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      axiosClient
        .delete(`/works/${selectedUser.id}`)
        .then(() => {
          setNotification("Work was successfully deleted");
          getWork();
        })
        .catch((e) => {
          setNotification("Error deleting Work", e);
        });
    }
    setIsAlertOpen(false);
    setSelectedUser(null);
  };
  return (
    <div className="mx-auto p-4">
      <div className="mb-4 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="text-2xl font-semibold">Daliy Works</h1>
        <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center sm:space-x-4">
          <div className="mb-4 mr-6 w-full sm:order-1 sm:mb-0 sm:w-1/2">
            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
              className="mt-1 block w-full"
            >
              <SelectTrigger className="xl:w-[150px]">
                <span>{category || "---select---"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Collage">Collage</SelectItem>
                <SelectItem value="Coding">Coding</SelectItem>
                <SelectItem value="HomeWork">HomeWork</SelectItem>
                <SelectItem value="Soical_Media">Soical Media</SelectItem>
                <SelectItem value="Playing">Playing</SelectItem>
                <SelectItem value="Self_Learning">Self Learning</SelectItem>
                <SelectItem value="Data_Scinece">Data Scinece</SelectItem>
                <SelectItem value="Time_Pass">Time Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create button */}
          <Button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:order-2 xl:w-[100px]"
            onClick={() => navigate("/work/new")}
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
          ) : works.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell className="hidden md:table-cell">
                    Description
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      <Link
                        to={`/work/${work.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {work.Today_date}
                      </Link>
                    </TableCell>
                    <TableCell>{work.category.toUpperCase()}</TableCell>
                    <TableCell>{work.title}</TableCell>
                    <TableCell>{work.start_time}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {work.description
                        ? work.description.length > 20
                          ? `${work.description.substring(0, 35)}...`
                          : work.description
                        : " "}
                    </TableCell>
                    {["owner", "work-d"].some((s) => user.role.includes(s)) && (
                      <TableCell>
                        <Button
                          className="ml-4 bg-red-500 text-white hover:bg-red-600"
                          onClick={() => onDeleteClick(work)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
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
          description="Are you sure you want to delete this work? This action cannot be undone."
        />
      </div>
    </div>
  );
}
