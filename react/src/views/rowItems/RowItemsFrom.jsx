import { useState, useEffect } from "react";
import axiosClient from "../../axios-client.js";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useStateContext } from "@/context/ContextProvider.jsx";
import Loader from "@/components/ui/Loader.jsx";

export default function RowItemForm() {
  const { user } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!["owner", "row"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState(user.username);
  const [createAt, setCreateAt] = useState("");
  const [files, setFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]); // State to store file URLs
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create");
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (pathname.includes("/new")) {
      setMode("create");
    } else if (pathname.includes("/edit") && id) {
      if (!["owner", "row-e"].some((s) => user.role.includes(s))) {
        navigate("/404");
      }
      setMode("update");
      setLoading(true);
      axiosClient
        .get(`/row/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setTitle(data.title || "");
          setDescription(data.description || "");
          setAuthor(data.author || "");
          setCreateAt(data.created_at || "");
          if (data.files) {
            const parsedFiles = JSON.parse(data.files);
            setFileUrls(parsedFiles.map((file) => file.replace(/\\/, "/"))); // Normalize paths
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else if (pathname.includes("/") && id) {
      setMode("show");
      setLoading(true);
      axiosClient
        .get(`/row/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setTitle(data.title || "");
          setDescription(data.description || "");
          setAuthor(data.author || "");
          setCreateAt(data.created_at || "");
          if (data.files) {
            const parsedFiles = JSON.parse(data.files);
            setFileUrls(parsedFiles.map((file) => file.replace(/\\/, "/"))); // Normalize paths
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [pathname, id, user.role, navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("author", author || user.username);

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const endpoint = mode === "update" ? `/row/${id}` : "/row";
    const method = mode === "update" ? axiosClient.put : axiosClient.post;

    method(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(() => navigate("/row"))
      .catch((error) =>
        console.error(
          mode === "update"
            ? "Error updating Row Items"
            : "Error creating Row Items",
          error
        )
      );
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

  if (loading) {
    <div className="flex items-center justify-center p-4">
      <Loader />
    </div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <form onSubmit={handleSubmit} className="mt-4">
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
        {["owner", "row-e"].some((s) => user.role.includes(s)) && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <Input type="text" value={author} className="mt-1" disabled />
          </div>
        )}

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
            className={`w-[100px] bg-blue-500 text-white hover:bg-blue-600 ${
              !["owner", "row"].some((s) => user.role.includes(s)) &&
              mode !== "create"
                ? "hidden"
                : ""
            } `}
            onClick={() => mode === "show" && navigate(`/row/${id}/edit`)}
          >
            {["owner", "row"].some((s) => user.role.includes(s)) &&
            mode !== "create"
              ? mode === "update"
                ? "Update"
                : mode === "show"
                  ? "Edit"
                  : "Create"
              : mode === "create"
                ? "Create"
                : null}
          </Button>

          <Button
            type="button"
            className="w-[100px] bg-gray-500 text-white hover:bg-gray-600"
            onClick={() => navigate("/row")}
          >
            Go To Home
          </Button>
        </div>
      </form>
    </div>
  );
}
