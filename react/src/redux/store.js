import { configureStore } from "@reduxjs/toolkit";
import { api } from "./apiSlice";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values for RTK Query actions
        ignoredActions: [
          "api/executeMutation/fulfilled",
          "api/executeQuery/fulfilled",
        ],
        // Ignore non-serializable values in RTK Query state
        ignoredPaths: ["api.mutations", "api.queries"],
      },
    }).concat(api.middleware),
});

export default store;
