import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import Loader from "@/components/ui/loader.jsx";
import axiosClient from "@/axios-client.js";
import { useStateContext } from "@/context/ContextProvider";
import Lightbox from "yet-another-react-lightbox";
import {
  Captions,
  Fullscreen,
  Thumbnails,
  Zoom,
} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import MediaItem from "./MediaItem";

Modal.setAppElement("#root"); // Important for accessibility

const GooglePhotosFetch = () => {
  const { setNotification, notification } = useStateContext();
  const [index, setIndex] = useState(-1);
  const [data, setData] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null); // Track the next page token
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
      const url = `https://photoslibrary.googleapis.com/v1/mediaItems?pageToken=${pageToken || ""
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
      setData((prevPhotos) => [...prevPhotos, ...(data.mediaItems || [])]);
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
      setData([]); // Clear photos before fetching new one
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
      if (nextPageToken) {
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
  }, [nextPageToken]); // Only run this effect when nextPageToken 
  const changesFormData = () => {
    setFormdata(!formdata);
  };

  const slides = data?.map(
    (item) => {
      const isVideo = item.mimeType.startsWith("video/");
      if (isVideo) {
        return {
          type: "video",
          width: parseInt(item.mediaMetadata.width),
          height: parseInt(item.mediaMetadata.height),
          poster: `${item.baseUrl}=w1600-h1600`,
          sources: [
            {
              src: `${item.baseUrl}=dv`,
              type: item.mimeType,
            },
          ],
        };
      }
      return {
        src: `${item.baseUrl}=w1600-h1600`,
      };
    }
  );

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
            <>
              <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                  {data?.map((item, idx) => (
                    <MediaItem
                      key={item.id}
                      item={item}
                      index={idx}
                      onItemClick={setIndex}
                    />
                  ))}
                </div>
              </div>
              <Lightbox
                plugins={[Captions, Fullscreen, Zoom, Thumbnails, Video]}
                captions={{
                  showToggle: true,
                  descriptionTextAlign: "start",
                }}
                styles={{
                  container: { backgroundColor: "rgba(0, 0, 0, .95)" },
                  thumbnail: { borderRadius: "4px" },
                }}
                open={index >= 0}
                close={() => setIndex(-1)}
                index={index}
                slides={slides}
              />
            </>
          )}
          <div ref={observerRef} className="mb-5 h-5" />
          {infiniteLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader /> {/* Smaller loader for infinite scroll */}
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