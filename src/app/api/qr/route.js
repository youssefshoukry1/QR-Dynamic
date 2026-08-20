import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "الـ ID غير موجود" }, { status: 400 });
    }

    // رابط جوجل سكريبت بتاعك
    const GOOGLE_SCRIPT_URL = `https://script.google.com/macros/s/AKfycbzEy2mYOYAjm0NlO0hxpRN4p3kPx5tCQMncnjcsbBi2sL_T0zNnWIPm6bJIakYPYfN-/exec?id=${id}`;

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