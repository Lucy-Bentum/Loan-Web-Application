import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import "./App.css";

//added a navidate route to the main App in order to redirect to the Signup page

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/Signup" replace />} />
        <Route path="/Signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
export default App;
