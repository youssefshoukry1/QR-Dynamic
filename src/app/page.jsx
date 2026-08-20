"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, RefreshCw, Download, Upload, Link2, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);

  // تحديث الـ QR القديم
  const [extractedId, setExtractedId] = useState("");
  const [currentUrl, setCurrentUrl] = useState(""); // 👈 إضافة state للرابط الحالي
  const [fetchingCurrentUrl, setFetchingCurrentUrl] = useState(false); // 👈 لودنج أثناء جلب الرابط
  const [newUrl, setNewUrl] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEy2mYOYAjm0NlO0hxpRN4p3kPx5tCQMncnjcsbBi2sL_T0zNnWIPm6bJIakYPYfN-/exec";

  // 1. إنشاء QR جديد
  const handleCreateQR = async (e) => {
    e.preventDefault();
    if (!targetUrl) return toast.error("أدخل الرابط أولاً");

    setLoading(true);
    const qrId = "qr_" + Date.now();

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "update", id: qrId, url: targetUrl }),
      });

      // تثبيت دومين Vercel الحقيقي دايماً
      const appDomain = "https://youssef-portfolio-1.vercel.app";
      const redirectApiUrl = `${appDomain}/api/qr?id=${qrId}`;

      const qrDataUrl = await QRCode.toDataURL(redirectApiUrl, { width: 300, margin: 2 });
      setGeneratedQr({ id: qrId, image: qrDataUrl });

      toast.success("تم إنشاء الـ QR وحفظه في الشيت بنجاح!");
      setTargetUrl("");
    } catch (err) {
      toast.error("حدث خطأ أثناء الاتصال بالشيت");
    } finally {
      setLoading(false);
    }
  };

  // 2. قراءة صورة QR وجلب الرابط الحالي من جوجل شيت
  const handleScanImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code) {
          try {
            const urlObj = new URL(code.data);
            const id = urlObj.searchParams.get("id");
            if (id) {
              setExtractedId(id);
              setCurrentUrl("");
              setFetchingCurrentUrl(true);

              // 🚀 جلب الرابط الحالي المربوط بالـ ID من جوجل شيت
              try {
                const res = await fetch(`${GOOGLE_SCRIPT_URL}?id=${id}`);
                const data = await res.json();
                if (data && data.url) {
                  setCurrentUrl(data.url);
                  toast.success("تم قراءة الـ QR وجلب الرابط الحالي!");
                } else {
                  setCurrentUrl("غير مسجل في الشيت");
                }
              } catch (err) {
                toast.error("فشل جلب الرابط الحالي من الشيت");
              } finally {
                setFetchingCurrentUrl(false);
              }

            } else {
              toast.error("هذا الـ QR لا ينتمي لنظامنا Dynamic QR");
            }
          } catch {
            toast.error("الـ QR لا يحتوي على رابط صحيح");
          }
        } else {
          toast.error("تعذر قراءة الـ QR، ارفع صورة أربق وأوضح");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 3. حفظ اللينك الجديد في الشيت
  const handleUpdateQR = async (e) => {
    e.preventDefault();
    if (!newUrl) return toast.error("أدخل اللينك الجديد");

    setUpdateLoading(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "update", id: extractedId, url: newUrl }),
      });

      toast.success("تم تحديث رابط الـ QR في الشيت بنجاح!");
      setCurrentUrl(newUrl); // تحديث الرابط الحالي مع العرض
      setNewUrl("");
    } catch (err) {
      toast.error("فشل التحديث في الشيت");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-950 text-white p-6 md:p-12 dir-rtl font-sans sm:py-24 py-12">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Dynamic QR Code
          </h1>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* قسم الإنشاء */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg">
              <QrCode size={22} />
              <h2>إنشاء QR Code جديد</h2>
            </div>

            <form onSubmit={handleCreateQR} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-2">الرابط الموجه إليه (Destination URL):</label>
                <div className="relative">
                  <Link2 className="absolute right-3 top-3 text-neutral-500" size={18} />
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 pr-10 text-sm focus:border-indigo-500 outline-none dir-ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 text-sm transition"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "إنشاء وحفظ في الشيت"}
              </button>
            </form>

            {generatedQr && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-6 pt-6 border-t border-neutral-800 text-center space-y-4">
                <img src={generatedQr.image} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg bg-white p-2" />
                <a
                  href={generatedQr.image}
                  download={`${generatedQr.id}.png`}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <Download size={16} /> تحميل الـ QR
                </a>
              </motion.div>
            )}
          </motion.div>

          {/* قسم التحديث */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg">
              <RefreshCw size={22} />
              <h2>تحديث QR مطبوع قديم</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-xs text-neutral-400">ارفع صورة الـ QR المطبوع لقرائته:</label>
              <label className="border-2 border-dashed border-neutral-800 hover:border-cyan-500/50 bg-neutral-950 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                <Upload size={24} className="text-neutral-500" />
                <span className="text-xs text-neutral-400">اختر صورة من جهازك</span>
                <input type="file" accept="image/*" onChange={handleScanImage} className="hidden" />
              </label>

              {extractedId && (
                <form onSubmit={handleUpdateQR} className="space-y-4 pt-4 border-t border-neutral-800">
                  {/* صندوق تفاصيل الـ QR المقروء والرابط الحالي */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2 text-xs w-full overflow-hidden">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span className="flex items-center gap-1.5 font-medium min-w-max">
                        <CheckCircle2 size={15} /> المعرف (ID):
                      </span>
                      <span className="font-mono text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 truncate max-w-[140px] sm:max-w-none">
                        {extractedId}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-neutral-900 pt-2 w-full">
                      <span className="text-neutral-400">الرابط الحالي المسجل:</span>
                      {fetchingCurrentUrl ? (
                        <span className="flex items-center gap-2 text-indigo-400 py-1">
                          <Loader2 size={14} className="animate-spin" /> جاري جلب الرابط الحالي من الشيت...
                        </span>
                      ) : (
                        <a
                          href={currentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 font-mono text-left flex items-center gap-1.5 hover:underline bg-cyan-950/30 p-2 rounded border border-cyan-900/40 w-full overflow-hidden"
                        >
                          <ExternalLink size={13} className="shrink-0" />
                          <span className="truncate min-w-0 w-full">{currentUrl || "لا يوجد رابط"}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-2">الرابط الجديد المراد تحويل الـ QR إليه:</label>
                    <input
                      type="url"
                      required
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://wasla-w.vercel.app/"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none dir-ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updateLoading || fetchingCurrentUrl}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-neutral-800 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 text-sm transition"
                  >
                    {updateLoading ? <Loader2 className="animate-spin" size={18} /> : "حفظ الرابط الجديد في الشيت"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}