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

export default function TodoForm() {
  const { user } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!["owner", "science"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todayDate, setTodayDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState("13:00");
  const [endDate, setEndDate] = useState("14:00");
  const [category, setCategory] = useState("lecturer");
  const [topic, setTopic] = useState("");
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
      if (!["owner", "science-e"].some((s) => user.role.includes(s))) {
        navigate("/404");
      }
      setMode("update");
      if (id) {
        setLoading(true);
        axiosClient
          .get(`/todos/${id}`)
          .then(({ data }) => {
            setLoading(false);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setTodayDate(data.today_date || "");
            setStartDate(formatTime(data.start_date) || "13:00");
            setEndDate(formatTime(data.end_date) || "14:00");
            setCategory(data.category || "lecturer");
            setTopic(data.topic || "");
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
          .get(`/todos/${id}`)
          .then(({ data }) => {
            setLoading(false);
            setTitle(data.title || "");
            setDescription(data.description || "");
            setTodayDate(data.today_date || "");
            setStartDate(formatTime(data.start_date) || "13:00");
            setEndDate(formatTime(data.end_date) || "14:00");
            setCategory(data.category || "lecturer");
            setTopic(data.topic || "");
          })
          .catch(() => {
            setLoading(false);
          });
      }
    }
  }, [pathname, id, user.role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let todoData = {
      title,
      description,
      todayDate,
      startDate,
      endDate,
      category,
      topic,
    };

    // Determine endpoint and method based on the form mode
    const endpoint = mode === "update" ? `/todos/${id}` : "/todos";
    const method = mode === "update" ? axiosClient.put : axiosClient.post;

    method(endpoint, todoData)
      .then(() => navigate("/science"))
      .catch((error) =>
        console.error(
          mode === "update" ? "Error updating todo" : "Error creating todo",
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
              <SelectItem value="lecturer">Lecturer</SelectItem>
              <SelectItem value="public_holidays">Public Holidays</SelectItem>
              <SelectItem value="no_lecturer">No Lecturer</SelectItem>
              <SelectItem value="time_e">Time E</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {category === "lecturer" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <Select
              value={title}
              onValueChange={(value) => setTitle(value)}
              className="mt-1 block w-full"
              disabled={mode === "show"} // Disable select in show mode
            >
              <SelectTrigger>
                <span>{title || "---select---"}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="django">Django</SelectItem>
                <SelectItem value="numpy">Numpy</SelectItem>
                <SelectItem value="pandas">Pandas</SelectItem>
                <SelectItem value="matplot_or_Seaborn">
                  matplotlib & Seaborn
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Topic
          </label>
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
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
            disabled={mode === "show"} // Disable textarea in show mode
          />
        </div>

        {(category === "lecturer" || category === "time_e") && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <Input
                type="time"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
                disabled={mode === "show"} // Disable input in show mode
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <Input
                type="time"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
                disabled={mode === "show"} // Disable input in show mode
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Today Date
          </label>
          <Input
            type="date"
            value={todayDate}
            onChange={(e) => setTodayDate(e.target.value)}
            className="mt-1"
            disabled={mode === "show"} // Disable input in show mode
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type={mode === "show" ? "button" : "submit"}
            className={`w-[100px] bg-blue-500 text-white hover:bg-blue-600 ${
              !["owner", "science-e"].some((s) => user.role.includes(s)) &&
              mode !== "create"
                ? "hidden"
                : ""
            } `}
            onClick={() => mode === "show" && navigate(`/science/${id}/edit`)}
          >
            {["owner", "science-e"].some((s) => user.role.includes(s)) &&
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
            onClick={() => navigate("/science")}
          >
            Go To Home
          </Button>
        </div>
      </form>
    </div>
  );
}
