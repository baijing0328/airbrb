import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Host from "./pages/Listing/Host";
import All from "./pages/Listing/All";
import EditHostListing from "./pages/Listing/EditHostListing";
import ListingView from "./pages/Listing/ViewListing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/all" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/host" element={<Host />} />
        <Route path="/host/edit/:listingId" element={<EditHostListing />} />
        <Route path="/all" element={<All />} />
        <Route path="/listing/:listingId" element={<ListingView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
