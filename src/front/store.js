function getStoredEvents() {
  try {
    const raw = localStorage.getItem("event_global_list");
    if (!raw || raw === "undefined" || raw === "null") return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const initialStore = () => ({
  favorites: [],
  selectedBook: (() => {
    try {
      const raw = localStorage.getItem("selected_book");
      if (!raw || raw === "undefined" || raw === "null") return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })(),
  eventGlobalList: getStoredEvents(),
});

function persistEvents(list) {
  try {
    localStorage.setItem("event_global_list", JSON.stringify(list));
    // Disparar en el siguiente tick para no actualizar otros componentes durante el render del StoreProvider
    setTimeout(() => {
      window.dispatchEvent(new Event("local-storage-changed"));
    }, 0);
  } catch (_) {}
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_events":
      const list = Array.isArray(action.payload) ? action.payload : [];
      persistEvents(list);
      return { ...store, eventGlobalList: list };

    case "add_event":
      const next = [...store.eventGlobalList, action.payload];
      persistEvents(next);
      return { ...store, eventGlobalList: next };

    case "delete_event": {
      const idToDelete = action.payload;
      const filtered = (store.eventGlobalList || []).filter((ev) => ev.id !== idToDelete);
      persistEvents(filtered);
      return { ...store, eventGlobalList: filtered };
    }


case 'add_favorite':
const exists = store.favorites.some(fav => 
        (fav.isbn && fav.isbn === action.payload.isbn) || 
        fav.title === action.payload.title
    );

if (exists) {
        console.warn("Este libro ya está en tus favoritos");
        return store;
    }

    return {
        ...store,
        favorites: [...store.favorites, action.payload]
    };

      case 'set_selected_book':
      localStorage.setItem("selected_book", JSON.stringify(action.payload));
      return {
        ...store,
        selectedBook: action.payload
      };

case 'delete_favorite':


      const updatedFavorites = store.favorites.filter((_, index) => index !== action.payload);

      const bookBeingRemoved = store.favorites[action.payload];
      let newSelected = store.selectedBook;
    
    if (store.selectedBook && bookBeingRemoved && store.selectedBook.title === bookBeingRemoved.title) {
        newSelected = null;
        localStorage.removeItem("selected_book");
    }

      return {
        ...store,
        favorites: updatedFavorites,
        selectedBook: newSelected
      };

    default:
      return store;
  }    
};