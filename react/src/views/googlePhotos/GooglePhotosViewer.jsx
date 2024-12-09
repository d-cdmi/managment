import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import Loader from "@/components/ui/loader.jsx";
import axiosClient from "@/axios-client.js";
import { useStateContext } from "@/context/ContextProvider";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

Modal.setAppElement("#root"); // Important for accessibility

const GooglePhotosFetch = () => {
  const { setNotification, notification } = useStateContext();
  const [allPhotos, setAllPhotos] = useState([]); // Store all fetched photos
  const [nextPageToken, setNextPageToken] = useState(null); // Track the next page token
  const [fullscreenImg, setFullscreenImg] = useState(""); // Store image for full screen
  const [showFullscreen, setShowFullscreen] = useState(false); // State to toggle full screen
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current image index
  const [formdata, setFormdata] = useState(true);
  const [accessToken, setAccessToken] = useState(null); // Store access token
  const [initialLoading, setInitialLoading] = useState(false); // Loading state for initial data load
  const [infiniteLoading, setInfiniteLoading] = useState(false); // Loading state for infinite scroll
  const observerRef = useRef(); // Ref for the observer
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    client_id: "",
    client_secret: "",
    refresh_token: "",
  });

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const getAccessToken = async () => {
    const { client_id, client_secret, refresh_token } = credentials;
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: refresh_token,
      grant_type: "refresh_token",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      formdata(true);
      throw new Error("Failed to get access token: " + response.statusText);
    }

    const data = await response.json();
    return data.access_token; // Return the access token
  };

  const fetchPhotos = async (pageToken, isInitialLoad = false) => {
    setNotification("new data Fetching");
    if (!accessToken) return;

    if (isInitialLoad) {
      setInitialLoading(true); // Show main loader only for initial load
    } else {
      setInfiniteLoading(true); // Show infinite loader for additional data
    }

    try {
      const url = `https://photoslibrary.googleapis.com/v1/mediaItems?pageToken=${
        pageToken || ""
      }`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch photos: " + response.statusText);
      }

      const data = await response.json();
      setAllPhotos((prevPhotos) => [...prevPhotos, ...(data.mediaItems || [])]);
      setNextPageToken(data.nextPageToken); // Update nextPageToken for pagination
    } catch (error) {
      setNotification(error.message);
    } finally {
      setInitialLoading(false); // Hide loader after initial load
      setInfiniteLoading(false); // Hide infinite scroll loader
    }
  };

  const handleFetchPhotos = async () => {
    try {
      setAllPhotos([]); // Clear photos before fetching new ones
      if (!accessToken) {
        const newAccessToken = await getAccessToken(credentials.refresh_token);
        setAccessToken(newAccessToken);
      } else {
        await fetchPhotos("", true); // Fetch initial set of photos
      }
    } catch (error) {
      setNotification(error.message);
    }
  };

  // Trigger fetchPhotos automatically when accessToken is set
  useEffect(() => {
    if (accessToken) {
      fetchPhotos("", true); // Fetch photos on initial load
    }
  }, [accessToken]);

  const showFullScreen = (index) => {
    setCurrentImageIndex(index);
    setFullscreenImg(allPhotos[index]?.baseUrl); // Set the source to the full image
    setShowFullscreen(true); // Show the full screen overlay
  };

  const closeFullScreen = () => {
    setShowFullscreen(false); // Hide the full screen overlay
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === allPhotos.length - 1 ? 0 : prevIndex + 1
    );
    setFullscreenImg(
      allPhotos[(currentImageIndex + 1) % allPhotos.length]?.baseUrl
    ); // Update full-screen image
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? allPhotos.length - 1 : prevIndex - 1
    );
    setFullscreenImg(
      allPhotos[(currentImageIndex - 1 + allPhotos.length) % allPhotos.length]
        ?.baseUrl
    ); // Update full-screen image
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setInitialLoading(true);

    // Check if save query parameter is available
    const saveQuery = new URLSearchParams(window.location.search).get("save");

    axiosClient
      .post("/google-photos", {
        ...credentials,
      })
      .then(async () => {
        setInitialLoading(false);
        setFormdata(false); // Hide the form after submission
        setNotification("Start the data Fetching");
        await handleFetchPhotos(); // Fetch photos after form submission
      })
      .catch(async (err) => {
        setNotification(err.message);
        if (saveQuery) {
          // Change here to check for the save query
          setNotification("Start the data Fetching");
          setFormdata(false); // Hide the form after submission
          await handleFetchPhotos(); // Fetch photos after form submission
        }
      })
      .finally(() => {
        setInitialLoading(false);
        setLoading(false);
      });
  };

  // Infinite scrolling functionality
  useEffect(() => {
    const loadMorePhotos = () => {
      if (nextPageToken && !showFullscreen) {
        fetchPhotos(nextPageToken, false); // Load additional photos without triggering main loader
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMorePhotos();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [nextPageToken, showFullscreen]); // Only run this effect when nextPageToken or showFullscreen changes
  const changesFormData = () => {
    setFormdata(!formdata);
  };

  return (
    <div className="container">
      {infiniteLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader /> {/* Smaller loader for infinite scroll */}
        </div>
      )}
      <h1
        className="cursor-pointer text-center text-5xl font-semibold"
        onClick={changesFormData}
      >
        {formdata ? "image" : "Go to Home"}{" "}
      </h1>
      {formdata ? (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-6xl p-4">
          {["client_id", "client_secret", "refresh_token"].map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-sm font-medium text-gray-300">
                {field}
              </label>
              <Input
                type="text"
                name={field}
                value={credentials[field]}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={loading}
            className="w-[150px] hover:bg-blue-600"
          >
            {loading ? "....." : "save"}
          </Button>
        </form>
      ) : (
        <div>
          {initialLoading ? (
            <div className="flex items-center justify-center p-4">
              {/* <Loader /> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allPhotos.map((photo, index) => (
                <div
                  className="overflow-visible rounded-lg object-cover p-2 shadow-lg"
                  key={photo.id}
                >
                  <img
                    src={`${photo.baseUrl}=w300`} // Add width parameter for smaller images
                    alt="Photo"
                    onClick={() => showFullScreen(index)} // Show full screen on click
                    className="m-2 w-full max-w-[300px] cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
          <div ref={observerRef} className="mb-5 h-5" />
          {infiniteLoading && !showFullscreen && (
            <div className="flex items-center justify-center p-4">
              <Loader /> {/* Smaller loader for infinite scroll */}
            </div>
          )}
          {showFullscreen && (
            <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-90">
              <X
                size={80}
                color="#5384a2"
                strokeWidth={2.75}
                onClick={closeFullScreen}
                className="absolute right-5 top-5 cursor-pointer rounded bg-opacity-50 px-4 py-2"
              />

              <ArrowLeft
                size={80}
                color="#5384a2"
                strokeWidth={2.75}
                onClick={handlePrevImage}
                className="absolute left-5 cursor-pointer rounded px-4 py-2"
              />

              <ArrowRight
                size={80}
                color="#5384a2"
                strokeWidth={2.75}
                onClick={handleNextImage}
                className="absolute right-5 cursor-pointer rounded bg-opacity-50 px-4 py-2"
              />

              <img
                src={fullscreenImg}
                alt="Full Screen"
                className="max-h-[90%] max-w-[90%]"
              />
            </div>
          )}
        </div>
      )}
      {notification && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-800 p-4 text-white shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default GooglePhotosFetch;
