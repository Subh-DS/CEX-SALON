import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-2 text-mutedbrown">That page doesn't exist or moved.</p>
      <div className="mt-6">
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
