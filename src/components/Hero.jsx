import React from "react";

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
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Видео-фон */}
      <div className="absolute inset-0 z-0 bg-black/20"> 
        {videoUrl && (
          <video
            autoPlay
            loop
            muted
            playsInline
            key={videoUrl}
            poster={getPosterUrl(videoUrl)}
            className="w-full h-full object-cover opacity-100 transition-opacity duration-1000"
          >
            <source src={optimizeVideo(videoUrl)} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Контент */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center">
        
        {/* ЛОГОТИП (Сделан ЕЩЕ БОЛЬШЕ) */}
        {/* w-72 (мобилки), md:w-[400px] (планшеты), lg:w-[500px] (ноутбуки и ПК) */}
        <img 
          src={`${baseUrl}logo.png`} 
          alt="Veyrix Logo" 
          className="w-72 md:w-[400px] lg:w-[500px] mb-20 drop-shadow-md object-contain"
        />

        {/* Кнопка Shop All */}
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