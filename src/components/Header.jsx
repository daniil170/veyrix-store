import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// ДОБАВИЛИ activeCollection В ПРОПСЫ
const Header = ({
  onSearch,
  onLogoClick,
  onArchiveToggle,
  isArchiveMode,
  activeCollection,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [collectionsList, setCollectionsList] = useState([]);

  const [clickCount, setClickCount] = useState(0);
  const baseUrl = import.meta.env.BASE_URL;

  // Слушатель коллекций и скролла
  useEffect(() => {
    const handleScroll = () => {
      const isShortPage =
        document.documentElement.scrollHeight <= window.innerHeight;
      setIsVisible(
        isShortPage ? true : window.scrollY > window.innerHeight * 0.5,
      );
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const unsubColls = onSnapshot(collection(db, "collections"), (snapshot) => {
      setCollectionsList(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubColls();
    };
  }, [isArchiveMode]);

  const handleLogoTouch = () => {
    setClickCount((prev) => prev + 1);
    const timer = setTimeout(() => setClickCount(0), 1000);
    if (clickCount + 1 >= 3) {
      onLogoClick();
      setClickCount(0);
      clearTimeout(timer);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setLocalSearch("");
      onSearch("");
    }
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[200] transition-all duration-700 bg-white border-b border-neutral-100 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-8 md:py-10 flex items-center justify-between relative overflow-hidden">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col gap-1.5 group cursor-pointer w-10 z-20"
          >
            <div className="w-6 h-[1px] bg-black transition-all group-hover:w-8"></div>
            <div className="w-4 h-[1px] bg-black transition-all group-hover:w-10"></div>
          </button>

          <div
            onClick={handleLogoTouch}
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 cursor-pointer ${isSearchOpen ? "opacity-0 invisible md:opacity-100 md:visible" : "opacity-100 visible"}`}
          >
            <img
              src={`${baseUrl}black-logo.svg`}
              alt="VEYRIX"
              className="h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform hover:scale-105"
            />
          </div>

          <div className="flex items-center z-20">
            <div
              className={`flex items-center transition-all duration-500 ease-out ${isSearchOpen ? "w-[160px] md:w-[250px] opacity-100" : "w-0 opacity-0"} overflow-hidden`}
            >
              <input
                autoFocus
                type="text"
                placeholder="SEARCH PIECE..."
                value={localSearch}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-b border-black outline-none text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-1 px-2 font-mono"
              />
            </div>
            <button
              onClick={toggleSearch}
              className="ml-2 p-2 hover:scale-110 transition-transform"
            >
              {isSearchOpen ? (
                <span className="text-[12px] font-light font-mono">✕</span>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[1000] bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[400px] z-[1001] bg-black transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-10 flex justify-between items-start">
          <img
            src={`${baseUrl}black-logo.svg`}
            alt="VEYRIX"
            className="h-12 w-auto invert brightness-200"
          />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white hover:rotate-90 transition-all p-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="px-12 py-10 font-mono flex-grow overflow-y-auto">
          <ul className="flex flex-col gap-8">
            <li>
              <a
                href="#catalog"
                onClick={() => {
                  setIsMenuOpen(false);
                  onArchiveToggle(false);
                }}
                className={`text-[12px] uppercase tracking-[0.4em] font-light block hover:translate-x-2 transition-all ${!isArchiveMode && !activeCollection ? "text-white opacity-100" : "text-white/40"}`}
              >
                All Pieces
              </a>
            </li>

            <li>
              <a
                href="#catalog"
                onClick={() => {
                  setIsMenuOpen(false);
                  onArchiveToggle(true);
                }}
                className={`text-[12px] uppercase tracking-[0.4em] font-light block hover:translate-x-2 transition-all ${isArchiveMode ? "text-white opacity-100" : "text-white/40"}`}
              >
                Archive{" "}
                <span className="ml-2 text-[8px] opacity-50">(Sold Out)</span>
              </a>
            </li>

            <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mt-6 mb-2">
              Collections
            </p>
            {collectionsList.map((coll) => {
              // ПРОВЕРКА: Активна ли эта коллекция сейчас?
              const isActive = activeCollection === coll.name && !isArchiveMode;

              return (
                <li key={coll.id}>
                  <a
                    href={`#catalog?coll=${coll.name}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      onArchiveToggle(false);
                    }}
                    className={`text-[12px] uppercase tracking-[0.4em] font-light block hover:translate-x-2 transition-all ${isActive ? "text-white opacity-100" : "text-white/40"}`}
                  >
                    {coll.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-12 border-t border-white/10 flex flex-col gap-8">
          <a
            href="https://www.instagram.com/veyrix.co"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
              Instagram
            </span>
          </a>
          <div className="flex flex-col gap-4">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] leading-relaxed font-mono">
              © 2026 VEYRIX STUDIO.
              <br />
              All rights reserved.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-mono">
                Developed by
              </span>
              <span className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-mono">
                Ivakin Daniil
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
