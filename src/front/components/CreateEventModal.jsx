import React, { useState } from "react";
import "../styles/CreateEventModal.css";

const CreateEventModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("📖");
    const [location, setLocation] = useState("");
    const [time, setTime] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();


        const newEvent = {
            title: name,
            date: `Today • ${time}`,
            icon: type
        };

        onSave(newEvent);
        onClose();

        setName(""); setLocation(""); setTime("");
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-x" onClick={onClose}>&times;</button>
                <h3 className="modal-title">Create New Event</h3>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reading Party" required />
                    </div>

                    <div className="form-group">
                        <label>Event Category (Icon)</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
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
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;