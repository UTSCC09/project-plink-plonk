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
    <>
      {/* <h3>Join</h3> */}
      <Form method="get" action="." replace="true" className="flex flex-col items-center gap-4">
        <input
          type="text"
          id="code"
          name="code"
          autoComplete="off"
          placeholder="Lobby Code"
          required
        />
        <button type="submit" className="submitButton">Join!</button>
      </Form>
    </>
  );
}
