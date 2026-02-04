import React from "react";
import "./EventDetailsModal.css";

const EventDetailsModal = ({ isOpen, onClose, event, onDelete }) => {
  if (!isOpen || !event) return null;

  const creator = event.created_by_name || event.created_by?.username || event.created_by || "Unknown";

  const dateText = event.datetimeISO
    ? new Date(event.datetimeISO).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : event.date || "";

  const timeText = event.datetimeISO
    ? new Date(event.datetimeISO).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : event.time || "";

  return (
    <div className="edm-overlay" onClick={onClose}>
      <div className="edm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="edm-close" onClick={onClose} type="button">
          &times;
        </button>

        <div className="edm-header">
          <div className="edm-icon">{event.icon || "📅"}</div>
          <div className="edm-title-wrap">
            <h3 className="edm-title">{event.title}</h3>
            <div className="edm-subtitle">
              Created by <span className="edm-creator">{creator}</span>
            </div>
          </div>
        </div>

        <div className="edm-grid">
          <div className="edm-item">
            <div className="edm-label">Date</div>
            <div className="edm-value">{dateText}</div>
          </div>

          <div className="edm-item">
            <div className="edm-label">Time</div>
            <div className="edm-value">{timeText}</div>
          </div>

          <div className="edm-item edm-full">
            <div className="edm-label">Place</div>
            <div className="edm-value">{event.place || event.location || "-"}</div>
          </div>

          <div className="edm-item edm-full">
            <div className="edm-label">Address</div>
            <div className="edm-value">{event.address || event.location || "-"}</div>
          </div>
        </div>

        <div className="edm-actions">
          <button className="edm-btn edm-btn-ghost" onClick={onClose} type="button">
            Close
          </button>
          {onDelete && (
            <button
              className="edm-btn edm-btn-danger"
              type="button"
              onClick={() => onDelete(event.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
