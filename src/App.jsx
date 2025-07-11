import { useState } from "react";
import { Routes, Route, replace } from "react-router-dom";
import NavBar from "./components/NavBar";
import Loader from "./components/Loader";

import Home from "./pages/Home";
import Pilgrim_Bazaar from "./pages/Pilgrim_Bazaar";
import Pilgrim_Experiences from "./pages/Pilgrim_Experiences";
import Pilgrim_Sessions from "./pages/Pilgrim_Sessions";
import Wellness_Program from "./pages/Wellness_Program";
import Contact from "./pages/Contact";
import ProgramExplorer from "./components/ProgramExplorer";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative">
      {/* Loader overlay */}
      {loading && <Loader onFinish={() => setLoading(false)} />}

      {/* Only show navbar & routes once loader is done */}
      {!loading && (
        <>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Pilgrim_Bazaar" element={<Pilgrim_Bazaar />} />
            <Route path="/Pilgrim_Sessions" element={<Pilgrim_Sessions />} />
            <Route path="/Pilgrim_Experiences" element={<Pilgrim_Experiences />} />
            <Route path="/Wellness_Guide" element={<div className="mt-[100px]"><ProgramExplorer /></div>} />
            <Route path="/Wellness_Program" element={<Wellness_Program />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home  replace={'/'} />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
