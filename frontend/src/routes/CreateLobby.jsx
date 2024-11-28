import { createLobby } from "../js/lobby.mjs";
import { Form } from "react-router-dom";

export default function CreateLobby() {
  return (
    <Form method="post" action="/play">
      <input
        type="text"
        id="code"
        placeholder="room name"
        autoComplete="off"
        name="name"
        required
      />
      <input type="radio" id="private" name="visibility" value="Private" defaultChecked />
      <label htmlFor="private">Private</label>
      <input type="radio" id="public" name="visibility" value="Public" />
      <label htmlFor="public">Public</label>
      <button type="submit">Start Room</button>
    </Form>
  );
}
