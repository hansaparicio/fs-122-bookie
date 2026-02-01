import React, { useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import AnimatedList from "../components/AnimatedList";
import CreateEventModal from "../components/CreateEventModal";
import EventDetailsModal from "../components/EventDetailsModal";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Events.css";

export const Events = () => {
  const { store, dispatch } = useGlobalReducer();

  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsEvent, setDetailsEvent] = useState(null);

  const mapRef = useRef(null);

  const center = useMemo(() => ({ lat: 40.416775, lng: -3.70379 }), []);

  const baseEvents = useMemo(
    () => [
      {
        id: "prado-1",
        title: "Club de lectura: clásicos en el Prado",
        place: "Museo del Prado",
        address: "C. de Ruiz de Alarcón, 23, 28014 Madrid",
        datetimeISO: "2026-02-05T18:30:00",
        lat: 40.413782,
        lng: -3.692127,
        icon: "📖",
        created_by_name: "Bookie",
      },
      {
        id: "retiro-1",
        title: "Lectura al aire libre + intercambio de libros",
        place: "Parque del Retiro",
        address: "Plaza de la Independencia, Madrid",
        datetimeISO: "2026-02-08T11:00:00",
        lat: 40.41526,
        lng: -3.68442,
        icon: "☕",
        created_by_name: "Bookie",
      },
      {
        id: "matadero-1",
        title: "Encuentro: novela contemporánea",
        place: "Matadero Madrid",
        address: "Pl. de Legazpi, 8, 28045 Madrid",
        datetimeISO: "2026-02-12T19:00:00",
        lat: 40.39194,
        lng: -3.69833,
        icon: "🎤",
        created_by_name: "Bookie",
      },
    ],
    []
  );

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: apiKey || "",
    libraries: ["places"],
    language: "es",
    region: "ES",
  });

  const loadEvents = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("event_global_list") || "[]");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    if (Array.isArray(store.eventGlobalList) && store.eventGlobalList.length) return store.eventGlobalList;
    return baseEvents;
  };

  const [events, setEvents] = useState(loadEvents());

  const persistEvents = (list) => {
    try {
      localStorage.setItem("event_global_list", JSON.stringify(list));
      window.dispatchEvent(new Event("local-storage-changed"));
    } catch {}
  };

  const upsertEvent = (ev) => {
    const id =
      ev?.id ??
      ev?.event_id ??
      ev?._id ??
      `${(ev?.title || "event").slice(0, 20)}-${Date.now()}`;

    const withId = { ...ev, id };

    setEvents((prev) => {
      const idx = prev.findIndex((x) => (x.id ?? x.event_id ?? x._id) === id);
      const next = idx === -1 ? [...prev, withId] : prev.map((x, i) => (i === idx ? withId : x));
      persistEvents(next);
      return next;
    });

    return withId;
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" }),
      time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const focusMap = (ev) => {
    if (!mapRef.current || typeof ev?.lat !== "number" || typeof ev?.lng !== "number") return;
    mapRef.current.panTo({ lat: ev.lat, lng: ev.lng });
    mapRef.current.setZoom(15);
  };

  const handleSelect = (ev) => {
    setSelected(ev);
    focusMap(ev);
  };

  const handleAddEvent = (newEvent) => {
    dispatch({ type: "add_event", payload: newEvent });
    const inserted = upsertEvent(newEvent);
    setSelected(inserted);
    focusMap(inserted);
  };

  const handleJoin = (ev) => {
    alert(`Te has apuntado (demo) a: ${ev.title}`);
  };

  if (!apiKey) return <div className="events-fallback">Falta GOOGLE MAPS API KEY</div>;
  if (loadError) return <div className="events-fallback">Error cargando Google Maps</div>;
  if (!isLoaded) return <div className="events-fallback">Cargando mapa…</div>;

  return (
    <div className="events-page">
      <GoogleMap
        mapContainerClassName="events-map"
        center={center}
        zoom={13}
        options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
        onLoad={(map) => (mapRef.current = map)}
        onClick={() => setSelected(null)}
      >
        {events
          .filter((ev) => typeof ev.lat === "number" && typeof ev.lng === "number")
          .map((ev) => (
            <Marker key={ev.id} position={{ lat: ev.lat, lng: ev.lng }} onClick={() => handleSelect(ev)} />
          ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            options={{ pixelOffset: new window.google.maps.Size(0, -55) }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="events-infowindow">
              <div className="events-iw-title">{selected.title}</div>
              <div className="events-iw-row">{selected.place}</div>
              <div className="events-iw-row">{formatDateTime(selected.datetimeISO).date}</div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="events-join-btn" onClick={() => handleJoin(selected)}>
                  Apuntarme
                </button>
                <button
                  className="events-join-btn"
                  onClick={() => {
                    setDetailsEvent(selected);
                    setIsDetailsOpen(true);
                  }}
                >
                  View More
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="events-right-overlay">
        <div className="events-right-card">
          <div className="events-list-box">
            <AnimatedList
              items={events}
              onItemSelect={(item) => handleSelect(item)}
              showGradients
              enableArrowNavigation
              displayScrollbar
              initialSelectedIndex={-1}
              renderItem={(ev) => {
                const { date, time } = formatDateTime(ev.datetimeISO);
                return (
                  <div>
                    <p className="item-text" style={{ fontWeight: 800, marginBottom: 6 }}>
                      {ev.title}
                    </p>
                    <p className="item-text" style={{ opacity: 0.75, marginBottom: 0, fontSize: "0.85rem" }}>
                      {ev.place} · {date} · {time}
                    </p>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddEvent} />
      <EventDetailsModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} event={detailsEvent} />
    </div>
  );
};
