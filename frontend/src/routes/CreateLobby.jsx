import { Form, useOutletContext, redirect } from "react-router-dom";
import { createLobby } from "../js/lobby.mjs";

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const visibility = formData.get("visibility");

  try {
    const lobbyId = await createLobby(name, visibility);
    return redirect(`/play/${lobbyId}`); 
  } catch (err) {
    console.error("Error creating lobby:", err);
    return redirect("/");
  }
}

export default function CreateLobby() {
  const nickname = useOutletContext();
  const defaultName = nickname + "'s room";

  return (
    <>
      {/* <h3>Create</h3> */}
      <Form method="post" action="." className="flex flex-col items-center gap-4">
        <input
          type="text"
          id="code"
          placeholder="Room name"
          defaultValue={defaultName}
          maxLength="30"
          autoComplete="off"
          name="name"
          required
        />
        <div className="flex justify-evenly w-full">
          <div className="flex items-center">
            <input type="radio" id="private" name="visibility" value="Private" defaultChecked />
            <label htmlFor="private">Private</label>
          </div>
          <div className="flex items-center">
            <input type="radio" id="public" name="visibility" value="Public" />
            <label htmlFor="public">Public</label>
          </div>
        </div>
        <button type="submit" className="submitButton">Start Room</button>
      </Form>
    </>
  );
}
