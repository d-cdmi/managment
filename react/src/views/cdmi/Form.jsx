import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import {
  useGetOneTaskQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/apiSlice.js";
import Loader from "@/components/ui/Loader";
import ErrorDialog from "@/components/ErrorDialog";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function CdmiDataForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState(
    Math.floor(Math.random() * (999 - 111 + 1)) + 111
  );
  const [description, setDescription] = useState("");
  const [createAt, setCreateAt] = useState("");
  const [files, setFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [mode, setMode] = useState("create");
  const [fingerprint, setFingerprint] = useState("");

  const {
    data: rowData,
    isFetching: isLoadingRow,
    error: ErrorMsgGetOne,
    isError: isErrorgetOne,
  } = useGetOneTaskQuery(id, {
    skip: !id || pathname.includes("/new"), // Skip query for "create" mode
  });

  useEffect(() => {
    // Initialize FingerprintJS and get the unique identifier for the device
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load(); // Load the FingerprintJS script
      const result = await fp.get(); // Get the fingerprint ID

      // Set the fingerprint ID to state
      setFingerprint(result.visitorId);
      console.log("Unique Fingerprint ID:", result.visitorId); // Logs the fingerprint ID to the console
      console.log(typeof result.visitorId); // Logs the fingerprint ID to the console
    };

    getFingerprint();
  }, []);

  const [
    addTask,
    { isLoading: isCreating, error: ErrorMsgAdd, isError: isErrorAdd },
  ] = useAddTaskMutation();
  const [
    updateTask,
    { isLoading: isUpdating, error: ErrorMsgUpdate, isError: isErrorUpdate },
  ] = useUpdateTaskMutation();

  useEffect(() => {
    if (pathname.includes("/new")) {
      setMode("create");
    } else if (pathname.includes("/edit") && id) {
      setMode("update");
    } else if (pathname.includes("/") && id) {
      setMode("show");
    }

    if (rowData) {
      setTitle(rowData.title || "");
      setDescription(rowData.description || "");
      setCreateAt(rowData.created_at || "");
      if (rowData.files) {
        const parsedFiles = JSON.parse(rowData.files);
        setFileUrls(parsedFiles.map((file) => file.replace(/\\/, "/"))); // Normalize paths
      }
    }
  }, [pathname, id, rowData]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pwd", pin);
    formData.append("fingerprint", fingerprint);
    formData.append("description", description || ""); // Ensure description is not undefined
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    try {
      if (mode === "create") {
        await addTask(formData).unwrap();
      } else if (mode === "update") {
        await updateTask({ id, formData }).unwrap();
      }
      navigate("/cdmi-data");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getFileType = (url) => {
    if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png")) {
      return "image";
    } else if (url.endsWith(".pdf")) {
      return "pdf";
    } else {
      return "other";
    }
  };

  if (isLoadingRow || isCreating || isLoadingRow || isUpdating) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-center p-4">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-6xl p-6">
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mx-auto mb-6">
          <h4 className="block text-lg font-medium">
            Delete Pin : <span className="text-lm font-extrabold">{pin}</span>
          </h4>
          <Input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-1"
            disabled={mode === "show"}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            disabled={mode === "show"}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            disabled={mode === "show"}
          />
        </div>
        {mode !== "create" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Created At
            </label>
            <Input type="text" value={createAt} className="mt-1" disabled />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Files
          </label>
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="text-white-400 mt-1"
            disabled={mode === "show" || mode === "update"}
          />
          {mode === "show" && fileUrls.length > 0 && (
            <div className="mt-2">
              {fileUrls.map((ur, index) => {
                const url = `${
                  import.meta.env.VITE_API_DOWNLOAD_URL
                }/storage/${ur}`;
                const fileType = getFileType(url);
                return (
                  <div key={index} className="mb-2">
                    {fileType === "image" ? (
                      <div>
                        <img
                          src={url}
                          alt={`File ${index + 1}`}
                          className="max-h-40 max-w-xs object-cover"
                        />
                        <Link
                          to={url}
                          download
                          className="text-blue-600 hover:underline"
                        >
                          Download Image {index + 1}
                        </Link>
                      </div>
                    ) : fileType === "pdf" ? (
                      <div>
                        <Link
                          to={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View PDF {index + 1}
                        </Link>
                        <Link
                          to={url}
                          download
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          Download PDF {index + 1}
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <Link
                          to={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View File {index + 1}
                        </Link>
                        <Link
                          to={url}
                          download
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          Download File {index + 1}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <Button
            type={mode === "show" ? "button" : "submit"}
            className="w-[100px] bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => mode === "show" && navigate(`/cdmi-data/${id}/edit`)}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating
              ? "Loading..."
              : mode === "update"
                ? "Update"
                : mode === "show"
                  ? "Edit"
                  : "Create"}
          </Button>

          <Button
            type="button"
            className="w-[100px] bg-gray-500 text-white hover:bg-gray-600"
            onClick={() => navigate("/cdmi-data")}
          >
            Go To Home
          </Button>
        </div>
      </form>
      {(ErrorMsgGetOne || ErrorMsgAdd || ErrorMsgUpdate) && (
        <ErrorDialog
          msg={
            isErrorgetOne?.status || isErrorAdd?.status || isErrorUpdate?.status
          }
          errorTitle={
            isErrorgetOne?.data?.message ||
            isErrorAdd?.data?.message ||
            isErrorUpdate?.data?.message
          }
        />
      )}
    </div>
  );
}
