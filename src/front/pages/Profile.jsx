import React, { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import { PencilIcon, BookOpenIcon, TagIcon, TrashIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useUser } from "../components/UserContext";
import MyLibraryPickerModal from "../components/MyLibraryPickerModal";

export const Profile = () => {
  const { profileImg, updateProfileImg, userData } = useUser();

  const API_BASE = useMemo(() => import.meta.env.VITE_BACKEND_URL || "http://localhost:3001", []);

  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [deletingIsbn, setDeletingIsbn] = useState(null);

  const [readingNow, setReadingNow] = useState(null);

  const [aboutText, setAboutText] = useState("");
  const [top3, setTop3] = useState([null, null, null]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [newGenre, setNewGenre] = useState("");

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("top3");

  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const normalizeIsbn = (isbn) => (isbn || "").replaceAll("-", "").replaceAll(" ", "").toUpperCase();

  const getAuthorsArray = (book) => {
    if (!book) return [];
    if (Array.isArray(book.authors)) return book.authors;
    if (book.author) return String(book.author).split(";").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const getUserId = () => {
    const fromCtx = userData?.id;
    if (fromCtx) return fromCtx;
    const saved = JSON.parse(localStorage.getItem("user_data") || "null");
    return saved?.id || null;
  };

  const getPrefsKey = () => {
    const uid = getUserId();
    return uid ? `profile_prefs_${uid}` : null;
  };

  const loadPrefs = () => {
    const key = getPrefsKey();
    if (!key) return null;
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };

  const savePrefs = (next) => {
    const key = getPrefsKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  const saveGenres = (genres) => {
    const key = getPrefsKey();
    if (!key) return;
    try {
      const currentPrefs = loadPrefs() || {};
      currentPrefs.favoriteGenres = genres;
      localStorage.setItem(key, JSON.stringify(currentPrefs));
    } catch {}
  };

  const loadReadingNow = () => {
    try {
      const raw = localStorage.getItem("selected_book");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      return normalizeIsbn(parsed.isbn);
    } catch {
      return null;
    }
  };

  const setCurrentlyReading = (book) => {
    const isbn = normalizeIsbn(book?.isbn);
    if (!isbn) return;
    setReadingNow(isbn);
    const payload = {
      title: book.title,
      thumbnail: book.thumbnail,
      isbn,
      authors: getAuthorsArray(book),
    };
    localStorage.setItem("selected_book", JSON.stringify(payload));
  };

  const fetchLibrary = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoadingLibrary(true);
    try {
      const resp = await fetch(`${API_BASE}/api/library/${userId}/books`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.msg || err?.message || "Error fetching library");
      }
      const data = await resp.json();
      setLibraryBooks(Array.isArray(data) ? data : []);
    } catch {
      setLibraryBooks([]);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const fetchUserEvents = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoadingEvents(true);
    try {
      const resp = await fetch(`${API_BASE}/api/users/${userId}/events`);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.msg || err?.message || "Error fetching events");
      }
      const data = await resp.json();
      setUserEvents(Array.isArray(data) ? data : []);
    } catch {
      setUserEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const removeFromLibrary = async (isbn) => {
    const userId = getUserId();
    if (!userId) return;

    const clean = normalizeIsbn(isbn);
    setDeletingIsbn(clean);

    try {
      const resp = await fetch(`${API_BASE}/api/library/${userId}/books/${clean}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();

      setLibraryBooks((prev) => prev.filter((b) => normalizeIsbn(b.isbn) !== clean));

      if (readingNow === clean) {
        setReadingNow(null);
        localStorage.removeItem("selected_book");
      }

      setTop3((prev) => {
        const next = prev.map((slot) => (slot && normalizeIsbn(slot.isbn) === clean ? null : slot));
        savePrefs({ aboutText, top3: next, favoriteGenres });
        return next;
      });
    } finally {
      setDeletingIsbn(null);
    }
  };

  const pickTop3Book = (item) => {
    if (activeSlot === null) return;

    const mapped = {
      id: item.id || null,
      title: item.title,
      authors: getAuthorsArray(item),
      publisher: item.publisher || null,
      thumbnail: item.thumbnail || null,
      isbn: normalizeIsbn(item.isbn),
    };

    setTop3((prev) => {
      const next = [...prev];
      next[activeSlot] = mapped;
      savePrefs({ aboutText, top3: next, favoriteGenres });
      return next;
    });

    setActiveSlot(null);
    setIsBookModalOpen(false);
  };

  const handleBookSelect = (book) => {
    if (pickerMode === "reading") {
      setCurrentlyReading(book);
      setIsBookModalOpen(false);
      return;
    }
    if (activeSlot !== null) pickTop3Book(book);
  };

  const clearTop3Slot = (idx) => {
    setTop3((prev) => {
      const next = [...prev];
      next[idx] = null;
      savePrefs({ aboutText, top3: next, favoriteGenres });
      return next;
    });
  };

  const onChangeAbout = (val) => {
    setAboutText(val);
    savePrefs({ aboutText: val, top3, favoriteGenres });
  };

  const addGenre = () => {
    const genre = newGenre.trim();
    if (!genre) return;
    const normalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
    if (favoriteGenres.includes(normalizedGenre)) {
      setNewGenre("");
      return;
    }
    const updated = [...favoriteGenres, normalizedGenre];
    setFavoriteGenres(updated);
    saveGenres(updated);
    savePrefs({ aboutText, top3, favoriteGenres: updated });
    setNewGenre("");
  };

  const removeGenre = (genreToRemove) => {
    const updated = favoriteGenres.filter((g) => g !== genreToRemove);
    setFavoriteGenres(updated);
    saveGenres(updated);
    savePrefs({ aboutText, top3, favoriteGenres: updated });
  };

  const commonGenres = [
    "Fantasy",
    "Sci-Fi",
    "Thriller",
    "Romance",
    "Mystery",
    "Horror",
    "Historical Fiction",
    "Biography",
    "Non-Fiction",
    "Adventure",
    "Drama",
    "Comedy",
    "Poetry",
    "Young Adult",
    "Children's",
    "Crime",
    "Suspense",
    "Western",
    "Philosophy",
    "Self-Help",
  ];

  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;

    setReadingNow(loadReadingNow());
    fetchLibrary();
    fetchUserEvents();

    const prefs = loadPrefs();
    if (prefs?.aboutText !== undefined) setAboutText(prefs.aboutText);
    if (Array.isArray(prefs?.top3)) {
      setTop3([prefs.top3[0] || null, prefs.top3[1] || null, prefs.top3[2] || null]);
    }
    if (Array.isArray(prefs?.favoriteGenres)) {
      setFavoriteGenres(prefs.favoriteGenres);
    } else {
      const defaultGenres = ["Fantasy", "Sci-Fi", "Thriller"];
      setFavoriteGenres(defaultGenres);
      saveGenres(defaultGenres);
    }
  }, [userData?.id]);

  const current = useMemo(() => {
    if (!libraryBooks.length) return null;
    if (readingNow) {
      const found = libraryBooks.find((b) => normalizeIsbn(b.isbn) === readingNow);
      if (found) return found;
    }
    return libraryBooks[0];
  }, [libraryBooks, readingNow]);

  const user = {
    name:
      userData?.username ||
      userData?.email ||
      JSON.parse(localStorage.getItem("user_data") || "null")?.email ||
      "Usuario",
    location: "Madrid, Spain",
  };

  const openCloudinaryWidget = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dcmqxfpnd",
        uploadPreset: "Bookiecloudinary",
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        resourceType: "image",
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          updateProfileImg(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const TopCard = ({ idx }) => {
    const b = top3[idx];
    return (
      <div className="card border-0 shadow-sm p-3" style={{ borderRadius: 18 }}>
        <div className="d-flex gap-3 align-items-start">
          {b ? (
            <>
              <img
                src={b.thumbnail || "https://via.placeholder.com/80x110"}
                alt={b.title}
                style={{ width: 70, height: 95, objectFit: "cover", borderRadius: 10 }}
              />
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ color: "#231B59", fontSize: 11 }}>
                  Top {idx + 1}
                </div>
                <div className="fw-bold" style={{ fontSize: 14, color: "#231B59" }}>
                  {b.title}
                </div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {b.authors.join(", ")}
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 70,
                  height: 95,
                  backgroundColor: "#f0f0f0",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📚
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold">Top {idx + 1}</div>
                <div className="text-muted">Pick a book</div>
              </div>
            </>
          )}
          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-sm"
              onClick={() => {
                setPickerMode("top3");
                setActiveSlot(idx);
                setIsBookModalOpen(true);
              }}
            >
              {b ? "Change" : "Add"}
            </button>
            {b && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => clearTop3Slot(idx)}>
                <TrashIcon style={{ width: 14 }} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatEventDate = (ev) => {
    const raw = ev?.datetimeISO || ev?.datetime || ev?.date_time || null;
    if (raw) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        const date = d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });
        const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        return { date, time };
      }
    }
    const date = ev?.date || "-";
    const time = ev?.time || "";
    return { date, time };
  };

  return (
    <div className="profile-main-container" style={{ backgroundColor: "#E5E4D7", minHeight: "100vh", display: "flex" }}>
      <div className="profile-content-scroll" style={{ flexGrow: 1, padding: "40px" }}>
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "28px" }}>
          <div className="d-flex align-items-center">
            <img src={profileImg} alt={user.name} className="rounded-circle" style={{ width: 120, height: 120 }} />
            <div className="ms-4">
              <h1 className="fw-bold">{user.name}</h1>
              <p className="text-muted">{user.location}</p>
              <button className="btn-wine rounded-pill px-4 py-2" onClick={openCloudinaryWidget}>
                <PencilIcon style={{ width: 18 }} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-7">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "28px" }}>
              <h5 className="fw-bold">
                <TagIcon style={{ width: 22 }} /> About Me
              </h5>
              <textarea className="form-control" rows={5} value={aboutText} onChange={(e) => onChangeAbout(e.target.value)} />
              <div className="mt-4">
                <h6 className="fw-bold">Top 3 Favorite Books</h6>
                <div className="d-flex flex-column gap-3 mt-3">
                  <TopCard idx={0} />
                  <TopCard idx={1} />
                  <TopCard idx={2} />
                </div>
              </div>

              <div className="mt-4">
                <h6 className="fw-bold">
                  <CalendarIcon style={{ width: 20 }} /> My Events
                </h6>

                {loadingEvents ? (
                  <p className="text-muted mb-0">Loading events...</p>
                ) : userEvents.length === 0 ? (
                  <p className="text-muted mb-0">You are not signed up for any events yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2 mt-3">
                    {userEvents.map((ev, idx) => {
                      const { date, time } = formatEventDate(ev);
                      const title = ev?.title || ev?.name || "Event";
                      const place = ev?.place || ev?.location || ev?.address || "";
                      const icon = ev?.icon || ev?.category || "📅";
                      return (
                        <div
                          key={ev?.id ?? ev?.event_id ?? idx}
                          className="card border-0 shadow-sm p-3"
                          style={{ borderRadius: 18 }}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: 44,
                                height: 44,
                                background: "rgba(139, 26, 48, 0.10)",
                                fontSize: 20,
                                flexShrink: 0,
                              }}
                            >
                              {icon}
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold" style={{ color: "#231B59" }}>
                                {title}
                              </div>
                              <div className="text-muted" style={{ fontSize: 13 }}>
                                {place}
                              </div>
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                {date}{time ? ` · ${time}` : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "28px" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">
                  <BookOpenIcon style={{ width: 22 }} /> Currently Reading
                </h5>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setPickerMode("reading");
                    setIsBookModalOpen(true);
                  }}
                >
                  Change
                </button>
              </div>

              {!current ? (
                <p className="text-muted">Your library is empty.</p>
              ) : (
                <>
                  <div className="text-center">
                    <img src={current.thumbnail || "https://via.placeholder.com/140x180"} alt={current.title} style={{ width: 140 }} />
                    <p className="fw-bold mt-3">{current.title}</p>
                    <p className="text-muted">{getAuthorsArray(current).join(", ")}</p>
                  </div>

                  <hr />

                  <h6 className="fw-bold">My Library</h6>
                  <div className="d-flex flex-column gap-3">
                    {loadingLibrary ? (
                      <p className="text-muted mb-0">Loading...</p>
                    ) : (
                      libraryBooks.map((b) => (
                        <div key={b.isbn} className="d-flex gap-3 align-items-start">
                          <img src={b.thumbnail || "https://via.placeholder.com/60x90"} alt={b.title} style={{ width: 55 }} />
                          <div className="flex-grow-1">
                            <div className="fw-bold">{b.title}</div>
                            <div className="text-muted">{getAuthorsArray(b).join(", ")}</div>
                          </div>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromLibrary(b.isbn)} disabled={deletingIsbn === normalizeIsbn(b.isbn)}>
                            <TrashIcon style={{ width: 16 }} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <MyLibraryPickerModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setActiveSlot(null);
          setPickerMode("top3");
        }}
        books={libraryBooks}
        onSelect={handleBookSelect}
      />
    </div>
  );
};
