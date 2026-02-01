import React, { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import "./CreateEventsModal.css";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const CreateEventModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("📖");
  const [locationText, setLocationText] = useState("");
  const [time, setTime] = useState("");

  const [placeId, setPlaceId] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [address, setAddress] = useState(null);
  const [coords, setCoords] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const acRef = useRef(null);

  if (!isOpen) return null;

  const getCreatorName = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "null");
      return user?.username || user?.email || user?.id || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const buildEventForUI = (apiEvent, createdByName) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const datetimeISO = time ? `${dateStr}T${time}:00` : null;

    return {
      ...apiEvent,
      id: apiEvent?.id ?? apiEvent?.event_id ?? apiEvent?._id ?? `${(apiEvent?.title || name || "event").slice(0, 20)}-${Date.now()}`,
      icon: type,
      title: apiEvent?.title ?? name,
      date: apiEvent?.date ?? dateStr,
      time: apiEvent?.time ?? time,
      place: placeName || locationText || apiEvent?.location || "",
      address: address || locationText || apiEvent?.location || "",
      place_id: placeId || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      datetimeISO,
      created_by_name: apiEvent?.created_by_name ?? createdByName,
    };
  };

  const onLoadAutocomplete = (ac) => {
    acRef.current = ac;
  };

  const onPlaceChanged = () => {
    const ac = acRef.current;
    if (!ac) return;
    const place = ac.getPlace?.();
    if (!place) return;

    const nextName = place?.name || null;
    const nextAddress = place?.formatted_address || null;
    const nextPlaceId = place?.place_id || null;
    const geometry = place?.geometry?.location;

    setPlaceName(nextName);
    setAddress(nextAddress);
    setPlaceId(nextPlaceId);

    if (geometry && typeof geometry.lat === "function" && typeof geometry.lng === "function") {
      setCoords({ lat: geometry.lat(), lng: geometry.lng() });
    }

    setLocationText(nextAddress || nextName || "");
  };

  const handleLocationChange = (value) => {
    setLocationText(value);
    setCoords(null);
    setPlaceId(null);
    setPlaceName(null);
    setAddress(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!API_BASE) {
      setError("No está configurado VITE_BACKEND_URL.");
      return;
    }

    if (!name || !type || !locationText || !time) {
      setError("Completa todos los campos.");
      return;
    }

    setSaving(true);

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const createdByName = getCreatorName();

    const payload = {
      title: name,
      date: dateStr,
      time,
      category: type,
      location: locationText,
      place_id: placeId,
      place_name: placeName,
      address,
      lat: coords?.lat,
      lng: coords?.lng,
      created_by_name: createdByName,
    };

    try {
      const resp = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.msg || data?.message || "Error creating event");
        return;
      }

      onSave(buildEventForUI(data, createdByName));
      onClose();

      setName("");
      setType("📖");
      setLocationText("");
      setTime("");
      setPlaceId(null);
      setPlaceName(null);
      setAddress(null);
      setCoords(null);
    } catch (err) {
      setError("Network error. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  const canUsePlaces = Boolean(window.google?.maps?.places);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose} type="button">
          &times;
        </button>

        <h3 className="modal-title">Create New Event</h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reading Party"
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Event Category (Icon)</label>
            <select value={type} onChange={(e) => setType(e.target.value)} disabled={saving}>
              <option value="📖">📖 Book Club</option>
              <option value="🎉">🎉 Party / Celebration</option>
              <option value="🎤">🎤 Author Talk</option>
              <option value="🚀">🚀 Sci-Fi / Tech</option>
              <option value="📝">📝 Workshop</option>
              <option value="☕">☕ Coffee & Books</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Where</label>

              {canUsePlaces ? (
                <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Busca una ubicación…"
                    required
                    disabled={saving}
                  />
                </Autocomplete>
              ) : (
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Busca una ubicación…"
                  required
                  disabled={saving}
                />
              )}
            </div>

            <div className="form-group">
              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required disabled={saving} />
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={saving}>
              {saving ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
