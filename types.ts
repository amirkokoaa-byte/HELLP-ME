
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  username: string;
  password?: string; // stored for demo purposes
  role: UserRole;
  phone?: string;
}

export interface PaymentMethod {
  type: 'instapay' | 'wallet' | 'cash';
  details?: string;
}

export interface ParkingSpot {
  id: string;
  owner: string;
  address: string;
  region: string;
  locationLink: string;
  paymentMethods: PaymentMethod[];
  whatsapp: string;
  description: string;
  durationHours: number;
  createdAt: number;
  isTaken: boolean;
  requester?: string; // username of person requesting
}

export interface ServiceRequest {
  id: string;
  requester: string;
  serviceName: string;
  suggestedPrice: number;
  finalPrice?: number;
  phone: string;
  deliveryMethod: 'metro';
  metroStation: string;
  locationLink: string;
  paymentMethods: PaymentMethod[];
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed';
  provider?: string; // username of person fulfilling
  providerPhone?: string;
}

export interface AppLink {
  id: string;
  name: string;
  url: string;
  description: string;
  thumbnail: string;
}

export interface Advertisement {
  id: string;
  content: string;
  link: string;
  thumbnail?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
  relatedItemId?: string; // ID of parking spot or service
}

export interface Notification {
  id: string;
  toUser: string;
  message: string;
  read: boolean;
  timestamp: number;
  type: 'parking' | 'service' | 'system' | 'sos';
}

// --- New Features Types ---

export interface CarpoolRide {
  id: string;
  driver: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  price: number;
  phone: string;
  carModel: string;
}

export interface LostItem {
  id: string;
  reporter: string;
  type: 'lost' | 'found'; // lost = I lost it, found = I found it
  itemName: string;
  description: string;
  location: string;
  contact: string;
  date: string;
}

export interface SosAlert {
  id: string;
  requester: string;
  issueType: 'battery' | 'tire' | 'fuel' | 'accident' | 'other';
  location: string;
  phone: string;
  status: 'active' | 'resolved';
  timestamp: number;
}

export const METRO_STATIONS = [
  // Line 1
  "حلوان", "عين حلوان", "جامعة حلوان", "وادي حوف", "حدائق حلوان", "المعصرة", "طرة الأسمنت", "كوتسيكا", "طرة البلد", "ثكنات المعادي", "المعادي", "حدائق المعادي", "دار السلام", "الزهراء", "مار جرجس", "الملك الصالح", "السيدة زينب", "سعد زغلول", "أنور السادات", "جمال عبد الناصر", "أحمد عرابي", "الشهداء", "غمرة", "الدمرداش", "منشية الصدر", "كوبري القبة", "حمامات القبة", "سراي القبة", "حدائق الزيتون", "حلمية الزيتون", "المطرية", "عين شمس", "عزبة النخل", "المرج", "المرج الجديدة",
  // Line 2
  "المنيب", "ساقية مكي", "ضواحي الجيزة", "محطة الجيزة", "فيصل", "جامعة القاهرة", "البحوث", "الدقي", "الأوبرا", "محمد نجيب", "العتبة", "مسرة", "روض الفرج", "سانت تريزا", "الخلفاوي", "المظلات", "كلية الزراعة", "شبرا الخيمة",
  // Line 3
  "عدلي منصور", "الهايكستب", "عمر بن الخطاب", "قباء", "هشام بركات", "النزهة", "نادي الشمس", "ألف مسكن", "هيليوبليس", "هارون", "الأهرام", "كلية البنات", "الاستاد", "أرض المعارض", "العباسية", "عبده باشا", "الجيش", "باب الشعرية", "ناصر", "ماسبيرو", "صفاء حجازي", "الكيت كات"
];
