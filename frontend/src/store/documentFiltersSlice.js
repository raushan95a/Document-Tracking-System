import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
  search: "",
  status: "",
  department: "",
};

const documentFiltersSlice = createSlice({
  name: "documentFilters",
  initialState: {
    dashboard: initialFilters,
    admin: initialFilters,
  },
  reducers: {
    setDashboardFilters: (state, action) => {
      state.dashboard = {
        ...state.dashboard,
        ...action.payload,
      };
    },
    setAdminFilters: (state, action) => {
      state.admin = {
        ...state.admin,
        ...action.payload,
      };
    },
    resetDashboardFilters: (state) => {
      state.dashboard = initialFilters;
    },
    resetAdminFilters: (state) => {
      state.admin = initialFilters;
    },
  },
});

export const {
  setDashboardFilters,
  setAdminFilters,
  resetDashboardFilters,
  resetAdminFilters,
} = documentFiltersSlice.actions;

export default documentFiltersSlice.reducer;
