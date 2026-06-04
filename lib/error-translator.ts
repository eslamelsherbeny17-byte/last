export const translateError = (msg: string): { title: string; description: string } => {
  const translations: Record<string, { title: string; description: string }> = {
    // أخطاء إنشاء الحساب (Signup) من الموديل الخاص بك
    "name required": { title: "الاسم مطلوب", description: "يرجى إدخال الاسم الكامل لإتمام التسجيل" },
    "email required": { title: "البريد الإلكتروني مطلوب", description: "لا يمكنك ترك حقل البريد الإلكتروني فارغاً" },
    "password required": { title: "كلمة المرور مطلوبة", description: "يرجى تعيين كلمة مرور قوية لحسابك" },
    "Too short password": { title: "كلمة المرور قصيرة", description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" },
    "E-mail already in user": { title: "البريد مستخدم", description: "هذا البريد الإلكتروني مسجل لدينا بالفعل، جرب تسجيل الدخول" },
    "E-mail already exists": { title: "البريد مستخدم", description: "هذا البريد الإلكتروني مسجل لدينا بالفعل" },

    // أخطاء تسجيل الدخول (Login) الشائعة
    "Incorrect email or password": { title: "خطأ في البيانات", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
    "User not found": { title: "المستخدم غير موجود", description: "لا يوجد حساب مسجل بهذا البريد الإلكتروني" },
    "Password mismatch": { title: "عدم تطابق", description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين" },
    
    // أخطاء عامة
    "Network Error": { title: "خطأ في الاتصال", description: "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى" },
  };

  // إذا كانت الرسالة غير موجودة في القاموس، نعرضها كما هي
  return translations[msg] || { title: "حدث خطأ ما", description: msg };
};