import { Link } from "react-router-dom";

export default function BackLink() {
  return (
    <div>
      <Link to={".."} relative="path">[back icon]</Link>
    </div>
  );
}
