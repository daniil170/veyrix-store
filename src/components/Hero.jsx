import React from "react";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white">
      {/* Блок видео-фона или светлого градиента */}
      <div className="absolute inset-0 z-0">
        {/* Когда видео будет готово, оно будет играть роль динамичного фона */}
        {/* <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20" 
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video> 
        */}

        {/* Временный светлый фон (вместо черного градиента) */}
        <div className="w-full h-full bg-gradient-to-b from-neutral-50 to-white"></div>
      </div>

      {/* Контент: Название и Кнопка */}
      <div className="relative z-10 text-center px-4">
        {/* Цвет текста изменен на черный (text-black) */}
        <h1 className="text-black text-3xl md:text-5xl lg:text-7xl font-extralight tracking-[0.15em] uppercase mb-10">
          VEYRIX
        </h1>

        <button
          className="group relative px-10 py-4 border border-black text-black overflow-hidden transition-all duration-500"
          onClick={() =>
            document
              .getElementById("catalog")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          {/* Текст кнопки: при наведении становится белым на черном фоне */}
          <span className="relative z-10 tracking-[0.2em] text-xs uppercase group-hover:text-white transition-colors duration-500">
            Shop Now
          </span>

          {/* Слой заливки: теперь он черный и выезжает снизу */}
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>

      {/* Индикатор скролла (черная линия) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
        <div className="w-[1px] h-12 bg-black"></div>
      </div>
    </section>
  );
};

export default Hero;