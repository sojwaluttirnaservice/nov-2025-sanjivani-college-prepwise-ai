import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slices/appSlice";
import { authReducer } from "./slices/authSlice";
import resourceReducer from "./slices/resourceSlice";

const store = configureStore({
  reducer: {
    // stores the basic info about the app
    app: appReducer,
    auth: authReducer,
    resource: resourceReducer,
  },
});

export default store;
