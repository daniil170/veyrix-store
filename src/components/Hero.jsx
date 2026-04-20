import React from "react";

// ФУНКЦИЯ ОПТИМИЗАЦИИ ВИДЕО CLOUDINARY
const optimizeVideo = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  // Сжимаем видео, ставим автоформат и ограничиваем ширину до 1080px (хватит для любых мобилок и планшетов)
  return url.replace("/upload/", "/upload/q_auto,f_auto,w_1080/");
};

const Hero = ({ videoUrl }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white">
      {/* Блок видео-фона */}
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            key={videoUrl}
            className="w-full h-full object-cover opacity-20"
          >
            {/* ТУТ ИСПОЛЬЗУЕТСЯ ФУНКЦИЯ СЖАТИЯ */}
            <source src={optimizeVideo(videoUrl)} type="video/mp4" />
          </video>
        ) : (
          /* Временный светлый фон, если видео не задано */
          <div className="w-full h-full bg-gradient-to-b from-neutral-50 to-white"></div>
        )}
      </div>

      {/* Контент */}
      <div className="relative z-10 text-center px-4">
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
          <span className="relative z-10 tracking-[0.2em] text-xs uppercase group-hover:text-white transition-colors duration-500">
            Shop Now
          </span>
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden md:block">
        <div className="w-[1px] h-12 bg-black"></div>
      </div>
    </section>
  );
};

export default Hero;
