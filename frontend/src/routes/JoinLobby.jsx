//import { getLobby } from "../js/lobby.mjs";
import { Form, replace } from "react-router-dom";

export async function loader({ request }) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return null;
  }
  return replace(`/play/${code}`)
}

export default function JoinLobby() {
  return (
    <div className="flex justify-center">
      <Form method="get" action="/play/join" replace="true">
        <input
          type="text"
          id="code"
          name="code"
          autoComplete="off"
          placeholder="Enter Lobby Code!"
          required
        />
        <button className="mt-8" type="submit">Go!</button>
      </Form>
    </div>
  );
}
