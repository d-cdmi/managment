import { useState, useEffect } from "react";
import axiosClient from "../../axios-client.js";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.jsx";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useStateContext } from "@/context/ContextProvider.jsx";
import Loader from "@/components/ui/Loader.jsx";

export default function WorkForm() {
  const { user } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!(user.role === "owner" || user.role === "admin")) {
      navigate("/404");
    }
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [Today_date, setToday_date] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [start_time, setStart_time] = useState("13:00");
  const [end_time, setEnd_time] = useState("14:00");
  const [category, setCategory] = useState("Collage");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create"); // Track form mode
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;

  const formatTime = (time) => time.slice(0, 5);

  useEffect(() => {
    if (pathname.includes("/new")) {
      setMode("create");
    } else if (pathname.includes("/edit")) {
      if (!["owner", "work-e"].some((s) => user.role.includes(s))) {
        navigate("/404");
      }
      setMode("update");
      if (id) {
        setLoading(true);
        axiosClient
          .get(`/works/${id}`)
          .then(({ data }) => {
            setLoading(false);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setToday_date(data.Today_date || "");
            setStart_time(formatTime(data.start_time) || "13:00");
            setEnd_time(formatTime(data.end_time) || "14:00");
            setCategory(data.category || "Collage");
          })
          .catch(() => {
            setLoading(false);
          });
      }
    } else if (pathname.includes("/")) {
      setMode("show");
      if (id) {
        setLoading(true);
        axiosClient
          .get(`/works/${id}`)
          .then(({ data }) => {
            setLoading(false);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setToday_date(data.Today_date || "");
            setStart_time(formatTime(data.start_time) || "13:00");
            setEnd_time(formatTime(data.end_time) || "14:00");
            setCategory(data.category || "Collage");
          })
          .catch(() => {
            setLoading(false);
          });
      }
    }
  }, [pathname, id, user.role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let workData = {
      title,
      description,
      Today_date,
      start_time,
      end_time,
      category,
    };

    // Determine endpoint and method based on the form mode
    const endpoint = mode === "update" ? `/works/${id}` : "/works";
    const method = mode === "update" ? axiosClient.put : axiosClient.post;

    method(endpoint, workData)
      .then(() => navigate("/work"))
      .catch((error) =>
        console.error(
          mode === "update" ? "Error updating work" : "Error creating work",
          error
        )
      );
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
            Category
          </label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
            className="mt-1 block w-full"
            disabled={mode === "show"} // Disable select in show mode
          >
            <SelectTrigger>
              <span>{category || "---select---"}</span>
            </SelectTrigger>
            <SelectContent>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            disabled={mode === "show"} // Disable input in show mode
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <Input
            type="time"
            value={start_time}
            onChange={(e) => setStart_time(e.target.value)}
            className="mt-1"
            disabled={mode === "show"}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <Input
            type="time"
            value={end_time}
            onChange={(e) => setEnd_time(e.target.value)}
            className="mt-1"
            disabled={mode === "show"} // Disable input in show mode
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Today Date
          </label>
          <Input
            type="date"
            value={Today_date}
            onChange={(e) => setToday_date(e.target.value)}
            className="mt-1"
            disabled={mode === "show"} // Disable input in show mode
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type={mode === "show" ? "button" : "submit"}
            className={`w-[100px] bg-blue-500 text-white hover:bg-blue-600 ${
              !["owner", "work-e"].some((s) => user.role.includes(s)) &&
              mode !== "create"
                ? "hidden"
                : ""
            } `}
            onClick={() => mode === "show" && navigate(`/work/${id}/edit`)}
          >
            {["owner", "work-e"].some((s) => user.role.includes(s)) &&
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
            onClick={() => navigate("/work")}
          >
            Go To Home
          </Button>
        </div>
      </form>
    </div>
  );
}
