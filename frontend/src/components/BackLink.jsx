import { Link } from "react-router-dom";

export default function BackLink() {
  return (
    <div>
      <Link to={".."} relative="path">BACK</Link>
    </div>
  );
}
