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
import SignSprinter, { action as playAction } from "./routes/SignSprinter";
import Lobby, { loader as lobbyLoader } from "./routes/Lobby";
import JoinLobby, { loader as joinLoader } from "./routes/JoinLobby";
import LobbyList, { loader as lobbyListLoader } from "./routes/LobbyList";
import CreateLobby from "./routes/CreateLobby";

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
    action: playAction,
    children: [
      {
        path: "join",
        element: <JoinLobby />,
        loader: joinLoader
      },
      {
        path: "create",
        element: <CreateLobby />
      },
      {
        path: "browse",
        element: <LobbyList />,
        loader: lobbyListLoader
      }
    ]
  },
  {
    path: "play/:lobbyId",
    element: <Lobby />,
    errorElement: <ErrorPage />,
    loader: lobbyLoader
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
