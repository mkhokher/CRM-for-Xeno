import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CampaignHistory.css";

const API = "http://localhost:5001/api";

export default function CampaignHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API}/campaigns`);
        setLogs(res.data);
      } catch (e) {
        console.error("Error fetching history:", e);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="container">
      <div className="topbar">
        <h1>Campaign History</h1>
        <a href="/" className="link">
          ← Create Campaign
        </a>
      </div>

      {logs.length === 0 ? (
        <div className="empty">No campaigns yet.</div>
      ) : (
        <div className="table">
          <div className="thead">
            <div>Created</div>
            <div>Campaign ID</div>
            <div>Audience</div>
            <div>Sent</div>
            <div>Failed</div>
          </div>

          {logs.map((log) => (
            <div className="trow" key={log._id}>
              <div>
                {new Date(log.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="mono">{log.campaignId}</div>
              <div>{log.audience}</div>
              <div>{log.sent}</div>
              <div>{log.failed}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
