import React, { useState } from "react";
import axios from "axios";
import "./CampaignForm.css";

// const API = "http://localhost:5001/api";

const API = import.meta.env.VITE_API_URL ||  "https://crm-for-xeno-by-manasvi.onrender.com/api";


export default function CampaignForm() {
  const [rules, setRules] = useState({ spends: "", visits: "", inactivity: "" });
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRules((r) => ({ ...r, [name]: value }));
  };


  const handleSuggestMessage = async () => {
    try {
      const res = await axios.post(`${API}/ai/suggest-message`, {
        rules,
      });
      setMessage(res.data.message);
    } catch (e) {
      alert("Could not generate suggestion.");
    }
  };


  // Preview audience size
  const handlePreview = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/segments/preview`, { rules });
      setAudience(res.data.audienceSize);
    } catch (e) {
      console.error("Preview error:", e);
      alert(e?.response?.data?.error || "Preview failed");
    } finally {
      setLoading(false);
    }
  };

  // Save and launch campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API}/campaigns`, {
        rules,
        message,
      });
      alert(
        ` Campaign created!\nID: ${res.data.campaignId}\nAudience: ${res.data.audience}`
      );
      setRules({ spends: "", visits: "", inactivity: "" });
      setMessage("");
      setAudience(null);
    } catch (e) {
      console.error("Campaign creation error:", e);
      alert(e?.response?.data?.error || "Campaign creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create Campaign</h2>

      <div className="grid">
        <label>
          Min Total Spend
          <input
            type="number"
            name="spends"
            value={rules.spends}
            onChange={handleInputChange}
            placeholder="e.g., 1000"
          />
        </label>
        <label>
          Min Visits
          <input
            type="number"
            name="visits"
            value={rules.visits}
            onChange={handleInputChange}
            placeholder="e.g., 2"
          />
        </label>
        <label>
          Inactivity (days)
          <input
            type="number"
            name="inactivity"
            value={rules.inactivity}
            onChange={handleInputChange}
            placeholder="e.g., 30"
          />
        </label>
      </div>

      <div className="row">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loading}
          className="secondary"
        >
          Preview Audience
        </button>
        <span className="muted">
          {audience !== null ? `Audience: ${audience}` : " "}
        </span>
      </div>

      <label className="full">
        Message
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
        />
      </label>

      <div className="row">
        <button
          type="button"
          onClick={handleSuggestMessage}
          className="ai"
          disabled={loading}
        >
          ✨ Suggest with AI
        </button>
        <button
          type="submit"
          disabled={loading || !message}
          className="primary"
        >
          Save & Launch
        </button>
      </div>
    </form>
  );
}
