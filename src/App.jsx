import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Admin from "./components/Admin";

function App() {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const closeProduct = () => {
    setSelectedProduct(null);
    setActiveImage(null);
  };

  return (
    <main className="bg-white min-h-screen font-sans">
      <button
        onClick={() => setView(view === "shop" ? "admin" : "shop")}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[300] bg-black text-white text-[8px] md:text-[9px] px-4 py-3 md:py-2 uppercase tracking-[0.3em] rounded-full opacity-30 hover:opacity-100 transition-all shadow-lg"
      >
        {view === "shop" ? "MOD" : "EXIT"}
      </button>

      {view === "shop" ? (
        <>
          <Header />
          <Hero />

          <section
            id="catalog"
            className="max-w-[1400px] mx-auto py-16 md:py-32 px-4 md:px-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-10 md:gap-y-16">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-[3/4] bg-neutral-50 overflow-hidden mb-4 md:mb-6 relative group">
                    {product.status === "low_stock" && (
                      <div className="absolute top-0 left-0 right-0 z-20">
                        <div className="bg-black text-white text-center py-1.5 text-[6px] md:text-[7px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-medium">
                          Limited Stock
                        </div>
                      </div>
                    )}
                    {product.status === "sold_out" && (
                      <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="border border-black px-4 py-2 md:px-6 md:py-3 bg-white/90">
                          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold text-black">
                            Archive
                          </span>
                        </div>
                      </div>
                    )}
                    <img
                      src={product.image}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                      alt=""
                    />
                  </div>
                  <div className="flex justify-between items-start group-hover:opacity-70 transition-opacity">
                    <div className="flex flex-col gap-1 md:gap-1.5">
                      <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.25em]">
                        {product.name}
                      </h3>
                      <div className="flex gap-2 md:gap-3 items-center flex-wrap">
                        <p className="text-[11px] md:text-[12px] font-light">
                          $ {product.price}.00
                        </p>
                        {product.oldPrice && (
                          <span className="text-[8px] md:text-[9px] text-red-500/80 line-through">
                            $ {product.oldPrice}.00
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedProduct && (
            <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center md:p-4 bg-black/20 md:bg-transparent">
              <div
                className="absolute inset-0 md:bg-white/95 md:backdrop-blur-md"
                onClick={closeProduct}
              ></div>
              <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-w-[1000px] md:max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-t-2xl md:rounded-none">
                {/* Кнопка закрытия */}
                <button
                  onClick={closeProduct}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-[9px] md:text-[10px] uppercase z-30 bg-white/80 backdrop-blur-sm p-2 md:bg-transparent md:p-0 rounded-full md:rounded-none"
                >
                  Close [x]
                </button>

                {/* ЛЕВАЯ ЧАСТЬ: ГАЛЕРЕЯ */}
                <div className="w-full md:w-3/5 bg-neutral-100 flex flex-col h-[55vh] md:h-auto shrink-0">
                  <div className="flex-1 overflow-hidden">
                    <img
                      src={activeImage || selectedProduct.image}
                      className="w-full h-full object-cover transition-all duration-500"
                      alt=""
                    />
                  </div>
                  {selectedProduct.images &&
                    selectedProduct.images.length > 1 && (
                      <div className="flex gap-2 p-3 md:p-4 overflow-x-auto bg-white border-t scrollbar-hide">
                        {selectedProduct.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`w-14 h-18 md:w-16 md:h-20 flex-shrink-0 cursor-pointer border-2 transition-all ${(activeImage || selectedProduct.image) === img ? "border-black" : "border-transparent"}`}
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ: ИНФО */}
                <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.5em] text-neutral-400 mb-3 md:mb-4 block">
                    {selectedProduct.collection}
                  </span>
                  <h2 className="text-lg md:text-xl uppercase tracking-widest mb-3 md:mb-4">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex gap-3 md:gap-4 items-center mb-6 md:mb-8">
                    <p className="text-base md:text-lg font-light">
                      $ {selectedProduct.price}.00
                    </p>
                    {selectedProduct.oldPrice && (
                      <p className="text-xs md:text-sm text-neutral-400 line-through">
                        $ {selectedProduct.oldPrice}.00
                      </p>
                    )}
                  </div>

                  <div className="mb-8 md:mb-12">
                    <div className="flex justify-between items-end mb-4">
                      <h4 className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                        Select Size
                      </h4>
                      <button
                        onClick={() => setShowSizeGuide(true)}
                        className="text-[8px] uppercase tracking-[0.2em] text-neutral-400 md:text-neutral-300 underline underline-offset-4"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes ? (
                        selectedProduct.sizes.split(",").map((s) => (
                          <div
                            key={s}
                            className="min-w-[44px] h-[44px] md:min-w-[48px] md:h-[48px] border border-neutral-200 md:border-neutral-100 flex items-center justify-center text-[10px] uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white transition-all"
                          >
                            {s.trim()}
                          </div>
                        ))
                      ) : (
                        <div className="h-[44px] md:h-[48px] px-6 border border-black flex items-center justify-center text-[10px] uppercase">
                          One Size
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] md:text-[12px] leading-relaxed text-neutral-600 mb-8 md:mb-10 whitespace-pre-line border-t pt-6">
                    {selectedProduct.details}
                  </p>

                  <a
                    href={selectedProduct.etsyUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`block w-full text-center py-4 md:py-5 uppercase text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] transition-colors mt-auto ${selectedProduct.status === "sold_out" ? "bg-neutral-200 pointer-events-none" : "bg-black text-white hover:bg-neutral-800"}`}
                  >
                    {selectedProduct.status === "sold_out"
                      ? "Out of Stock"
                      : "Purchase via Etsy"}
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <Admin />
      )}
      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </main>
  );
}

const SizeGuide = ({ onClose }) => (
  <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/40 md:bg-white/80 backdrop-blur-sm md:backdrop-blur-md">
    <div className="bg-white border md:border-black p-6 md:p-12 w-full max-w-[500px] relative shadow-xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-[10px] uppercase p-2"
      >
        [ Close ]
      </button>
      <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.5em] mb-6 md:mb-10 border-b pb-4 mt-2">
        Size Guide — CM
      </h3>
      <table className="w-full text-[9px] md:text-[10px] uppercase tracking-widest text-left">
        <thead>
          <tr className="border-b">
            <th className="py-3 md:py-4">Size</th>
            <th className="py-3 md:py-4">Chest</th>
            <th className="py-3 md:py-4">Length</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-3 md:py-4">S</td>
            <td className="py-3 md:py-4">54</td>
            <td className="py-3 md:py-4">68</td>
          </tr>
          <tr className="bg-neutral-50 md:bg-transparent">
            <td className="py-3 md:py-4">M</td>
            <td className="py-3 md:py-4">57</td>
            <td className="py-3 md:py-4">71</td>
          </tr>
          <tr>
            <td className="py-3 md:py-4">L</td>
            <td className="py-3 md:py-4">60</td>
            <td className="py-3 md:py-4">74</td>
          </tr>
          <tr className="bg-neutral-50 md:bg-transparent border-b md:border-none">
            <td className="py-3 md:py-4">XL</td>
            <td className="py-3 md:py-4">63</td>
            <td className="py-3 md:py-4">77</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default App;
