import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "الـ ID غير موجود" }, { status: 400 });
    }

    // رابط جوجل سكريبت بتاعك
    const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbyz3NFZ69pX1LcxxUV92z0yVeEp4LlC-v2DpamHIrney5N2kxxveH8pZTGrxGmGDLiguQ/exec?id=${id}`;

    try {
        // جلب البيانات من جوجل شيت
        const res = await fetch(GOOGLE_SCRIPT_URL, { cache: 'no-store' });
        const data = await res.json();

        if (data && data.url) {
            // 🚀 تحويل فوري من السيرفر برقم 302 (بيكسر الـ WebView وبيفتح المتصفح دايركت)
            return NextResponse.redirect(data.url, 302);
        }

        return NextResponse.json({ error: "الرابط غير مسجل" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
    }
}