import { createLobby } from "../js/lobby.mjs";
import { Form } from "react-router-dom";

export default function CreateLobby() {
  return (
    <Form method="post" action="/play" className="space-y-4">
      <input
        type="text"
        id="code"
        placeholder="room name"
        autoComplete="off"
        name="name"
        required
      />
      <div className="space-x-2">
        <input type="radio" id="private" name="visibility" value="Private" defaultChecked />
        <label htmlFor="private">Private</label>
        <input type="radio" id="public" name="visibility" value="Public" />
        <label htmlFor="public">Public</label>
      </div>
      <button type="submit" >Start Room</button>
    </Form>
  );
}
