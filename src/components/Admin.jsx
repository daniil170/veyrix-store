import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";

const Admin = () => {
  const [tab, setTab] = useState("inventory");
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    oldPrice: "",
    collection: "",
    category: "",
    details: "",
    etsyUrl: "",
    sizes: "",
    status: "available",
  });

  const CLOUD_NAME = "dhzkb1t97";
  const UPLOAD_PRESET = "veyrix_uploads";

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select at least one image!");
    setLoading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        const resp = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: data,
          },
        );
        const imgData = await resp.json();
        uploadedUrls.push(imgData.secure_url);
      }

      await addDoc(collection(db, "products"), {
        ...formData,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        image: uploadedUrls[0],
        images: uploadedUrls,
        createdAt: new Date(),
      });

      alert("Successfully Published!");
      setFormData({
        name: "",
        price: "",
        oldPrice: "",
        collection: "",
        category: "",
        details: "",
        etsyUrl: "",
        sizes: "",
        status: "available",
      });
      setFiles([]);
      setTab("inventory");
    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this piece?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    let nextStatus;
    if (currentStatus === "available") nextStatus = "low_stock";
    else if (currentStatus === "low_stock") nextStatus = "sold_out";
    else nextStatus = "available";

    await updateDoc(doc(db, "products", id), { status: nextStatus });
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-40 px-4 md:px-8 max-w-[1000px] mx-auto font-mono pb-20 md:pb-40 text-black">
      <div className="flex gap-6 md:gap-12 mb-10 md:mb-16 border-b border-black pb-6 overflow-x-auto">
        <button
          onClick={() => setTab("inventory")}
          className={`text-[11px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap ${tab === "inventory" ? "font-bold border-b-2 border-black pb-6 -mb-[26px]" : "text-neutral-400"}`}
        >
          Inventory ({products.length})
        </button>
        <button
          onClick={() => setTab("add")}
          className={`text-[11px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap ${tab === "add" ? "font-bold border-b-2 border-black pb-6 -mb-[26px]" : "text-neutral-400"}`}
        >
          + New Entry
        </button>
      </div>

      {tab === "add" ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400">
              Media Upload (Select Multiple)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="text-[11px] border border-dashed border-neutral-300 p-8 md:p-12 cursor-pointer hover:border-black transition-colors w-full"
            />
            <p className="text-[9px] text-neutral-400 uppercase italic">
              Selected: {files.length} images
            </p>
          </div>

          <input
            placeholder="Product Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-b border-neutral-200 py-4 outline-none uppercase text-[14px] md:text-[16px] focus:border-black w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <input
              placeholder="Price ($) *"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[14px] md:text-[16px] focus:border-black w-full"
            />
            <input
              placeholder="Old Price (Optional)"
              type="number"
              value={formData.oldPrice}
              onChange={(e) =>
                setFormData({ ...formData, oldPrice: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[14px] md:text-[16px] focus:border-black w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[11px] md:text-[12px] uppercase tracking-[0.2em] w-full bg-white"
            >
              <option value="available">Status: Available</option>
              <option value="low_stock">Status: Low Stock</option>
              <option value="sold_out">Status: Sold Out</option>
            </select>
            <input
              placeholder="Sizes (S, M, L, XL)"
              value={formData.sizes}
              onChange={(e) =>
                setFormData({ ...formData, sizes: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none uppercase text-[14px] md:text-[16px] w-full"
            />
          </div>

          <textarea
            placeholder="Product Details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            className="border border-neutral-200 p-4 md:p-6 h-32 md:h-48 outline-none text-[12px] md:text-[14px] w-full"
          />

          <button
            disabled={loading}
            className="bg-black text-white py-6 md:py-8 uppercase text-[11px] md:text-[13px] tracking-[0.3em] md:tracking-[0.5em] disabled:bg-neutral-300 transition-all shadow-xl w-full mt-4"
          >
            {loading
              ? `Uploading ${files.length} images...`
              : "Confirm & Publish"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4 md:gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between border border-neutral-100 p-4 md:p-6 group gap-4 md:gap-0"
            >
              <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                <div className="w-16 h-24 md:w-20 md:h-28 bg-neutral-100 shrink-0">
                  <img
                    src={p.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <h4 className="text-[12px] md:text-[14px] uppercase tracking-widest font-bold truncate">
                    {p.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-[11px] uppercase tracking-tighter font-medium items-center">
                    <span>$ {p.price}</span>
                    {p.oldPrice && (
                      <span className="text-red-400 line-through opacity-70">
                        $ {p.oldPrice}
                      </span>
                    )}
                    <span className="hidden md:inline">•</span>
                    <span
                      className={
                        p.status === "available"
                          ? "text-green-600"
                          : p.status === "low_stock"
                            ? "text-orange-500"
                            : "text-red-500"
                      }
                    >
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-300 tracking-widest mt-1">
                    {p.images?.length || 1} Media Files
                  </p>
                </div>
              </div>
              <div className="flex flex-row md:flex-row gap-2 md:gap-8 w-full md:w-auto">
                <button
                  onClick={() => toggleStatus(p.id, p.status)}
                  className="text-[9px] md:text-[10px] uppercase tracking-widest border border-black px-4 py-3 md:px-6 md:py-2 hover:bg-black hover:text-white transition-all w-full md:w-auto min-w-[120px]"
                >
                  Next Status
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-[9px] md:text-[10px] uppercase tracking-widest text-red-500 border border-red-500 px-4 py-3 md:px-6 md:py-2 hover:bg-red-500 hover:text-white transition-all w-full md:w-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
