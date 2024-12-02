import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import './main.css'

import ErrorPage from "./routes/ErrorPage";
import Index, { loader as indexLoader } from "./routes/Index";
import Home, { loader as homeLoader } from "./routes/Home";
import LogIn, { loader as loginLoader } from "./routes/LogIn";
import SignUp, { loader as signupLoader } from "./routes/SignUp";
import Profile, { loader as profileLoader } from "./routes/Profile";
import SignSprinter, { loader as playLoader } from "./routes/SignSprinter";
import JoinLobby, { loader as joinLoader } from "./routes/JoinLobby";
import LobbyList, { loader as lobbyListLoader } from "./routes/LobbyList";
import CreateLobby, {action as createAction} from "./routes/CreateLobby";
import Lobby, { loader as lobbyLoader } from "./routes/Lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorPage />,
    loader: indexLoader
  },
  {
    path: "/home",
    element: <Home />,
    errorElement: <ErrorPage />,
    loader: homeLoader
  },
  {
    path: "login",
    element: <LogIn />,
    errorElement: <ErrorPage />,
    loader: loginLoader
  },
  {
    path: "signup",
    element: <SignUp />,
    errorElement: <ErrorPage />,
    loader: signupLoader
  },
  {
    path: "/play",
    element: <SignSprinter />,
    errorElement: <ErrorPage />,
    loader: playLoader,
    children: [
      {
        path: "join",
        element: <JoinLobby />,
        loader: joinLoader
      },
      {
        path: "create",
        element: <CreateLobby />,
        action: createAction
      },
      {
        path: "browse",
        element: <LobbyList />,
        loader: lobbyListLoader
      }
    ]
  },
  {
    path: "/profile",
    element: <Profile />,
    errorElement: <ErrorPage />,
    loader: profileLoader
  },
  {
    path: "/play/:lobbyId",
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
