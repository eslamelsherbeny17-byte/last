import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Notification from '@/lib/models/Notification'

// جلب الإشعارات
export async function GET() {
  try {
    await dbConnect()
    
    // هنجيب أحدث 20 إشعار
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20)
    
    // وهنعد الإشعارات اللي لسه متقرتش عشان نحط الرقم على الأيقونة
    const unreadCount = await Notification.countDocuments({ isRead: false })

    return NextResponse.json({ notifications, unreadCount }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإشعارات' }, { status: 500 })
  }
}

// تحديد كل الإشعارات كمقروءة (لما يفتح القائمة)
export async function PATCH() {
  try {
    await dbConnect()
    await Notification.updateMany({ isRead: false }, { isRead: true })
    
    return NextResponse.json({ message: 'تم تحديث الإشعارات بنجاح' }, { status: 200 })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الإشعارات' }, { status: 500 })
  }
}