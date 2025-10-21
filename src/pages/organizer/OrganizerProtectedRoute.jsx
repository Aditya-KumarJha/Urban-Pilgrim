import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import OrganizerSignIn from "./OrganizerSignIn";

export default function OrganizerProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.organizerAuth || { isAuthenticated: false });
  const { isAuthenticated: isAdminAuthenticated } = useSelector((state) => state.adminAuth || { isAuthenticated: false });
  const [searchParams] = useSearchParams();
  const organizerUid = searchParams.get('uid');

  // Allow access if:
  // 1. Organizer is authenticated (organizer logged in)
  // 2. Admin is authenticated AND accessing with uid parameter (admin viewing specific organizer)
  const canAccess = isAuthenticated || (isAdminAuthenticated && organizerUid);

  if (!canAccess) {
    return <OrganizerSignIn />;
  }
  
  return children;
}
