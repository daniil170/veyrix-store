import React, { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
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
  const [categories, setCategories] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newCat, setNewCat] = useState("");
  const [newColl, setNewColl] = useState("");

  const [filterCat, setFilterCat] = useState("");
  const [filterColl, setFilterColl] = useState("");

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
    const qProducts = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
    );
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    const unsubColls = onSnapshot(collection(db, "collections"), (snapshot) => {
      setCollectionsList(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    return () => {
      unsubProducts();
      unsubCats();
      unsubColls();
    };
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
        createdAt: Timestamp.now(),
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

  const addCategory = async () => {
    if (!newCat) return;
    await addDoc(collection(db, "categories"), { name: newCat });
    setNewCat("");
  };

  const addCollection = async () => {
    if (!newColl) return;
    await addDoc(collection(db, "collections"), { name: newColl });
    setNewColl("");
  };

  const deleteItem = async (colName, id) => {
    if (window.confirm("Delete this item?")) {
      await deleteDoc(doc(db, colName, id));
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this piece?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    let nextStatus =
      currentStatus === "available"
        ? "low_stock"
        : currentStatus === "low_stock"
          ? "sold_out"
          : "available";
    await updateDoc(doc(db, "products", id), { status: nextStatus });
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-40 px-4 md:px-8 max-w-[1000px] mx-auto font-mono pb-20 md:pb-40 text-black">
      <div className="flex gap-6 md:gap-12 mb-10 md:mb-16 border-b border-black pb-6 overflow-x-auto scrollbar-hide">
        {["inventory", "add", "structure"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[11px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap transition-all ${
              tab === t
                ? "font-bold border-b-2 border-black pb-6 -mb-[26px]"
                : "text-neutral-400 hover:text-black"
            }`}
          >
            {t === "inventory"
              ? `Inventory (${products.length})`
              : t === "add"
                ? "+ New Entry"
                : "Structure"}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 md:gap-10 animate-fadeIn"
        >
          <div className="flex flex-col gap-4">
            <label className="text-[10px] uppercase tracking-widest text-neutral-400">
              Media Upload
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="text-[11px] border border-dashed border-neutral-300 p-8 cursor-pointer hover:border-black transition-colors w-full"
            />
          </div>

          <input
            placeholder="Product Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-b border-neutral-200 py-4 outline-none uppercase text-[14px] focus:border-black w-full transition-all"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[11px] uppercase tracking-[0.2em] bg-white focus:border-black"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={formData.collection}
              onChange={(e) =>
                setFormData({ ...formData, collection: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[11px] uppercase tracking-[0.2em] bg-white focus:border-black"
            >
              <option value="">Select Collection</option>
              {collectionsList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[11px] uppercase tracking-[0.2em] bg-white focus:border-black"
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
              className="border-b border-neutral-200 py-4 outline-none uppercase text-[14px] w-full focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input
              placeholder="Price ($) *"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[14px] w-full focus:border-black"
            />
            <input
              placeholder="Old Price (Optional)"
              type="number"
              value={formData.oldPrice}
              onChange={(e) =>
                setFormData({ ...formData, oldPrice: e.target.value })
              }
              className="border-b border-neutral-200 py-4 outline-none text-[14px] w-full focus:border-black"
            />
          </div>

          <input
            placeholder="Etsy URL"
            value={formData.etsyUrl}
            onChange={(e) =>
              setFormData({ ...formData, etsyUrl: e.target.value })
            }
            className="border-b border-neutral-200 py-4 outline-none text-[14px] w-full focus:border-black"
          />

          <textarea
            placeholder="Product Details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            className="border border-neutral-200 p-4 h-32 outline-none text-[12px] w-full focus:border-black"
          />

          <button
            disabled={loading}
            className="bg-black text-white py-6 uppercase text-[11px] tracking-[0.3em] disabled:bg-neutral-300 transition-all w-full shadow-xl hover:bg-neutral-800"
          >
            {loading ? "Uploading Data..." : "Confirm & Publish"}
          </button>
        </form>
      )}

      {tab === "structure" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn">
          {/* CATEGORIES CONTROL */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.4em] mb-8 font-bold border-b border-neutral-100 pb-4">
              Categories
            </h3>
            <div className="flex flex-col gap-4 mb-10">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="New Category Name"
                className="border border-neutral-200 px-4 py-3 outline-none text-[12px] uppercase tracking-widest focus:border-black transition-all"
              />
              <button
                onClick={addCategory}
                className="bg-black text-white py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-lg"
              >
                Add Category
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-neutral-50 px-4 py-3 group min-h-[50px] transition-colors hover:bg-neutral-100"
                >
                  <span className="text-[11px] uppercase tracking-widest break-all mr-4">
                    {c.name}
                  </span>
                  <button
                    onClick={() => deleteItem("categories", c.id)}
                    className="text-red-500 text-[9px] uppercase tracking-tighter opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-700 whitespace-nowrap border border-red-100 md:border-none px-2 py-1 md:p-0 bg-white md:bg-transparent"
                  >
                    [ Remove ]
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COLLECTIONS CONTROL */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.4em] mb-8 font-bold border-b border-neutral-100 pb-4">
              Collections
            </h3>
            <div className="flex flex-col gap-4 mb-10">
              <input
                value={newColl}
                onChange={(e) => setNewColl(e.target.value)}
                placeholder="New Collection Name"
                className="border border-neutral-200 px-4 py-3 outline-none text-[12px] uppercase tracking-widest focus:border-black transition-all"
              />
              <button
                onClick={addCollection}
                className="bg-black text-white py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-lg"
              >
                Add Collection
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {collectionsList.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-neutral-50 px-4 py-3 group min-h-[50px] transition-colors hover:bg-neutral-100"
                >
                  <span className="text-[11px] uppercase tracking-widest break-all mr-4">
                    {c.name}
                  </span>
                  <button
                    onClick={() => deleteItem("collections", c.id)}
                    className="text-red-500 text-[9px] uppercase tracking-tighter opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-700 whitespace-nowrap border border-red-100 md:border-none px-2 py-1 md:p-0 bg-white md:bg-transparent"
                  >
                    [ Remove ]
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "inventory" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-wrap gap-4 mb-4 p-4 bg-neutral-50 border border-neutral-100 items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
              Filter by:
            </span>

            <select
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-[11px] uppercase tracking-wider border-b border-black bg-transparent outline-none py-1"
              value={filterCat}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setFilterColl(e.target.value)}
              className="text-[11px] uppercase tracking-wider border-b border-black bg-transparent outline-none py-1"
              value={filterColl}
            >
              <option value="">All Collections</option>
              {collectionsList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {(filterCat || filterColl) && (
              <button
                onClick={() => {
                  setFilterCat("");
                  setFilterColl("");
                }}
                className="text-[10px] uppercase underline tracking-tighter hover:text-red-500 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>

          {products
            .filter((p) => (filterCat ? p.category === filterCat : true))
            .filter((p) => (filterColl ? p.collection === filterColl : true))
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-col md:flex-row items-center justify-between border border-neutral-200 p-6 md:p-8 group gap-8 bg-white hover:border-black transition-all shadow-sm"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-neutral-100 shrink-0 overflow-hidden shadow-inner">
                    <img
                      src={p.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-[16px] md:text-[18px] uppercase tracking-[0.2em] font-bold leading-tight">
                      {p.name}
                    </h4>

                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] md:text-[12px] text-neutral-500 uppercase tracking-widest bg-neutral-50 w-fit px-2 py-1">
                        {p.category || "No Category"} /{" "}
                        {p.collection || "No Collection"}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-[16px] md:text-[18px] font-mono font-medium">
                          $ {p.price}
                        </span>
                        <span
                          className={`text-[10px] md:text-[11px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border-2 font-bold ${
                            p.status === "available"
                              ? "text-green-600 border-green-500 bg-green-50"
                              : p.status === "low_stock"
                                ? "text-orange-500 border-orange-500 bg-orange-50"
                                : "text-red-500 border-red-500 bg-red-50"
                          }`}
                        >
                          {p.status ? p.status.replace("_", " ") : "available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button
                    onClick={() => toggleStatus(p.id, p.status || "available")}
                    className="flex-1 md:flex-none text-[11px] md:text-[12px] border-2 border-black px-8 py-4 md:py-3 hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] font-bold"
                  >
                    Next Status
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="flex-1 md:flex-none text-[11px] md:text-[12px] text-red-500 border-2 border-red-500 px-8 py-4 md:py-3 hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.2em] font-bold"
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
