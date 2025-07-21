import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Loader from "./components/Loader";
import Home from "./pages/home";
import Contact from "./pages/Contact";

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
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home  replace={'/'} />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
