
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CampaignForm from "./components/CampaignForm.jsx";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (backend session)
    axios
      .get("http://localhost:5001/auth/user", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="container">
      <header className="topbar">
        <h1>Xeno Mini-CRM</h1>
        <div className="nav-links">
          {!user ? (
            <a href="http://localhost:5001/auth/google" className="link">
              Login with Google
            </a>
          ) : (
            <>
              <span>Welcome, {user.displayName}</span>
              <Link to="/campaigns" className="link">
                Campaign History →
              </Link>
              <a href="http://localhost:5001/auth/logout" className="link">
                Logout
              </a>
            </>
          )}
        </div>
      </header>

      {user ? (
        <CampaignForm />
      ) : (
        <p>Please log in with Google to access the CRM.</p>
      )}
    </div>
  );
}

