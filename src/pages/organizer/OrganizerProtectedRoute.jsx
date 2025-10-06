import { useSelector } from "react-redux";
import OrganizerSignIn from "./OrganizerSignIn";

export default function OrganizerProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.organizerAuth || { isAuthenticated: false });
  const { isAuthenticated: isAdminAuthenticated } = useSelector((state) => state.adminAuth || { isAuthenticated: false });

  // Allow access if either organizer or admin is authenticated
  if (!isAuthenticated && !isAdminAuthenticated) {
    return <OrganizerSignIn />;
  }
  return children;
}
