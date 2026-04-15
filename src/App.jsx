import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductModal from "./components/ProductModal"; // Импортируем модалку

function App() {
  // Состояние для выбранного товара
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Временные данные товаров (завтра перенесем в Firebase)
  const products = [
    {
      id: 1,
      name: "Essential Tee v1",
      collection: "Anniversary",
      category: "T-Shirts",
      price: 140,
      etsyUrl: "https://www.etsy.com",
      details:
        "Premium cotton t-shirt with a relaxed fit. Designed for everyday comfort and longevity.",
    },
    {
      id: 2,
      name: "Studio Hoodie",
      collection: "Essentials",
      category: "Outerwear",
      price: 280,
      etsyUrl: "https://www.etsy.com",
      details:
        "Heavyweight fleece hoodie. Featuring dropped shoulders and a minimalist silhouette.",
    },
    {
      id: 3,
      name: "Veyrix Cap",
      collection: "Archive",
      category: "Accessories",
      price: 85,
      etsyUrl: "https://www.etsy.com",
      details: "Adjustable 6-panel cap with embroidered logo detail.",
    },
    {
      id: 4,
      name: "Worker Pants",
      collection: "Essentials",
      category: "Bottoms",
      price: 220,
      etsyUrl: "https://www.etsy.com",
      details: "Durable canvas trousers with a straight leg cut.",
    },
    {
      id: 5,
      name: "Item 05",
      collection: "Random",
      category: "T-Shirts",
      price: 140,
    },
    {
      id: 6,
      name: "Item 06",
      collection: "Random",
      category: "T-Shirts",
      price: 140,
    },
    {
      id: 7,
      name: "Item 07",
      collection: "Random",
      category: "T-Shirts",
      price: 140,
    },
    {
      id: 8,
      name: "Item 08",
      collection: "Random",
      category: "T-Shirts",
      price: 140,
    },
  ];

  return (
    <main className="bg-white min-h-screen">
      <Hero />
      <Header />

      {/* Секция каталога */}
      <section id="catalog" className="max-w-[1200px] mx-auto py-32 px-6">
        <div className="mb-20 text-center">
          <span className="text-[10px] uppercase tracking-[1em] text-neutral-400 font-light">
            Selected Pieces
          </span>
        </div>

        {/* Сетка товаров */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)} // Клик открывает модалку
            >
              {/* Оболочка фото */}
              <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-neutral-300 opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                  View Details
                </div>
                {/* Плейсхолдер для фото */}
                <div className="w-full h-full bg-neutral-100 transition-transform duration-1000 group-hover:scale-105"></div>
              </div>

              {/* Инфо о товаре */}
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[11px] uppercase tracking-widest text-black font-medium transition-colors group-hover:text-neutral-500">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-black">$ {product.price}</p>
                </div>
                <p className="text-[9px] text-neutral-400 uppercase tracking-widest">
                  {product.collection} / {product.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Модальное окно товара */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <footer className="py-20 text-center border-t border-neutral-100">
        <p className="text-[9px] tracking-[0.8em] text-neutral-300 uppercase">
          © 2026 VEYRIX STUDIO
        </p>
      </footer>
    </main>
  );
}

export default App;
