import React from 'react';

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-veyrix-black">
      {/* Блок видео-фона */}
      <div className="absolute inset-0 z-0">
        {/* Когда видео будет готово, положи его в public/hero-bg.mp4 и раскомментируй код ниже */}
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video> 
        */}
        
        {/* Временный фон, пока нет видео */}
        <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-veyrix-black opacity-80"></div>
      </div>

      {/* Контент: Название и Кнопка */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-veyrix-white text-3xl md:text-5xl lg:text-7xl font-extralight tracking-[0.15em] uppercase mb-8 drop-shadow-2xl">
          VEYRIX
        </h1>
        
        <button 
          className="group relative px-10 py-4 border border-veyrix-white text-veyrix-white overflow-hidden transition-all duration-500 hover:text-veyrix-black"
          onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="relative z-10 tracking-[0.2em] text-xs uppercase">
            SHOP NOW
          </span>
          <div className="absolute inset-0 bg-veyrix-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>

      {/* Индикатор скролла */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden md:block">
        <div className="w-[1px] h-12 bg-veyrix-white"></div>
      </div>
    </section>
  );
};

export default Hero;