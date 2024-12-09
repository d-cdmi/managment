import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
    async onError(response) {
      if (response.status === 401) {
        // Refresh the token here or redirect to login
        console.log("Token expired, redirecting to login");
        localStorage.removeItem("ACCESS_TOKEN");
        window.location.href = "/login"; // Redirect to login page
      }
    },
  }),
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    // Fetch all tasks, with optional pagination and filtering
    getTasks: builder.query({
      query: () => {
        let query = `/cdmi-data`;
        return query;
      },
      providesTags: ["Tasks"],
    }),

    // Fetch a single task by ID
    getOneTask: builder.query({
      query: (id) => `/cdmi-data/${id}`,
      providesTags: ["Tasks"],
    }),
    toggleVisiblie: builder.mutation({
      query: (id) => `/cdmi-data/${id}/toggle`,
      providesTags: ["Tasks"],
    }),
    blockedFingerprint: builder.mutation({
      query: (id) => `/cdmi-data-fingerprint/${id}`,
      providesTags: ["Tasks"],
    }),

    // Add a new task
    addTask: builder.mutation({
      query: (task) => ({
        url: `/cdmi-data`,
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),

    // Update an existing task
    updateTask: builder.mutation({
      query: ({ id, ...updatedTask }) => ({
        url: `/cdmi-data/${id}`,
        method: "PUT",
        body: updatedTask,
      }),

      invalidatesTags: ["Tasks"],
    }),

    // Delete a task by ID
    deleteTask: builder.mutation({
      query: ({ id }) => ({
        url: `/cdmi-data/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    // Download a task-related file
    downloadTask: builder.mutation({
      query: (id) => ({
        url: `/cdmi-data/${id}/download`,
        method: "GET",
        responseHandler: (response) => response.blob(), // Ensure binary response
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetTasksQuery,
  useGetOneTaskQuery,
  useAddTaskMutation,
  useToggleVisiblieMutation,
  useBlockedFingerprintMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDownloadTaskMutation,
} = api;
