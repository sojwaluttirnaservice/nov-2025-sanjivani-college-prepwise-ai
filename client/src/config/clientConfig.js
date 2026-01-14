const clientConfig = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || "PrepWise AI",

  PROJECT_ENV: import.meta.env.VITE_PROJECT_ENV,
};

export default clientConfig;
