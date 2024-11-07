import { useParams, Link } from "react-router-dom";
import BackLink from "../components/BackLink";

export default function Lobby() {
  const params = useParams();

  return (
    <div>
      <BackLink />
      "PLACEHOLDER {params.lobbyId} PLINK PLONK"
    </div>
  );
}