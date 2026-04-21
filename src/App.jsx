import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  getDocs, // Добавлено для одноразовой загрузки
} from "firebase/firestore";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Admin from "./components/Admin";

// ФУНКЦИЯ ОПТИМИЗАЦИИ КАРТИНОК CLOUDINARY
const optimizeImage = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto,w_800/");
};

function App() {
  // СОСТОЯНИЯ АВТОРИЗАЦИИ
  const [view, setView] = useState("shop");
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Данные формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const REGISTRATION_KEY = "g33k3d@th3funct1on";

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

  // ПАГИНАЦИЯ И АРХИВ
  const [visibleCount, setVisibleCount] = useState(8);
  const [isArchiveMode, setIsArchiveMode] = useState(false);

  // ФУНКЦИЯ ТЕХ. ОБСЛУЖИВАНИЯ
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [heroVideo, setHeroVideo] = useState("");

  // 1. СЕКРЕТНЫЕ КЛАВИШИ
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.code === "KeyV") setView("auth");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Слушатель тех. обслуживания
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "siteConfig"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsMaintenance(data.isMaintenance || false);
        setHeroVideo(data.heroVideo || "");
      }
    });
    return () => unsub();
  }, []);

  // 2. СЛУШАТЕЛЬ АВТОРИЗАЦИИ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
        if (adminDoc.exists()) setAdminData(adminDoc.data());
      } else {
        setAdminData(null);
        if (view === "admin") setView("shop");
      }
    });
    return () => unsubscribe();
  }, [view]);

  // 3. ЗАГРУЗКА ДАННЫХ С УМНЫМ КЭШИРОВАНИЕМ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedProducts = localStorage.getItem("veyrix_products");
        const cacheTimestamp = localStorage.getItem("veyrix_cache_time");
        const now = new Date().getTime();

        // Кэш живет 4 часа (1000 мс * 60 сек * 60 мин * 4 ч)
        const CACHE_LIFETIME = 1000 * 60 * 60 * 4;

        if (
          cachedProducts &&
          cacheTimestamp &&
          now - parseInt(cacheTimestamp) < CACHE_LIFETIME
        ) {
          // Берем из памяти браузера (0 чтений базы)
          setProducts(JSON.parse(cachedProducts));
          setLoading(false);
        } else {
          // Качаем из базы и сохраняем в память
          const q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc"),
          );
          const snapshot = await getDocs(q);
          const freshProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          localStorage.setItem(
            "veyrix_products",
            JSON.stringify(freshProducts),
          );
          localStorage.setItem("veyrix_cache_time", now.toString());

          setProducts(freshProducts);
          setLoading(false);
        }

        // Категории весят копейки, качаем их просто один раз без слушателя
        const catSnapshot = await getDocs(collection(db, "categories"));
        setCategories(
          catSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes("?coll=")) {
        const collName = decodeURIComponent(hash.split("?coll=")[1]);
        setActiveCollection(collName);
        setActiveCategory(null);
        setIsArchiveMode(false);
        setVisibleCount(8);
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
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // 4. ОБРАБОТКА АВТОРИЗАЦИИ
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLoginTab) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const masterKey = prompt("ENTER MASTER KEY TO INITIALIZE ADMIN:");
        if (masterKey !== REGISTRATION_KEY) return alert("ACCESS DENIED");
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await setDoc(doc(db, "admins", userCredential.user.uid), {
          firstName,
          lastName,
          email,
          createdAt: new Date(),
        });
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
  const handleResetPassword = async () => {
    if (!email) return alert("Please enter email.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset link sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  // 5. ЛОГИКА ТОВАРОВ
  const getProcessedProducts = () => {
    let result = products.filter((p) => {
      const isSoldOut = p.status === "sold_out";
      const archiveMatch = isArchiveMode ? isSoldOut : !isSoldOut;
      const matchCollection = activeCollection
        ? p.collection === activeCollection
        : true;
      const matchCategory = activeCategory
        ? p.category === activeCategory
        : true;
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return archiveMatch && matchCollection && matchCategory && matchSearch;
    });

    return result.sort((a, b) => {
      if (sortMethod === "price_asc") return a.price - b.price;
      if (sortMethod === "price_desc") return b.price - a.price;
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return sortMethod === "oldest" ? tA - tB : tB - tA;
    });
  };

  const allFilteredProducts = getProcessedProducts();
  const displayedProducts = allFilteredProducts.slice(0, visibleCount);
  const sortLabels = {
    newest: "Newest First",
    oldest: "Oldest First",
    price_asc: "Price: Low-High",
    price_desc: "Price: High-Low",
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setActiveImage(null);
  };

  // --- ЛОГИКА ПОРЯДКА ЭКРАНОВ ---

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono uppercase tracking-[0.5em] text-[10px]">
        Veyrix Studio is loading...
      </div>
    );

  // 1. Приоритет входу (чтобы зайти в админку во время тех. работ)
  if (view === "auth") {
    return (
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
            {!isLoginTab && (
              <>
                <input
                  type="text"
                  placeholder="FIRST NAME"
                  required
                  className="border-b border-neutral-200 py-3 outline-none text-[12px] focus:border-black"
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="LAST NAME"
                  required
                  className="border-b border-neutral-200 py-3 outline-none text-[12px] focus:border-black"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </>
            )}
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
              {isLoginTab ? "Enter Terminal" : "Initialize Admin"}
            </button>
            {isLoginTab && (
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[9px] uppercase text-neutral-400 hover:text-black transition-colors"
              >
                Forgot Password?
              </button>
            )}
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
    );
  }

  // 2. Заглушка Maintenance
  if (isMaintenance && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center font-mono">
        <h1 className="text-[12px] uppercase tracking-[0.8em] mb-8 font-bold">
          Veyrix Studio
        </h1>
        <div className="w-12 h-[1px] bg-black mb-8 animate-pulse"></div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 leading-relaxed">
          Offline for Maintenance.
          <br />
          We are updating the collection.
        </p>
        <button
          onClick={() => setView("auth")}
          className="mt-20 text-[8px] uppercase text-neutral-200 hover:text-neutral-400 transition-colors"
        >
          Admin Terminal
        </button>
      </div>
    );
  }

  // 3. Основной рендер
  return (
    <main className="bg-white min-h-screen font-sans">
      {user && (
        <button
          onClick={() => setView(view === "shop" ? "admin" : "shop")}
          className="fixed bottom-6 right-6 z-[300] bg-black text-white text-[9px] px-6 py-3 uppercase tracking-[0.3em] rounded-full shadow-2xl transition-all hover:scale-105"
        >
          {view === "shop" ? "Terminal" : "Store"}
        </button>
      )}

      {view === "shop" ? (
        <>
          <Header
            onSearch={(val) => {
              setSearchQuery(val);
              setVisibleCount(8);
            }}
            onLogoClick={() => setView("auth")}
            onArchiveToggle={(mode) => {
              setIsArchiveMode(mode);
              setVisibleCount(8);
            }}
            isArchiveMode={isArchiveMode}
          />
          <Hero videoUrl={heroVideo} />
          <section
            id="catalog"
            className="max-w-[1400px] mx-auto py-16 md:py-32 px-4 md:px-6 min-h-[50vh]"
          >
            <div className="mb-12 md:mb-20 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-100 pb-8 relative gap-6 z-[100]">
              <h2 className="text-[14px] md:text-[16px] uppercase tracking-[0.6em] font-bold">
                {isArchiveMode ? "Archive" : "Catalogue"}
              </h2>
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-6 py-2 border border-neutral-200 rounded-full text-[10px] uppercase tracking-[0.2em]"
                  >
                    <span>{activeCategory || "Category"}</span>
                    <span className={isFilterOpen ? "rotate-180" : ""}>↓</span>
                  </button>
                  {isFilterOpen && (
                    <div className="absolute left-0 md:right-0 mt-2 w-56 bg-white border border-neutral-100 shadow-2xl z-[120] py-2">
                      <button
                        onClick={() => {
                          setActiveCategory(null);
                          setIsFilterOpen(false);
                          setVisibleCount(8);
                        }}
                        className="w-full text-left px-6 py-3 text-[10px] uppercase hover:bg-neutral-50"
                      >
                        All Pieces
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveCategory(cat.name);
                            setIsFilterOpen(false);
                            setVisibleCount(8);
                          }}
                          className="w-full text-left px-6 py-3 text-[10px] uppercase hover:bg-neutral-50"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative flex-1 md:flex-none">
                  <button
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-6 py-2 border border-neutral-200 rounded-full text-[10px] uppercase tracking-[0.2em]"
                  >
                    <span>{sortLabels[sortMethod]}</span>
                    <span className={isSortOpen ? "rotate-180" : ""}>↓</span>
                  </button>
                  {isSortOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 shadow-2xl z-[120] py-2">
                      {Object.entries(sortLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSortMethod(key);
                            setIsSortOpen(false);
                          }}
                          className="w-full text-left px-6 py-3 text-[10px] uppercase hover:bg-neutral-50"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-12 md:gap-y-20 relative z-10">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-4 relative">
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
                    {/* ТУТ ИСПОЛЬЗУЕТСЯ ОПТИМИЗАЦИЯ КАРТИНКИ */}
                    <img
                      src={optimizeImage(product.image)}
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

            {displayedProducts.length === 0 && (
              <p className="text-center text-[10px] uppercase tracking-widest text-neutral-300 py-32">
                The archive is currently empty.
              </p>
            )}
            {allFilteredProducts.length > visibleCount && (
              <div className="mt-24 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="px-12 py-4 border border-black text-[10px] uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all"
                >
                  Load More
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="relative">
          {user && adminData && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] text-center hidden md:block">
              <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-neutral-400">
                Welcome back,{" "}
                <span className="text-black font-bold">
                  {adminData?.firstName || "Admin"}
                </span>
              </p>
            </div>
          )}
          <Admin />
          <button
            onClick={handleLogout}
            className="fixed top-6 right-6 z-[500] text-[9px] uppercase bg-red-50 text-red-500 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* МОДАЛКА ТОВАРА */}
      {selectedProduct && view === "shop" && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center md:p-4 bg-black/20 md:bg-transparent">
          <div
            className="absolute inset-0 md:bg-white/95 md:backdrop-blur-md"
            onClick={closeProduct}
          ></div>
          <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-w-[1000px] md:max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-t-2xl md:rounded-none animate-slideUp">
            <button
              onClick={closeProduct}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-[9px] md:text-[10px] uppercase z-[510]"
            >
              Close [x]
            </button>
            <div className="w-full md:w-3/5 bg-neutral-100 flex flex-col h-[55vh] md:h-auto shrink-0">
              {/* ТУТ ТОЖЕ ИСПОЛЬЗУЕТСЯ ОПТИМИЗАЦИЯ КАРТИНКИ */}
              <img
                src={optimizeImage(activeImage || selectedProduct.image)}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
            <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col">
              <span className="text-[8px] uppercase tracking-[0.4em] text-neutral-400 mb-3 block">
                {selectedProduct.collection}
              </span>
              <h2 className="text-lg md:text-xl uppercase tracking-widest mb-3 font-bold">
                {selectedProduct.name}
              </h2>
              <p className="text-lg font-light mb-8">
                $ {selectedProduct.price}.00
              </p>
              <div className="mb-8">
                <h4 className="text-[8px] uppercase tracking-[0.3em] text-neutral-400 mb-4">
                  {selectedProduct.status === "sold_out"
                    ? "Status"
                    : "Select Size"}
                </h4>
                {selectedProduct.status === "sold_out" ? (
                  <div className="text-[10px] uppercase tracking-widest text-red-500 border border-red-100 px-4 py-2 bg-red-50 w-fit">
                    Item Archived
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes?.split(",").map((s) => (
                      <div
                        key={s}
                        className="min-w-[44px] h-[44px] border border-neutral-200 flex items-center justify-center text-[10px] uppercase hover:bg-black hover:text-white transition-all cursor-pointer"
                      >
                        {s.trim()}
                      </div>
                    )) || (
                      <div className="h-[44px] px-6 border border-black flex items-center justify-center text-[10px] uppercase">
                        One Size
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-600 mb-8 border-t pt-6 whitespace-pre-line">
                {selectedProduct.details}
              </p>
              {selectedProduct.status !== "sold_out" && (
                <a
                  href={selectedProduct.etsyUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-fit min-w-[140px] mx-auto py-2.5 px-6 rounded-lg bg-black text-white hover:scale-[1.03] shadow-lg"
                >
                  <span className="text-[#F1641E] text-xl font-serif font-bold">
                    E
                  </span>
                  <span className="text-white text-[10px] uppercase tracking-widest font-bold">
                    Buy via Etsy
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
