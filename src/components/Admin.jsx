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
  setDoc,
} from "firebase/firestore";

const Admin = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [heroVideo, setHeroVideo] = useState(""); // НОВОЕ: ссылка на видео
  const [videoFile, setVideoFile] = useState(null); // НОВОЕ: файл видео
  const [tab, setTab] = useState("inventory");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
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
    const unsubSettings = onSnapshot(
      doc(db, "settings", "siteConfig"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsMaintenance(docSnap.data().isMaintenance);
          setHeroVideo(docSnap.data().heroVideo || ""); // Загружаем видео из базы
        }
      },
    );
    return () => unsubSettings();
  }, []);

  const toggleMaintenance = async () => {
    try {
      const configRef = doc(db, "settings", "siteConfig");
      await setDoc(
        configRef,
        { isMaintenance: !isMaintenance },
        { merge: true },
      );
    } catch (e) {
      alert(e.message);
    }
  };

  // НОВАЯ ФУНКЦИЯ: Загрузка видео
  const handleVideoUpload = async () => {
    if (!videoFile) return alert("Please select a video file!");
    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", videoFile);
      data.append("upload_preset", UPLOAD_PRESET);

      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        { method: "POST", body: data },
      );
      const videoData = await resp.json();

      await updateDoc(doc(db, "settings", "siteConfig"), {
        heroVideo: videoData.secure_url,
      });

      alert("Hero video updated!");
      setVideoFile(null);
    } catch (e) {
      alert("Video Error: " + e.message);
    }
    setLoading(false);
  };

  // НОВАЯ ФУНКЦИЯ: Удаление видео
  const deleteVideo = async () => {
    if (window.confirm("Remove hero video?")) {
      await updateDoc(doc(db, "settings", "siteConfig"), { heroVideo: "" });
    }
  };

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

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice || "",
      collection: p.collection || "",
      category: p.category || "",
      details: p.details || "",
      etsyUrl: p.etsyUrl || "",
      sizes: p.sizes || "",
      status: p.status || "available",
    });
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImages = editingId
        ? products.find((p) => p.id === editingId).images
        : [];
      let finalMainImage = editingId
        ? products.find((p) => p.id === editingId).image
        : "";

      if (files.length > 0) {
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
        finalImages = uploadedUrls;
        finalMainImage = uploadedUrls[0];
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        image: finalMainImage,
        images: finalImages,
        updatedAt: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        if (files.length === 0) throw new Error("Please select images!");
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: Timestamp.now(),
        });
      }
      cancelEdit();
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

  const renameItem = async (colName, id, oldName) => {
    const newName = prompt(`Rename "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, colName, id), { name: newName });
      const linkedProducts = products.filter((p) =>
        colName === "categories"
          ? p.category === oldName
          : p.collection === oldName,
      );
      for (const p of linkedProducts) {
        const field =
          colName === "categories"
            ? { category: newName }
            : { collection: newName };
        await updateDoc(doc(db, "products", p.id), field);
      }
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  const deleteItem = async (colName, id) => {
    let itemName =
      colName === "categories"
        ? categories.find((c) => c.id === id)?.name
        : collectionsList.find((c) => c.id === id)?.name;
    const hasLinkedProducts = products.some((p) =>
      colName === "categories"
        ? p.category === itemName
        : p.collection === itemName,
    );
    if (hasLinkedProducts)
      return alert(
        `CANNOT DELETE: This ${colName} is still linked to products.`,
      );
    if (window.confirm(`Remove this ${colName}?`))
      await deleteDoc(doc(db, colName, id));
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure?"))
      await deleteDoc(doc(db, "products", id));
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
    <div className="min-h-screen bg-white pt-24 md:pt-40 px-4 md:px-8 max-w-[1000px] mx-auto font-mono pb-20 text-black">
      {/* TABS */}
      <div className="flex gap-6 md:gap-12 mb-10 border-b border-black pb-6 overflow-x-auto scrollbar-hide">
        {["inventory", "add", "structure"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t !== "add") setEditingId(null);
            }}
            className={`text-[11px] uppercase tracking-[0.4em] transition-all ${tab === t ? "font-bold border-b-2 border-black pb-6 -mb-[26px]" : "text-neutral-400 hover:text-black"}`}
          >
            {t === "inventory"
              ? `Inventory (${products.length})`
              : t === "add"
                ? editingId
                  ? "Edit Mode"
                  : "+ New Entry"
                : "Structure"}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 animate-fadeIn"
        >
          {editingId && (
            <div className="bg-neutral-50 p-4 border-l-4 border-black text-[10px] uppercase tracking-widest flex justify-between items-center">
              <span>Editing: {formData.name}</span>
              <button type="button" onClick={cancelEdit} className="underline">
                Cancel Edit
              </button>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] uppercase text-neutral-400">
              Media {editingId && "(Select only if changing)"}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="text-[11px] border border-dashed border-neutral-300 p-8 w-full"
            />
          </div>
          <input
            placeholder="Product Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border-b border-neutral-200 py-4 outline-none uppercase text-[14px] focus:border-black"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select
              value={formData.category}
              required
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="border-b border-neutral-200 py-4 text-[11px] uppercase bg-white"
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
              required
              onChange={(e) =>
                setFormData({ ...formData, collection: e.target.value })
              }
              className="border-b border-neutral-200 py-4 text-[11px] uppercase bg-white"
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
              className="border-b border-neutral-200 py-4 text-[11px] uppercase bg-white"
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
              className="border-b border-neutral-200 py-4 uppercase text-[14px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input
              placeholder="Price ($) *"
              required
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="border-b border-neutral-200 py-4 text-[14px]"
            />
            <input
              placeholder="Old Price (Optional)"
              type="number"
              value={formData.oldPrice}
              onChange={(e) =>
                setFormData({ ...formData, oldPrice: e.target.value })
              }
              className="border-b border-neutral-200 py-4 text-[14px]"
            />
          </div>
          <input
            placeholder="Etsy URL"
            value={formData.etsyUrl}
            onChange={(e) =>
              setFormData({ ...formData, etsyUrl: e.target.value })
            }
            className="border-b border-neutral-200 py-4 text-[14px]"
          />
          <textarea
            placeholder="Product Details"
            value={formData.details}
            onChange={(e) =>
              setFormData({ ...formData, details: e.target.value })
            }
            className="border border-neutral-200 p-4 h-32 outline-none text-[12px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white py-4 uppercase tracking-widest text-[12px] hover:bg-neutral-800 transition-colors"
          >
            {loading
              ? "Processing..."
              : editingId
                ? "Save Changes"
                : "Confirm & Publish"}
          </button>
        </form>
      )}

      {tab === "structure" && (
        <div className="flex flex-col gap-12 animate-fadeIn">
          {/* НОВЫЙ БЛОК: УПРАВЛЕНИЕ ВИДЕО */}
          <div className="p-6 border-2 border-neutral-100 bg-neutral-50">
            <h3 className="text-[11px] uppercase tracking-[0.4em] mb-4 font-bold">
              Hero Video Control
            </h3>
            {heroVideo ? (
              <div className="space-y-4">
                <video
                  src={heroVideo}
                  className="w-full max-h-40 object-cover"
                  muted
                />
                <button
                  onClick={deleteVideo}
                  className="text-[10px] text-red-500 uppercase font-bold"
                >
                  [ Remove Video ]
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="text-[11px] border border-dashed border-neutral-300 p-4 w-full"
                />
                <button
                  onClick={handleVideoUpload}
                  disabled={loading || !videoFile}
                  className="bg-black text-white py-3 text-[10px] uppercase"
                >
                  {loading ? "Uploading..." : "Upload New Video"}
                </button>
              </div>
            )}
          </div>

          <div
            className={`p-6 border-2 transition-colors duration-500 ${isMaintenance ? "border-orange-500 bg-orange-50" : "border-neutral-100 bg-neutral-50"}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3
                  className={`text-[11px] uppercase tracking-[0.4em] mb-2 font-bold ${isMaintenance ? "text-orange-600" : "text-black"}`}
                >
                  System Control
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                  {isMaintenance
                    ? "Store is currently hidden."
                    : "Store is live."}
                </p>
              </div>
              <button
                onClick={toggleMaintenance}
                disabled={loading}
                className={`px-10 py-4 text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${isMaintenance ? "bg-orange-500 text-white" : "bg-black text-white"}`}
              >
                {isMaintenance ? "Disable Maintenance" : "Enable Maintenance"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {["categories", "collections"].map((col) => (
              <div key={col}>
                <h3 className="text-[11px] uppercase tracking-[0.4em] mb-8 font-bold border-b pb-4">
                  {col}
                </h3>
                <div className="flex flex-col gap-4 mb-10">
                  <input
                    value={col === "categories" ? newCat : newColl}
                    onChange={(e) =>
                      col === "categories"
                        ? setNewCat(e.target.value)
                        : setNewColl(e.target.value)
                    }
                    placeholder={`New ${col.slice(0, -1)}`}
                    className="border border-neutral-200 px-4 py-3 text-[12px] uppercase outline-none"
                  />
                  <button
                    onClick={col === "categories" ? addCategory : addCollection}
                    className="bg-black text-white py-3 text-[10px] uppercase"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {(col === "categories" ? categories : collectionsList).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-neutral-50 px-4 py-3"
                      >
                        <span className="text-[11px] uppercase tracking-widest">
                          {item.name}
                        </span>
                        <div className="flex gap-4">
                          <button
                            onClick={() => renameItem(col, item.id, item.name)}
                            className="text-[9px] uppercase text-blue-500"
                          >
                            [ Rename ]
                          </button>
                          <button
                            onClick={() => deleteItem(col, item.id)}
                            className="text-[9px] uppercase text-red-500"
                          >
                            [ Remove ]
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "inventory" && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-wrap gap-4 mb-4 p-4 bg-neutral-50 border border-neutral-100 items-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400">
              Filter:
            </span>
            <select
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-[11px] uppercase border-b border-black bg-transparent py-1"
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
              className="text-[11px] uppercase border-b border-black bg-transparent py-1"
              value={filterColl}
            >
              <option value="">All Collections</option>
              {collectionsList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {products
            .filter((p) => (filterCat ? p.category === filterCat : true))
            .filter((p) => (filterColl ? p.collection === filterColl : true))
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-col md:flex-row items-center justify-between border border-neutral-200 p-6 group gap-8 hover:border-black transition-all"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <div className="w-24 h-32 bg-neutral-100 shrink-0 overflow-hidden">
                    <img
                      src={p.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[16px] uppercase font-bold tracking-widest">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                      {p.category} / {p.collection}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[16px] font-mono">$ {p.price}</span>
                      <span
                        className={`text-[10px] uppercase px-3 py-1 border font-bold ${p.status === "available" ? "text-green-600 border-green-500" : p.status === "low_stock" ? "text-orange-500 border-orange-500" : "text-red-500 border-red-500"}`}
                      >
                        {p.status?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => startEdit(p)}
                    className="text-[10px] border border-black px-6 py-3 uppercase font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(p.id, p.status || "available")}
                    className="text-[10px] border border-black px-6 py-3 uppercase font-bold"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-[10px] border border-red-500 text-red-500 px-6 py-3 uppercase font-bold"
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
