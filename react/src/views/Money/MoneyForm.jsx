import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/Input.jsx";
import axiosClient from "../../axios-client.js";
import { Button } from "@/components/ui/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Alert } from "@/components/ui/Alert.jsx";
import Loader from "@/components/ui/Loader.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { AlertDialogDemo } from "@/components/AlertDialogDemo.jsx";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select.jsx";
import { useStateContext } from "../../context/ContextProvider.jsx";

export default function MoneyForm() {
  const { user, setNotification } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!(user.role === "owner" || user.role === "admin")) {
      navigate("/404");
    }
  });
  const { id } = useParams(); // Get the ID from the URL parameters

  const [formData, setFormData] = useState({
    title: "",
    money: "",
    description: "",
    dateTime: getTodayDate(),
    whoToTake: "",
    ToGivemoney: "",
    toDaydate: getTodayDate(),
    toTakeDate: getTodayDate(),
    category: "deposite",
    moneyType: "cash",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  const categoryOptions = ["deposite", "withdraw", "remaining"];
  const moneyTypeOptions = ["cash", "online"];

  useEffect(() => {
    if (id) {
      // If an ID is provided, fetch the data for the form
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axiosClient.get(`/money-management/${id}`);
          setFormData(response.data);
        } catch (err) {
          setNotification(err.message);
          setShowAlertDialog(true);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, setNotification]);

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);

    try {
      if (id) {
        // If there's an ID, update the existing entry
        await axiosClient.put(`/money-management/${id}`, formData);
        setNotification("Data was successfully updated");
      } else {
        // Otherwise, create a new entry
        await axiosClient.post("/money-management", formData);
        setNotification("Data was successfully saved");
      }
      navigate("/money-management");
    } catch (err) {
      setLoading(false);
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
        setNotification("Failed to save data");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md bg-white p-8 text-black dark:bg-gray-800 dark:text-white">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          {id
            ? `Edit ${
                formData.category.charAt(0).toUpperCase() +
                formData.category.slice(1)
              }`
            : `New ${
                formData.category.charAt(0).toUpperCase() +
                formData.category.slice(1)
              } Entry`}
        </h1>
        {loading && <Loader />}
        {errors && Object.keys(errors).length > 0 && (
          <Alert variant="error" className="mb-4">
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </Alert>
        )}
        {!loading && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium dark:text-gray-200">
                Money Type
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prevForm) => ({ ...prevForm, category: value }))
                }
                className="mt-1 block w-full"
              >
                <SelectTrigger>
                  <span>
                    {formData.category.charAt(0).toUpperCase() +
                      formData.category.slice(1)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-200">Title</span>
              <Input
                type="text"
                value={formData.title}
                onChange={(ev) =>
                  setFormData((prevForm) => ({
                    ...prevForm,
                    title: ev.target.value,
                  }))
                }
                placeholder="Title"
                required
                className="mt-1 w-full"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 dark:text-gray-200">
                Description
              </span>
              <Textarea
                value={formData.description}
                onChange={(ev) =>
                  setFormData((prevForm) => ({
                    ...prevForm,
                    description: ev.target.value,
                  }))
                }
                placeholder="Description"
                rows="4"
                className="mt-1 w-full border p-2"
              />
            </label>

            <div className="mb-4">
              <label className="block text-sm font-medium dark:text-gray-200">
                Money Type
              </label>
              <Select
                value={formData.moneyType}
                onValueChange={(value) =>
                  setFormData((prevForm) => ({ ...prevForm, moneyType: value }))
                }
                className="mt-1 block w-full"
              >
                <SelectTrigger>
                  <span>{formData.moneyType || "---select---"}</span>
                </SelectTrigger>
                <SelectContent>
                  {moneyTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.category === "deposite" && (
              <>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    Total Money
                  </span>
                  <Input
                    type="number"
                    value={formData.money}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        money: ev.target.value,
                      }))
                    }
                    placeholder="Total Money"
                    required
                    className="mt-1 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    Who to Take
                  </span>
                  <Input
                    type="text"
                    value={formData.whoToTake}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        whoToTake: ev.target.value,
                      }))
                    }
                    placeholder="Who to Take"
                    className="mt-1 w-full"
                  />
                </label>
              </>
            )}

            {formData.category === "withdraw" && (
              <>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    Money
                  </span>
                  <Input
                    type="number"
                    value={formData.money}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        money: ev.target.value,
                      }))
                    }
                    placeholder="Money"
                    required
                    className="mt-1 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    To Give Money
                  </span>
                  <Input
                    type="text"
                    value={formData.ToGivemoney}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        ToGivemoney: ev.target.value,
                      }))
                    }
                    placeholder="To Give Money"
                    className="mt-1 w-full"
                  />
                </label>
              </>
            )}

            {formData.category === "remaining" && (
              <>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    Money
                  </span>
                  <Input
                    type="number"
                    value={formData.money}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        money: ev.target.value,
                      }))
                    }
                    placeholder="Money"
                    required
                    className="mt-1 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    Who to Take
                  </span>
                  <Input
                    type="text"
                    value={formData.whoToTake}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        whoToTake: ev.target.value,
                      }))
                    }
                    placeholder="Who to Take"
                    className="mt-1 w-full"
                  />
                </label>

                <label className="block">
                  <span className="text-gray-700 dark:text-gray-200">
                    To Take Date
                  </span>
                  <Input
                    type="date"
                    value={formData.toTakeDate}
                    onChange={(ev) =>
                      setFormData((prevForm) => ({
                        ...prevForm,
                        toTakeDate: ev.target.value,
                      }))
                    }
                    placeholder="To Take Date"
                    className="mt-1 w-full"
                  />
                </label>
              </>
            )}
            <label className="block">
              <span className="text-gray-700 dark:text-gray-200">
                Today Date
              </span>
              <Input
                type="date"
                value={formData.toDaydate}
                onChange={(ev) =>
                  setFormData((prevForm) => ({
                    ...prevForm,
                    toDaydate: ev.target.value,
                  }))
                }
                placeholder="To Give Date"
                className="mt-1 w-full"
              />
            </label>

            <Button type="submit" className="mt-4">
              {id ? "Update" : "Submit"}
            </Button>
          </form>
        )}
      </Card>
      <AlertDialogDemo
        open={showAlertDialog}
        onClose={() => navigate("/money")}
        onConfirm={() => window.location.reload()}
        description="Failed to fetch data. Please try again or go to the home page."
      />
    </div>
  );
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) {
    dd = `0${dd}`;
  }
  if (mm < 10) {
    mm = `0${mm}`;
  }

  return `${yyyy}-${mm}-${dd}`;
}
