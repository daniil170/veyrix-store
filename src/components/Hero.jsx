import React from "react";

const baseUrl = import.meta.env.BASE_URL;

const optimizeVideo = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/q_auto,f_auto,w_1080/");
};

const getPosterUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return "";
  const optimizedUrl = optimizeVideo(url);
  return optimizedUrl.replace(/\.[^/.]+$/, ".jpg");
};

const Hero = ({ videoUrl }) => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Блок видео-фона (УБРАЛИ БЕЛОЕ ТОНИРОВАНИЕ) */}
      <div className="absolute inset-0 z-0 bg-black/20">
        {videoUrl && (
          <video
            autoPlay
            loop
            muted
            playsInline
            key={videoUrl}
            poster={getPosterUrl(videoUrl)}
            /* Видео теперь непрозрачное (opacity-100 вместо opacity-20) */
            className="w-full h-full object-cover opacity-100 transition-opacity duration-1000"
          >
            <source src={optimizeVideo(videoUrl)} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Контент */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        <img
          src={`${baseUrl}/logo.png`}
          alt="Veyrix Logo"
          className="w-48 md:w-64 lg:w-80 mb-10 drop-shadow-md object-contain"
        />

        {/* КНОПКА (УМЕНЬШЕНА НА ~10%) */}
        <button
          className="group relative px-8 py-3 border border-white text-white overflow-hidden transition-all duration-500 bg-black/10 backdrop-blur-sm hover:bg-transparent"
          onClick={() =>
            document
              .getElementById("catalog")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <span className="relative z-10 tracking-[0.2em] text-[10px] md:text-xs uppercase group-hover:text-black transition-colors duration-500 font-bold">
            Shop All
          </span>
          {/* Фон при наведении теперь белый, чтобы текст был контрастным */}
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
        <div className="w-[1px] h-12 bg-white"></div>
      </div>
    </section>
  );
};

export default Hero;
