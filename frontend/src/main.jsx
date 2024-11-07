import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './main.css'

import ErrorPage from "./routes/ErrorPage";
import Home from "./routes/Home";
import LogIn from "./routes/LogIn";
import SignUp from "./routes/SignUp";
import SignSprinter from "./routes/SignSprinter";
import Lobby from "./routes/Lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />
  },
  {
    path: "login",
    element: <LogIn />,
    errorElement: <ErrorPage />
  },
  {
    path: "signup",
    element: <SignUp />,
    errorElement: <ErrorPage />
  },
  {
    path: "/play",
    element: <SignSprinter />,
    errorElement: <ErrorPage />,
  },
  {
    path: "play/:lobbyId",
    element: <Lobby />,
    errorElement: <ErrorPage />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
