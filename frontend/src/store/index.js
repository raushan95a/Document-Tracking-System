import { configureStore } from "@reduxjs/toolkit";
import documentFiltersReducer from "./documentFiltersSlice";

export const store = configureStore({
  reducer: {
    documentFilters: documentFiltersReducer,
  },
});
