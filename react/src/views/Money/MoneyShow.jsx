import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../../axios-client.js";
import { Button } from "@/components/ui/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import Loader from "@/components/ui/Loader.jsx";
import { Textarea } from "@/components/ui/Textarea.jsx";
import { useStateContext } from "@/context/ContextProvider.jsx";

export default function MoneyShow() {
  const { user } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!["owner", "money"].some((s) => user.role.includes(s))) {
      navigate("/404");
    }
  }, [user, navigate]);
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = () => {
    setLoading(true);
    axiosClient
      .get(`/money-management/${id}`)
      .then(({ data }) => {
        setEntry(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError("Error fetching data", err);
      });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="mb-4 flex w-full max-w-md flex-col items-start">
        <div className="mb-4 flex space-x-4">
          <Link to="deposite">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Deposit
            </Button>
          </Link>
          <Link to="withdraw">
            <Button className="bg-green-500 text-white hover:bg-green-600">
              Withdraw
            </Button>
          </Link>
          <Link to="remaining">
            <Button className="bg-gray-500 text-white hover:bg-gray-600">
              Remaining
            </Button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full rounded border p-2"
        />
      </div>
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Money Management Details
        </h1>
        {loading && <Loader />}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}
        {entry && !loading && (
          <div className="space-y-4">
            <div>
              <strong>Title:</strong> {entry.title}
            </div>
            <div>
              <strong>Give Money:</strong> {entry.givemoney}
            </div>
            <div>
              <strong>Date and Time:</strong> {entry.dateTime}
            </div>
            <div>
              <strong>Description:</strong>
              <Textarea
                value={entry.description}
                readOnly
                className="mt-2 w-full border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => navigate(`/money-management/${entry.id}/edit`)}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
