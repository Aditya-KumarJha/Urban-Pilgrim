import { useState } from "react";
import Sidebar from "./Sidebar";
import Home from "./Home";
import OrganizerProtectedRoute from "./OrganizerProtectedRoute";

export default function Organizer() {
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    return <Home />
  };

  return (
    <OrganizerProtectedRoute>
      <div className="flex md:flex-row flex-col min-h-screen bg-gray-50">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="flex-1 ml-0 md:ml-[250px] md:mt-0">{renderSection()}</div>
      </div>
    </OrganizerProtectedRoute>
  );
}
