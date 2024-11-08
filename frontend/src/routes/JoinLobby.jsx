import { getLobby } from "../js/lobby.mjs";
import { Form, replace } from "react-router-dom";

export async function loader({ request }) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return null;
  }

  const lobby = await getLobby(code);
  return replace(`/play/${code}`)
}

export default function JoinLobby() {
  return (
    <Form method="get" action="/play/join" replace="true">
      <input
        type="text"
        id="code"
        name="code"
        autoComplete="off"
        required
      />
      <button type="submit">Go!</button>
    </Form>
  );
}
