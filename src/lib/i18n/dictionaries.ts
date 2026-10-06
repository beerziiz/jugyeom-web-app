export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";

const en = {
  appName: "Jugyeom",
  tagline: "Guild performance and missed-content tracker",
  switchLanguage: "ภาษาไทย",
  overview: {
    title: "Guild overview",
    thisWeek: "This week",
    member: "Member",
    misses: "Misses",
    status: "Status",
    ok: "OK",
    warning: "Warning",
    noWeek: "No week has been recorded yet.",
    noMembers: "No members have been added yet.",
  },
  login: {
    title: "Officer sign-in",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    failed: "Wrong username or password.",
    notOfficer: "This account is not an officer.",
  },
  admin: {
    title: "Officer area",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    members: "Active members",
    next: "Weekly entry and member management come next.",
  },
};

const th: typeof en = {
  appName: "Jugyeom",
  tagline: "ติดตามผลงานกิลด์และคอนเทนต์ที่ขาด",
  switchLanguage: "English",
  overview: {
    title: "ภาพรวมกิลด์",
    thisWeek: "สัปดาห์นี้",
    member: "สมาชิก",
    misses: "ขาด",
    status: "สถานะ",
    ok: "ปกติ",
    warning: "เตือน",
    noWeek: "ยังไม่มีการบันทึกสัปดาห์ใด",
    noMembers: "ยังไม่มีสมาชิกในระบบ",
  },
  login: {
    title: "เข้าสู่ระบบสำหรับเจ้าหน้าที่กิลด์",
    username: "ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    submit: "เข้าสู่ระบบ",
    failed: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    notOfficer: "บัญชีนี้ไม่ใช่เจ้าหน้าที่กิลด์",
  },
  admin: {
    title: "พื้นที่เจ้าหน้าที่",
    signedInAs: "เข้าสู่ระบบเป็น",
    signOut: "ออกจากระบบ",
    members: "สมาชิกปัจจุบัน",
    next: "หน้ากรอกข้อมูลรายสัปดาห์และจัดการสมาชิกจะมาในขั้นต่อไป",
  },
};

export const dictionaries = { en, th };
export type Dictionary = typeof en;
