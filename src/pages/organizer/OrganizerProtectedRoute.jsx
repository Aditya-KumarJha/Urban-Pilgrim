import { useSelector } from "react-redux";
import OrganizerSignIn from "./OrganizerSignIn";

export default function OrganizerProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.organizerAuth || { isAuthenticated: false });

  if (!isAuthenticated) {
    return <OrganizerSignIn />;
  }
  return children;
}
