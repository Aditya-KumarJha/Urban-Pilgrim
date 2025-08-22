import { useState, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Loader from "./components/Loader";

// Lazy load all route components
const Home = lazy(() => import("./pages/home"));
const Retreats = lazy(() => import("./pages/pilgrim_retreats/Retreats"));
const Sessions = lazy(() => import("./pages/pilgrim_sessions/Sessions"));
const Guides = lazy(() => import("./pages/pilgrim_guides/Guides"));
const JoinGuides = lazy(() => import("./pages/join_us_as_guides/JoinGuides"));
const JoinAdvisors = lazy(() => import("./pages/join_us_as_trip_advisors/JoinAdvisors"));
const ContactForm = lazy(() => import("./pages/contact/Contact"));
const Footer = lazy(() => import("./components/footer"));
const WhyUs = lazy(() => import("./pages/whychooseUs/WhyChoseUs"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const WhoAreWe = lazy(() => import("./pages/whoarewe/WhoAreWe"));
const SessionSlots = lazy(() => import("./pages/session_slots/SessionSlots"));
const SessionDescription = lazy(() => import("./pages/session_slots/SessionDescription"));
const GuideClassDetails = lazy(() => import("./components/pilgrim_guides/GuideClassDetails"));
const Retreatdescription = lazy(() => import("./components/pilgrim_retreats/Retreatdescription"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const ProgramDetails = lazy(() => import("./pages/program_details/ProgramDetails"));
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/privacy_policy/PrivacyPolicy"));
const YogaDesc = lazy(() => import("./components/YogaDesc"));
const EventDetails = lazy(() => import("./components/upcoming_events/EventDetails"));
const LiveDetails = lazy(() => import("./pages/program_details/LiveDeatils"));

// Loading component for lazy routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C5703F]"></div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin" || location.pathname === "/userdashboard";

  return (
    <div className="relative">
      {/* Loader overlay */}
      {loading && <Loader onFinish={() => setLoading(false)} />}
      {loading && isAdminRoute && <div className="hidden">{setLoading(false)}</div>}

      {/* Only show navbar & routes once loader is done */}
      {!loading && (
        <>
          {!isAdminRoute && <NavBar />}
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pilgrim_retreats" element={<Retreats />} />
              <Route path="/pilgrim_sessions" element={<Sessions />} />
              <Route path="/pilgrim_guides" element={<Guides />} />
              <Route path="/contact" element={<ContactForm />} />
              <Route path="/joinusguides" element={<JoinGuides />} />
              <Route path="/joinusadvisors" element={<JoinAdvisors />} />
              <Route path="/whyus" element={<WhyUs />} />
              <Route path="/whoarewe" element={<WhoAreWe />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/yoga/:title" element={<YogaDesc />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/session/:sessionId/slots" element={<SessionSlots />} />
              <Route path="/session/:sessionId/details" element={<LiveDetails />} />
              <Route path="/program/:programId/details" element={<ProgramDetails />} />
              <Route path="/session/:sessionId/slots/description" element={<SessionDescription />} />
              <Route path="/guide/:guideClassName" element={<GuideClassDetails />} />
              <Route path="/pilgrim_retreats/:retreatName" element={<Retreatdescription />} />
              <Route path="/event/:eventName" element={<EventDetails />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home replace={'/'} />} />
              <Route path="/userdashboard" element={<UserDashboard />} />
            </Routes>
          </Suspense>
          {!isAdminRoute && <Footer className="mt-10" />}
        </>
      )}
    </div>
  );
}

export default App;
