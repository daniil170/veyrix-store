import React from 'react';
import Hero from './components/Hero';

function App() {
  return (
    <main className="min-h-screen bg-veyrix-black">
      {/* Главная страница (Home) */}
      <Hero />

      {/* Секция Каталога (Shop) - заготовка по ТЗ */}
      <section id="catalog" className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-veyrix-white text-xl md:text-2xl tracking-[0.3em] uppercase opacity-50">
            Каталог в разработке
          </h2>
          <p className="text-veyrix-white/30 mt-4 font-light uppercase text-[10px] tracking-widest">
            Coming Soon / VEYRIX 2026
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;