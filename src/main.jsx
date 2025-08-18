import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { Toaster } from "react-hot-toast";

import App from './App.jsx';
import store from './redux/store.js';
import './index.css';
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

let persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </HelmetProvider>
    </PersistGate>
  </Provider>
  // </React.StrictMode>,
);
