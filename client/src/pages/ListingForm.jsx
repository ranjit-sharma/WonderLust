import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus } from "lucide-react";
import { api, getMeta } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { imageUrl } from "../lib/format.js";
import { ErrorState, PageHeader, PageLoader, Spinner, ease } from "../components/ui.jsx";
import SearchableSelect from "../components/SearchableSelect.jsx";
import { categoryIcons } from "../lib/categories.js";

const empty = { title: "", description: "", category: "", price: "", country: "", state: "", location: "" };

function ImagePicker({ file, currentUrl, onChange, required }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || currentUrl;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith("image/")) {
          onChange(dropped);
        }
      }}
      className={`group relative flex aspect-[16/9] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed text-center transition ${
        dragging ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-300"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        required={required && !file}
        onClick={(e) => {
          e.target.value = null;
        }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
          }
        }}
        className="absolute inset-0 z-20 size-full cursor-pointer opacity-0"
        aria-label="Listing image"
      />
      <AnimatePresence mode="wait">
        {shown ? (
          <motion.img
            key={shown}
            src={shown}
            alt="Listing preview"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none px-6">
            <ImagePlus className="mx-auto size-10 text-neutral-400 transition group-hover:scale-110" />
            <p className="mt-3 font-semibold">Drag a photo here or click to upload</p>
            <p className="text-sm text-neutral-500">PNG, JPG, WEBP, AVIF</p>
          </motion.div>
        )}
      </AnimatePresence>
      {shown && (
        <span className="pointer-events-none absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-md transition group-hover:scale-105 dark:bg-neutral-900/90 dark:text-neutral-100">
          <ImagePlus className="size-4 text-brand-500" />
          {file ? "Replace selected photo" : "Change photo"}
        </span>
      )}
      {file && (
        <span className="pointer-events-none absolute top-4 left-4 z-10 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-md">
          New photo ready to save
        </span>
      )}
    </div>
  );
}

export default function ListingForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [meta, setMeta] = useState(null);
  const [values, setValues] = useState(empty);
  const [currentImage, setCurrentImage] = useState("");
  const [file, setFile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMeta().then(setMeta).catch(setLoadError);
  }, []);

  useEffect(() => {
    if (!editing) return;
    api(`/listings/${id}`)
      .then(({ listing }) => {
        if (listing.owner?._id !== user._id) {
          toast("You are not the owner of this listing", "error");
          return navigate(`/listings/${id}`, { replace: true });
        }
        setValues(Object.fromEntries(Object.keys(empty).map((k) => [k, listing[k] ?? ""])));
        setCurrentImage(imageUrl(listing.image?.url, 1200) || "");
      })
      .catch(setLoadError);
  }, [editing, id, user._id, navigate, toast]);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = new FormData();
    Object.entries(values).forEach(([k, v]) => body.append(`listing[${k}]`, v));
    if (file) body.append("listing[image]", file);

    setSubmitting(true);
    try {
      const saved = await api(editing ? `/listings/${id}` : "/listings", { method: editing ? "PUT" : "POST", body });
      toast(editing ? "Listing Updated!" : "New listing created!");
      navigate(`/listings/${saved._id}`);
    } catch (err) {
      toast(err.message, "error");
      setSubmitting(false);
    }
  };

  if (loadError) return <div className="container-page py-16"><ErrorState error={loadError} /></div>;
  if (!meta || (editing && !values.title)) return <PageLoader />;

  return (
    <div className="container-page max-w-3xl py-6 sm:py-10">
      <PageHeader
        eyebrow={editing ? "Edit listing" : "Become a host"}
        title={editing ? "Update your place" : "Share your place with the world"}
        text={editing ? "Make changes and save. A new photo replaces the current one." : "A few details and a great photo are all it takes to start hosting."}
      />

      <motion.form
        onSubmit={submit}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6"
      >
        {[
          <ImagePicker key="img" file={file} currentUrl={currentImage} onChange={setFile} required={!editing} />,
          <div key="title">
            <label htmlFor="title" className="label">Title</label>
            <input id="title" required className="field" placeholder="Add a catchy title" value={values.title} onChange={set("title")} />
          </div>,
          <div key="desc">
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" required rows={5} className="field resize-y" placeholder="Describe your place" value={values.description} onChange={set("description")} />
          </div>,
          <div key="row1" className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <SearchableSelect
                id="category"
                required
                value={values.category}
                onChange={(val) => setValues((v) => ({ ...v, category: val }))}
                options={meta.categories}
                getIcon={(cat) => categoryIcons[cat]}
                placeholder="Select a category"
              />
            </div>
            <div>
              <label htmlFor="price" className="label">Price per night (₹)</label>
              <input id="price" type="number" required min={1} className="field" placeholder="1200" value={values.price} onChange={set("price")} />
            </div>
          </div>,
          <div key="row2" className="grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="country" className="label">Country</label>
              <input
                id="country"
                required
                className="field"
                placeholder="Enter country"
                value={values.country}
                onChange={set("country")}
              />
            </div>
            <div>
              <label htmlFor="state" className="label">State / Region</label>
              <input id="state" list="states" className="field" placeholder="Optional" value={values.state} onChange={set("state")} />
              <datalist id="states">{meta.states.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label htmlFor="location" className="label">City</label>
              <input id="location" list="cities" required className="field" placeholder="Enter city" value={values.location} onChange={set("location")} />
              <datalist id="cities">{meta.cities.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>,
          <div key="actions" className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end dark:border-neutral-800">
            <Link to={editing ? `/listings/${id}` : "/listings"} className="btn-ghost w-full sm:w-auto">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto px-8">
              {submitting && <Spinner className="size-4" />}
              {editing ? "Save changes" : "Publish listing"}
            </button>
          </div>,
        ].map((child) => (
          <motion.div key={child.key} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease, duration: 0.45 } } }}>
            {child}
          </motion.div>
        ))}
      </motion.form>
    </div>
  );
}
