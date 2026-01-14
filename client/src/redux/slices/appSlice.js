import { createSlice } from "@reduxjs/toolkit";
import clientConfig from "../../config/clientConfig";


const initialState = {
  name: clientConfig.APP_NAME,
  version: "1.0.0",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
});

const appReducer = appSlice.reducer;

export { appReducer };
