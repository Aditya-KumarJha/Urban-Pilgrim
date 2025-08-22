import { useState, lazy, Suspense } from "react";
import Sidebar from "./SideBar";

// Lazy load admin section components
const Home = lazy(() => import("./Home"));
const Retreats = lazy(() => import("./Retreats"));
const Sessions = lazy(() => import("./Sessions"));
const Guides = lazy(() => import("./Guides"));
const Events = lazy(() => import("./Events"));

// Loading component for admin sections
const AdminSectionLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#C5703F]"></div>
  </div>
);

export default function Admin() {
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    switch (activeSection) {
      case "retreats":
        return <Retreats />;
      case "sessions":
        return <Sessions />;
      case "guides":
        return <Guides />;
      case "events":
        return <Events />;
      case "home":
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex md:flex-row flex-col min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 ml-0 md:ml-[250px] md:mt-0">
        <Suspense fallback={<AdminSectionLoader />}>
          {renderSection()}
        </Suspense>
      </div>
    </div>
  );
}
