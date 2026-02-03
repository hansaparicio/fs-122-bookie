import React, { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import { PencilIcon, BookOpenIcon, TagIcon, TrashIcon } from "@heroicons/react/24/outline";
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
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [newGenre, setNewGenre] = useState("");

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("reading");

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

  const handleBookSelect = (book) => {
    if (pickerMode === "reading") {
      setCurrentlyReading(book);
      setIsBookModalOpen(false);
    }
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
          setPickerMode("reading");
        }}
        books={libraryBooks}
        onSelect={handleBookSelect}
      />
    </div>
  );
};
