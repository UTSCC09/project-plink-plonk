import { Link } from "react-router-dom";

export default function BackLink() {
  return (
    <>
      <Link to={".."} relative="path">[back icon]</Link>
    </>
  );
}
