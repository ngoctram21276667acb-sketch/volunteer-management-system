import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ManHinhChao from "./pages/ManHinhChao";
import ManHinhGioiThieu from "./pages/ManHinhGioiThieu";
import Login from "./pages/Login";
import ChonVaiTro from "./pages/ChonVaiTro";
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<ManHinhChao />} />
        <Route path="/gioi-thieu" element={<ManHinhGioiThieu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chon-vai-tro" element={<ChonVaiTro />} />
        <Route path="/register" element={<Register />} />


        {/* Protected routes */}
        <Route
          path="/home-volunteer"
          element={
            <ProtectedRoute>
              {/* <HomeVolunteer /> */}
              <RedirectToVolunteerHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-org"
          element={
            <ProtectedRoute>
              <RedirectToDashBoardOrg  />
            </ProtectedRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}


function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();

  if (!authReady) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect tới file HTML trong public
function RedirectToVolunteerHome() {
  window.location.href = "/html/volunteer-home.html";
  return null;
}

function RedirectToDashBoardOrg(){
  window.location.href="/html/dashboard-org.html"
  return null;
}
