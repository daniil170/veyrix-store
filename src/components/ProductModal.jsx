import React from 'react';

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[1000px] h-full bg-white shadow-2xl overflow-y-auto flex flex-col md:flex-row animate-slide-left">
        
        {/* CLOSE BUTTON (Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white rounded-full md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* LEFT: Photo Gallery */}
        <div className="w-full md:w-3/5 bg-neutral-50 p-4 md:p-10 space-y-4">
          {/* Здесь будут рендериться фото из массива product.images */}
          <div className="aspect-[3/4] bg-neutral-200"></div>
          <div className="aspect-[3/4] bg-neutral-100"></div>
        </div>

        {/* RIGHT: Product Info (Fixed position on desktop) */}
        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col h-full">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-2">{product.collection}</p>
              <h2 className="text-2xl font-light uppercase tracking-tight text-black">{product.name}</h2>
              <p className="text-[11px] text-neutral-500 mt-1 uppercase">{product.category}</p>
            </div>
            <button onClick={onClose} className="hidden md:block opacity-30 hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="text-xl font-light mb-12">$ {product.price}.00</div>

          {/* SIZES */}
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-widest mb-4">Select Size</p>
            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL'].map(size => (
                <button key={size} className="w-12 h-12 border border-neutral-200 text-[11px] flex items-center justify-center hover:border-black transition-colors uppercase font-mono">
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-widest mb-4">Details</p>
            <p className="text-[12px] leading-relaxed text-neutral-600 font-light">
              High-quality essential piece designed in Veyrix Studio. Handcrafted details with premium materials for maximum comfort and durability.
            </p>
          </div>

          {/* ETSY BUTTON */}
          <div className="mt-auto pt-10">
            <a 
              href={product.etsyUrl} 
              target="_blank" 
              className="block w-full bg-black text-white text-center py-5 text-[11px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors"
            >
              Purchase via Etsy
            </a>
            <p className="text-center text-[9px] text-neutral-400 mt-4 uppercase tracking-widest">Secure checkout worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;