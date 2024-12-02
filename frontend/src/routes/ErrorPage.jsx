import { useRouteError } from "react-router-dom";
import BackLink from "../components/BackLink";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page" className="flex-center">
      <h1>Oops!</h1>
      <p>Sorry, a slippery banana must have gotten in the way.</p>
      <BackLink />
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}