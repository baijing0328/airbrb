import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";

function App() {

  return (
    <BrowserRouter>
      <nav>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
