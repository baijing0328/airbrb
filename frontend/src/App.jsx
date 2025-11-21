import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Host from "./pages/Listing/Host";
import All from "./pages/Listing/All";
import EditHostListing from "./pages/Listing/EditHostListing";
import ListingView from "./pages/Listing/ViewListing";
import HostRequests from "./pages/Listing/HostRequests";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/all" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/all" element={<All />} />
        <Route path="/listing/:listingId" element={<ListingView />} />

        {/* Protected Routes */}
        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <Host />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/edit/:listingId"
          element={
            <ProtectedRoute>
              <EditHostListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/requests/:listingId"
          element={
            <ProtectedRoute>
              <HostRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
