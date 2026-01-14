import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slices/appSlice";
import { authReducer } from "./slices/authSlice";

const store = configureStore({
  reducer: {
    // stores the basic info about the app
    app: appReducer,
    auth: authReducer,
  },
});

export default store;
