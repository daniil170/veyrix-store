import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  return (
    <>
      {/* MAIN HEADER */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 bg-white border-b border-neutral-100 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 py-8 md:py-10 flex items-center justify-between">
          
          <button onClick={() => setIsMenuOpen(true)} className="flex flex-col gap-1.5 group cursor-pointer w-10 z-10">
            <div className="w-6 h-[1px] bg-black transition-all group-hover:w-8"></div>
            <div className="w-4 h-[1px] bg-black transition-all group-hover:w-10"></div>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <a href="/" className="block">
              <img 
                src="/black-logo.svg" 
                alt="VEYRIX" 
                className="h-14 md:h-20 lg:h-24 w-auto object-contain transition-transform duration-500 hover:scale-105" 
              />
            </a>
          </div>

          <button className="w-10 flex justify-end text-black hover:opacity-50 transition-all z-10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* OVERLAY BACKGROUND */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* SIDE MENU PANEL */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-[400px] z-[70] bg-black transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* MENU TOP: LARGE LOGO */}
        <div className="p-10 flex flex-col gap-10">
          <div className="flex justify-between items-start">
            <img 
              src="/black-logo.svg" 
              alt="VEYRIX" 
              className="h-12 md:h-16 w-auto object-contain invert brightness-200" 
            />
            
            <button onClick={() => setIsMenuOpen(false)} className="text-white hover:rotate-90 transition-transform duration-500 p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* MENU CENTER: NAV LINKS */}
        <nav className="px-12 py-10 font-mono flex-grow">
          <ul className="flex flex-col gap-8">
            {[
              'Second Anniversary',
              'Shop',
              'Archive',
              'Random',
              'Service Client'
            ].map((item) => (
              <li key={item} className="overflow-hidden group">
                <a 
                  href="#" 
                  className="text-white text-[12px] uppercase tracking-[0.4em] font-light opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 block"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* MENU BOTTOM: COPYRIGHT */}
        <div className="p-12 space-y-8">
          <a href="#" className="text-white opacity-40 hover:opacity-100 transition-opacity block">
            <span className="text-[10px] uppercase tracking-[0.3em]">Instagram</span>
          </a>
          
          <div className="border-t border-white/10 pt-8">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] leading-relaxed font-mono">
              © 2026 VEYRIX STUDIO.<br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;