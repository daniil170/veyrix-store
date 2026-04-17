import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Admin from "./components/Admin";

function App() {
  // СОСТОЯНИЯ АВТОРИЗАЦИИ
  const [view, setView] = useState("shop");
  const [user, setUser] = useState(null);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // СОСТОЯНИЯ МАГАЗИНА
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  // ФИЛЬТРАЦИЯ И ПОИСК
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortMethod, setSortMethod] = useState("newest");

  // 1. СЛУШАТЕЛЬ АВТОРИЗАЦИИ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && view === "admin") setView("shop");
    });
    return () => unsubscribe();
  }, [view]);

  // 2. ЗАГРУЗКА ДАННЫХ И ХЕНДЛЕР ХЭША
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes("?coll=")) {
        const collName = decodeURIComponent(hash.split("?coll=")[1]);
        setActiveCollection(collName);
        setActiveCategory(null);
        document
          .getElementById("catalog")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        setActiveCollection(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => {
      unsubProducts();
      unsubCats();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // 3. ОБРАБОТКА ВХОДА / РЕГИСТРАЦИИ
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLoginTab) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
      }
      setView("admin");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setView("shop");
  };

  // 4. ЛОГИКА ОБРАБОТКИ ТОВАРОВ (ФИЛЬТРЫ + ПОИСК + СОРТИРОВКА)
  const getProcessedProducts = () => {
    let result = products.filter((p) => {
      const matchCollection = activeCollection
        ? p.collection === activeCollection
        : true;
      const matchCategory = activeCategory
        ? p.category === activeCategory
        : true;
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCollection && matchCategory && matchSearch;
    });

    return result.sort((a, b) => {
      if (sortMethod === "price_asc") return a.price - b.price;
      if (sortMethod === "price_desc") return b.price - a.price;
      if (sortMethod === "oldest")
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      if (sortMethod === "newest")
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      return 0;
    });
  };

  const displayedProducts = getProcessedProducts();
  const sortLabels = {
    newest: "Newest First",
    oldest: "Oldest First",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setActiveImage(null);
  };

  return (
    <main className="bg-white min-h-screen font-sans">
      {/* ПЛАВАЮЩАЯ КНОПКА ТЕРМИНАЛА (только для админа) */}
      {user && (
        <button
          onClick={() => setView(view === "shop" ? "admin" : "shop")}
          className="fixed bottom-6 right-6 z-[300] bg-black text-white text-[9px] px-6 py-3 uppercase tracking-[0.3em] rounded-full shadow-2xl transition-all hover:scale-105"
        >
          {view === "shop" ? "Terminal" : "Back to Store"}
        </button>
      )}

      {view === "shop" ? (
        <>
          <Header onSearch={setSearchQuery} />
          <Hero />

          <section
            id="catalog"
            className="max-w-[1400px] mx-auto py-16 md:py-32 px-4 md:px-6"
          >
            {/* ШАПКА КАТАЛОГА */}
            <div className="mb-12 md:mb-20 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-100 pb-8 relative gap-6 z-[110]">
              <h2 className="text-[14px] md:text-[16px] uppercase tracking-[0.6em] font-bold flex flex-wrap items-center gap-4">
                Catalogue
                {activeCollection && (
                  <span className="text-[10px] text-neutral-300">
                    / {activeCollection}
                  </span>
                )}
                {searchQuery && (
                  <span className="text-[10px] text-neutral-300">
                    / Search: {searchQuery}
                  </span>
                )}
              </h2>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                {/* ВЫПАДАЮЩИЙ СПИСОК КАТЕГОРИЙ */}
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-6 py-2 border border-neutral-200 rounded-full text-[10px] uppercase tracking-[0.2em] bg-white hover:border-black transition-all"
                  >
                    <span>{activeCategory || "Category"}</span>
                    <span
                      className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
                    >
                      ↓
                    </span>
                  </button>
                  {isFilterOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[115]"
                        onClick={() => setIsFilterOpen(false)}
                      ></div>
                      <div className="absolute left-0 md:right-0 mt-2 w-56 bg-white border border-neutral-100 shadow-2xl z-[120] rounded-xl py-2 animate-fadeIn">
                        <button
                          onClick={() => {
                            setActiveCategory(null);
                            setIsFilterOpen(false);
                          }}
                          className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-neutral-50"
                        >
                          All Pieces
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setActiveCategory(cat.name);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-neutral-50 ${activeCategory === cat.name ? "font-bold" : "text-neutral-400"}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ВЫПАДАЮЩИЙ СПИСОК СОРТИРОВКИ */}
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-6 py-2 border border-neutral-200 rounded-full text-[10px] uppercase tracking-[0.2em] bg-white hover:border-black transition-all"
                  >
                    <span>{sortLabels[sortMethod]}</span>
                    <span
                      className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}
                    >
                      ↓
                    </span>
                  </button>
                  {isSortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[115]"
                        onClick={() => setIsSortOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 shadow-2xl z-[120] rounded-xl py-2 animate-fadeIn">
                        {Object.entries(sortLabels).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSortMethod(key);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-neutral-50 ${sortMethod === key ? "font-bold" : "text-neutral-400"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* СЕТКА ТОВАРОВ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-12 md:gap-y-20 relative z-10">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-4 md:mb-6 relative group">
                    {product.status === "low_stock" && (
                      <div className="absolute top-0 left-0 right-0 z-20 bg-black text-white text-center py-1.5 text-[7px] uppercase tracking-[0.3em]">
                        Limited Stock
                      </div>
                    )}
                    {product.status === "sold_out" && (
                      <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="border border-black px-4 py-2 bg-white/90 text-[10px] uppercase tracking-[0.4em] font-bold">
                          Archive
                        </div>
                      </div>
                    )}
                    <img
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                      alt=""
                    />
                  </div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold">
                    {product.name}
                  </h3>
                  <p className="text-[11px] font-light mt-1">
                    $ {product.price}.00
                  </p>
                </div>
              ))}
            </div>

            {/* ПУСТОЙ РЕЗУЛЬТАТ */}
            {displayedProducts.length === 0 && !loading && (
              <div className="py-32 text-center border border-dashed border-neutral-100 mt-10 animate-fadeIn">
                <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-300">
                  {searchQuery
                    ? `No pieces found for "${searchQuery}"`
                    : "No pieces found."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-[9px] uppercase underline text-neutral-400 hover:text-black tracking-widest"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>

          {/* СКРЫТЫЙ ВХОД В ФУТЕРЕ */}
          <footer className="py-20 text-center border-t border-neutral-50">
            <button
              onClick={() => setView(user ? "admin" : "auth")}
              className="text-[8px] text-neutral-200 uppercase tracking-[0.5em] hover:text-black transition-all"
            >
              {user ? "System Active" : "Staff Access"}
            </button>
          </footer>

          {/* МОДАЛКА ТОВАРА (сокращено для краткости, оставь свою реализацию) */}
          {selectedProduct && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/20">
              <div
                className="absolute inset-0 bg-white/95 backdrop-blur-md"
                onClick={closeProduct}
              ></div>
              <div className="relative bg-white w-full max-w-[1000px] max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl">
                <button
                  onClick={closeProduct}
                  className="absolute top-6 right-6 text-[10px] uppercase z-[510]"
                >
                  Close [x]
                </button>
                <div className="w-full md:w-3/5 bg-neutral-100">
                  <img
                    src={activeImage || selectedProduct.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="w-full md:w-2/5 p-12 flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 mb-4">
                    {selectedProduct.collection}
                  </span>
                  <h2 className="text-xl uppercase tracking-widest mb-6">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-lg font-light mb-8">
                    $ {selectedProduct.price}.00
                  </p>
                  <p className="text-[12px] leading-relaxed text-neutral-600 mb-10">
                    {selectedProduct.details}
                  </p>
                  <a
                    href={selectedProduct.etsyUrl}
                    target="_blank"
                    className="bg-black text-white py-3 text-center text-[10px] uppercase tracking-widest"
                  >
                    Buy on Etsy
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      ) : view === "auth" ? (
        /* ЭКРАН АВТОРИЗАЦИИ */
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 font-mono">
          <div className="bg-white p-10 shadow-2xl w-full max-w-[400px] animate-fadeIn">
            <div className="flex gap-8 mb-10 border-b border-neutral-100">
              <button
                onClick={() => setIsLoginTab(true)}
                className={`pb-4 text-[11px] uppercase tracking-[0.3em] ${isLoginTab ? "border-b-2 border-black font-bold" : "text-neutral-400"}`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLoginTab(false)}
                className={`pb-4 text-[11px] uppercase tracking-[0.3em] ${!isLoginTab ? "border-b-2 border-black font-bold" : "text-neutral-400"}`}
              >
                Register
              </button>
            </div>
            <form onSubmit={handleAuth} className="flex flex-col gap-6">
              <input
                type="email"
                placeholder="EMAIL"
                required
                className="border-b border-neutral-200 py-3 outline-none text-[12px] focus:border-black"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="PASSWORD"
                required
                className="border-b border-neutral-200 py-3 outline-none text-[12px] focus:border-black"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 shadow-xl">
                {isLoginTab ? "Enter Terminal" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => setView("shop")}
                className="text-[9px] uppercase tracking-tighter text-neutral-400 text-center"
              >
                Back to Store
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ПАНЕЛЬ АДМИНА */
        <div className="relative">
          <button
            onClick={handleLogout}
            className="fixed top-6 right-6 z-[500] text-[9px] uppercase bg-red-50 text-red-500 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
          >
            Logout
          </button>
          <Admin />
        </div>
      )}
    </main>
  );
}

export default App;
