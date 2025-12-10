
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, UserRole, ParkingSpot, ServiceRequest, AppLink, Advertisement, Notification, 
  METRO_STATIONS, ChatMessage, PaymentMethod, CarpoolRide, LostItem, SosAlert
} from './types';
import { ICONS } from './constants';

// --- Helper Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <ICONS.X />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const Header = ({ 
  appName, 
  user, 
  onLogout, 
  onOpenAdmin, 
  onOpenApps,
  onOpenNotifications,
  notifications 
}: { 
  appName: string; 
  user: User | null; 
  onLogout: () => void; 
  onOpenAdmin: () => void; 
  onOpenApps: () => void;
  onOpenNotifications: () => void;
  notifications: Notification[];
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
          <div className="text-xs text-blue-100 flex gap-2">
            <span>{formatDate(time)}</span>
            <span>{formatTime(time)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {user && (
            <>
              <button 
                onClick={onOpenApps}
                className="p-2 bg-blue-700 rounded-full hover:bg-blue-800 transition relative"
                title="برامج أخرى"
              >
                <div className="w-5 h-5 flex items-center justify-center font-bold">؟</div>
              </button>

              <div className="relative">
                 <button onClick={onOpenNotifications} className="p-2 hover:bg-blue-700 rounded-full">
                    <ICONS.Bell />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                 </button>
              </div>

              {user.role === UserRole.ADMIN && (
                <button onClick={onOpenAdmin} className="p-2 hover:bg-blue-700 rounded-full" title="الإعدادات">
                  <ICONS.Settings />
                </button>
              )}
              
              <button onClick={onLogout} className="p-2 hover:bg-red-600 rounded-full" title="تسجيل خروج">
                <ICONS.LogOut />
              </button>
            </>
           )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white py-4 mt-auto">
    <div className="container mx-auto text-center">
      <p className="text-sm">المطور: <span className="font-bold text-blue-400">Amir Lamay</span></p>
      <p className="text-xs text-gray-400 mt-1">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [appName, setAppName] = useState("Help Me");
  const [activeTab, setActiveTab] = useState<'parking' | 'busy' | 'carpool' | 'lostfound' | 'sos'>('parking');
  
  // Data State
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [carpoolRides, setCarpoolRides] = useState<CarpoolRide[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  
  const [appLinks, setAppLinks] = useState<AppLink[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Custom HTML section state (Simulated Dev Mode)
  const [customHtml, setCustomHtml] = useState<string>("");

  // UI State
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // Modals for Adding
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [showAddCarpool, setShowAddCarpool] = useState(false);
  const [showAddLostItem, setShowAddLostItem] = useState(false);
  const [showAddSos, setShowAddSos] = useState(false);

  // Detail/Interaction Modals
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showChat, setShowChat] = useState<{isOpen: boolean, targetUser: string, itemId: string}>({ isOpen: false, targetUser: '', itemId: '' });

  // Persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('helpMe_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const loadData = (key: string, setter: Function) => {
       const data = localStorage.getItem(key);
       if(data) setter(JSON.parse(data));
    };

    loadData('helpMe_spots', setParkingSpots);
    loadData('helpMe_requests', setRequests);
    loadData('helpMe_carpool', setCarpoolRides);
    loadData('helpMe_lostfound', setLostItems);
    loadData('helpMe_sos', setSosAlerts);
    loadData('helpMe_ads', setAds);
    loadData('helpMe_links', setAppLinks);

    // Initial dummy links if empty
    if (!localStorage.getItem('helpMe_links')) {
      const dummyLinks: AppLink[] = Array.from({length: 4}).map((_, i) => ({
        id: `link-${i}`,
        name: `تطبيق مقترح ${i+1}`,
        description: "وصف مختصر للتطبيق",
        url: "https://google.com",
        thumbnail: `https://picsum.photos/100/100?random=${i}`
      }));
      setAppLinks(dummyLinks);
    }
    
    const storedName = localStorage.getItem('helpMe_appName');
    if (storedName) setAppName(storedName);

    const storedHtml = localStorage.getItem('helpMe_customHtml');
    if (storedHtml) setCustomHtml(storedHtml);
    
    // Deep Linking Handling
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const id = params.get('id');
      
      if (type && id) {
        if (type === 'parking') {
           const spots = JSON.parse(localStorage.getItem('helpMe_spots') || '[]');
           const spot = spots.find((s:any) => s.id === id);
           if (spot) { setActiveTab('parking'); setSelectedSpot(spot); }
        } else if (type === 'busy') {
           const reqs = JSON.parse(localStorage.getItem('helpMe_requests') || '[]');
           const req = reqs.find((r:any) => r.id === id);
           if (req) { setActiveTab('busy'); setSelectedRequest(req); }
        } else if (['carpool', 'lostfound', 'sos'].includes(type)) {
           setActiveTab(type as any);
        }
      }
    }, 500);

  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('helpMe_user', JSON.stringify(user));
    localStorage.setItem('helpMe_spots', JSON.stringify(parkingSpots));
    localStorage.setItem('helpMe_requests', JSON.stringify(requests));
    localStorage.setItem('helpMe_carpool', JSON.stringify(carpoolRides));
    localStorage.setItem('helpMe_lostfound', JSON.stringify(lostItems));
    localStorage.setItem('helpMe_sos', JSON.stringify(sosAlerts));
    localStorage.setItem('helpMe_ads', JSON.stringify(ads));
    localStorage.setItem('helpMe_links', JSON.stringify(appLinks));
    localStorage.setItem('helpMe_appName', appName);
    localStorage.setItem('helpMe_customHtml', customHtml);
  }, [user, parkingSpots, requests, carpoolRides, lostItems, sosAlerts, ads, appLinks, appName, customHtml]);

  // Handlers
  const handleLogin = (u: User) => {
    setUser(u);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(true);
    localStorage.removeItem('helpMe_user');
  };

  const handleShare = (type: string, id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?type=${type}&id=${id}`;
    navigator.clipboard.writeText(url);
    alert('تم نسخ رابط المشاركة بنجاح! يمكنك استخدامه في الإعلانات.');
  };

  const addNotification = (toUser: string, msg: string, type: 'parking'|'service'|'system'|'sos') => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      toUser,
      message: msg,
      read: false,
      timestamp: Date.now(),
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsRead = () => {
    const updated = notifications.map(n => ({...n, read: true}));
    setNotifications(updated);
  };

  const handleAddSpot = (data: any) => {
    const newSpot: ParkingSpot = {
      id: Date.now().toString(),
      owner: user!.username,
      createdAt: Date.now(),
      isTaken: false,
      ...data
    };
    setParkingSpots([newSpot, ...parkingSpots]);
    setShowAddSpot(false);
  };

  const handleRequestSpot = (spot: ParkingSpot) => {
    addNotification(spot.owner, `يوجد طلب جديد للركنة الخاصة بك في ${spot.region} من ${user!.username}`, 'parking');
    const updatedSpots = parkingSpots.map(s => s.id === spot.id ? {...s, requester: user!.username} : s);
    setParkingSpots(updatedSpots);
    alert('تم إرسال طلب الركنة للمالك');
  };

  const handleAddServiceRequest = (data: any) => {
    const newReq: ServiceRequest = {
      id: Date.now().toString(),
      requester: user!.username,
      status: 'pending',
      ...data
    };
    setRequests([newReq, ...requests]);
    setShowAddRequest(false);
  };

  const handleOfferService = (req: ServiceRequest, offerPrice: number, providerPhone: string) => {
    const updatedReqs = requests.map(r => {
      if (r.id === req.id) {
        return { 
          ...r, 
          status: 'negotiating' as const, 
          finalPrice: offerPrice, 
          provider: user!.username,
          providerPhone: providerPhone
        };
      }
      return r;
    });
    setRequests(updatedReqs);
    addNotification(req.requester, `قام ${user!.username} بتقديم عرض لتنفيذ خدمة "${req.serviceName}" بسعر ${offerPrice}`, 'service');
    setSelectedRequest(null);
  };

  const handleAcceptOffer = (req: ServiceRequest, accepted: boolean) => {
    const updatedReqs = requests.map(r => 
      r.id === req.id ? { ...r, status: accepted ? 'accepted' as const : 'rejected' as const } : r
    );
    setRequests(updatedReqs);
    if (req.provider) {
       addNotification(req.provider, `قام ${user!.username} ${accepted ? 'بالموافقة على' : 'برفض'} عرضك لخدمة ${req.serviceName}`, 'service');
    }
    setSelectedRequest(null);
  };

  // New Features Handlers
  const handleAddCarpool = (data: any) => {
    const newRide: CarpoolRide = { id: Date.now().toString(), driver: user!.username, ...data };
    setCarpoolRides([newRide, ...carpoolRides]);
    setShowAddCarpool(false);
  };

  const handleAddLostItem = (data: any) => {
    const newItem: LostItem = { id: Date.now().toString(), reporter: user!.username, ...data };
    setLostItems([newItem, ...lostItems]);
    setShowAddLostItem(false);
  };

  const handleAddSos = (data: any) => {
    const newSos: SosAlert = { 
      id: Date.now().toString(), 
      requester: user!.username, 
      status: 'active',
      timestamp: Date.now(),
      ...data 
    };
    setSosAlerts([newSos, ...sosAlerts]);
    setShowAddSos(false);
    // Broadcast notification (simulated)
    addNotification('admin', `إشعار طوارئ جديد: ${data.issueType} من ${user!.username}`, 'sos');
  };

  const handleResolveSos = (id: string) => {
    setSosAlerts(sosAlerts.map(s => s.id === id ? {...s, status: 'resolved'} : s));
  };

  const openChat = (targetUser: string, itemId: string) => {
    setShowChat({ isOpen: true, targetUser, itemId });
  };

  const sendChatMessage = (content: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: user!.username,
      receiver: showChat.targetUser,
      content,
      timestamp: Date.now(),
      relatedItemId: showChat.itemId
    };
    setChatMessages([...chatMessages, msg]);
  };

  // --- Screens ---

  if (showLogin) {
    return <AuthScreen onLogin={handleLogin} onRegister={() => {setShowLogin(false); setShowRegister(true);}} />;
  }
  
  if (showRegister) {
    return <RegisterScreen onBack={() => {setShowRegister(false); setShowLogin(true);}} onRegisterSuccess={() => {setShowRegister(false); setShowLogin(true);}} />;
  }

  return (
    <>
      <Header 
        appName={appName} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAdmin={() => setShowAdmin(true)} 
        onOpenApps={() => setShowAppsModal(true)}
        onOpenNotifications={() => { markNotificationsRead(); setShowNotificationsModal(true); }}
        notifications={notifications.filter(n => n.toUser === user?.username)}
      />

      {/* Marquee Ads */}
      {ads.length > 0 && (
        <div className="bg-yellow-100 border-b border-yellow-200 overflow-hidden py-2 relative">
           <div className="animate-marquee whitespace-nowrap flex gap-8 px-4">
             {ads.map(ad => (
               <a key={ad.id} href={ad.link} className="inline-flex items-center gap-2 text-yellow-900 font-semibold hover:underline mx-4">
                 {ad.thumbnail && <img src={ad.thumbnail} alt="" className="w-8 h-8 rounded object-cover"/>}
                 <span>{ad.content}</span>
               </a>
             ))}
           </div>
        </div>
      )}

      {/* Other Apps Bar (Horizontal Scroll) */}
      <div className="bg-white shadow-sm p-2 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-4">
          {appLinks.map(app => (
            <a key={app.id} href={app.url} target="_blank" rel="noreferrer" className="flex flex-col items-center min-w-[60px] group">
              <img src={app.thumbnail} alt={app.name} className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-blue-500 transition object-cover" />
              <span className="text-[10px] mt-1 text-gray-600 truncate max-w-full">{app.name}</span>
            </a>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 flex-grow mb-16">
        
        {/* Navigation Tabs (Scrollable) */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2 space-x-reverse min-w-max">
            {[
              { id: 'parking', label: 'ابحث عن ركنة', icon: <ICONS.Car />, color: 'blue' },
              { id: 'busy', label: 'مشغول (خدمات)', icon: <ICONS.Briefcase />, color: 'purple' },
              { id: 'carpool', label: 'مشاركة طريق', icon: <ICONS.Users />, color: 'green' },
              { id: 'lostfound', label: 'مفقودات', icon: <ICONS.Search />, color: 'orange' },
              { id: 'sos', label: 'نجدة طريق', icon: <ICONS.AlertTriangle />, color: 'red' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full font-bold transition flex items-center gap-2 border ${
                  activeTab === tab.id 
                  ? `bg-${tab.color}-600 text-white border-${tab.color}-600` 
                  : `bg-white text-gray-600 hover:bg-gray-50 border-gray-200`
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Sections Added by Admin (Custom HTML) */}
        {customHtml && (
           <div className="mb-8 p-4 bg-white rounded shadow" dangerouslySetInnerHTML={{__html: customHtml}} />
        )}

        {/* --- Content Area --- */}

        {/* Parking Tab */}
        {activeTab === 'parking' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-800">ركنات السيارات</h2>
              <button onClick={() => setShowAddSpot(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ICONS.Plus /> أضف ركنة
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parkingSpots.map(spot => (
                <div key={spot.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 relative">
                  <div className="flex justify-between items-start">
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{spot.region}</span>
                    <button onClick={() => handleShare('parking', spot.id)} className="text-gray-400 hover:text-blue-600" title="مشاركة">
                        <ICONS.Share />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg mb-1 mt-2">{spot.address}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{spot.description}</p>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{spot.durationHours} ساعة</span>
                    <button onClick={() => setSelectedSpot(spot)} className="text-blue-600 hover:underline text-sm font-semibold">التفاصيل</button>
                  </div>
                  {spot.isTaken && <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center font-bold text-red-600 border-2 border-red-500 rounded-lg m-1">محجوزة</div>}
                </div>
              ))}
              {parkingSpots.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">لا توجد ركنات متاحة حالياً</div>}
            </div>
          </div>
        )}

        {/* Busy/Services Tab */}
        {activeTab === 'busy' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h2 className="text-xl font-bold text-purple-800">خدمات وتوصيل</h2>
              <button onClick={() => setShowAddRequest(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ICONS.Plus /> اطلب خدمة
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {requests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-lg shadow border-r-4 border-purple-500 flex justify-between items-center relative">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                         <h3 className="font-bold text-lg">{req.serviceName}</h3>
                         <button onClick={() => handleShare('busy', req.id)} className="text-gray-400 hover:text-purple-600 ml-2" title="مشاركة">
                            <ICONS.Share />
                         </button>
                    </div>
                    <p className="text-sm text-gray-500">طريقة التوصيل: {req.deliveryMethod === 'metro' ? `مترو - ${req.metroStation}` : 'أخرى'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold">{req.finalPrice ? `${req.finalPrice} ج.م` : `${req.suggestedPrice} ج.م (مقترح)`}</span>
                      <span className={`text-xs px-2 py-1 rounded text-white ${req.status === 'pending' ? 'bg-yellow-500' : req.status === 'negotiating' ? 'bg-orange-500' : req.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'negotiating' ? 'يوجد عرض' : req.status === 'accepted' ? 'تم الاتفاق' : 'مرفوض'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRequest(req)} className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap mr-2">عرض التفاصيل</button>
                </div>
              ))}
               {requests.length === 0 && <div className="text-center py-10 text-gray-400">لا توجد طلبات حالياً</div>}
            </div>
          </div>
        )}

        {/* Carpool Tab */}
        {activeTab === 'carpool' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg border border-green-100">
              <h2 className="text-xl font-bold text-green-800">مشاركة طريق (توصيل)</h2>
              <button onClick={() => setShowAddCarpool(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ICONS.Plus /> اعرض مشوار
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carpoolRides.map(ride => (
                <div key={ride.id} className="bg-white p-4 rounded-lg shadow border border-green-200 relative">
                  <button onClick={() => handleShare('carpool', ride.id)} className="absolute top-2 left-2 text-gray-400 hover:text-green-600" title="مشاركة">
                     <ICONS.Share />
                  </button>
                  <div className="flex justify-between mb-2 pr-6">
                    <span className="font-bold text-gray-700">{ride.carModel}</span>
                    <span className="text-green-600 font-bold">{ride.price} ج.م</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">من: {ride.from}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">إلى: {ride.to}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-2">
                    <span>{ride.time}</span>
                    <span>{ride.seats} مقاعد متاحة</span>
                    <a href={`tel:${ride.phone}`} className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">اتصال</a>
                  </div>
                </div>
              ))}
              {carpoolRides.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">لا توجد رحلات متاحة</div>}
            </div>
          </div>
        )}

        {/* Lost & Found Tab */}
        {activeTab === 'lostfound' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-lg border border-orange-100">
              <h2 className="text-xl font-bold text-orange-800">مفقودات</h2>
              <button onClick={() => setShowAddLostItem(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ICONS.Plus /> أضف غرض
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 relative">
                  <button onClick={() => handleShare('lostfound', item.id)} className="absolute top-1 left-1 bg-white p-1 rounded-full text-gray-500 hover:text-orange-600 shadow z-10" title="مشاركة">
                     <ICONS.Share />
                  </button>
                  <div className={`p-1 text-center text-white text-xs font-bold ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {item.type === 'lost' ? 'مفقود' : 'تم العثور عليه'}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{item.itemName}</h3>
                    <p className="text-sm text-gray-500 mb-2"><ICONS.MapPin /> {item.location} - {item.date}</p>
                    <p className="text-gray-700 text-sm mb-4">{item.description}</p>
                    <a href={`tel:${item.contact}`} className="block text-center w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded">
                       تواصل: {item.contact}
                    </a>
                  </div>
                </div>
              ))}
              {lostItems.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">لا توجد عناصر مسجلة</div>}
            </div>
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100">
              <h2 className="text-xl font-bold text-red-800">نجدة طريق (طوارئ)</h2>
              <button onClick={() => setShowAddSos(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                <ICONS.AlertTriangle /> طلب نجدة
              </button>
            </div>
            <div className="space-y-3">
              {sosAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border-2 flex justify-between items-center relative ${alert.status === 'active' ? 'bg-red-50 border-red-200' : 'bg-gray-100 border-gray-200 opacity-70'}`}>
                   <button onClick={() => handleShare('sos', alert.id)} className="absolute top-2 left-2 text-gray-400 hover:text-red-600" title="مشاركة">
                      <ICONS.Share />
                   </button>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-bold text-red-700 text-lg">{alert.issueType === 'battery' ? 'شحن بطارية' : alert.issueType === 'tire' ? 'تغيير إطار' : alert.issueType === 'fuel' ? 'نفاذ وقود' : 'حادث / أخرى'}</h3>
                       {alert.status === 'active' && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">نشط</span>}
                    </div>
                    <p className="text-sm text-gray-600">{alert.location}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString('ar-EG')}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                     <a href={`tel:${alert.phone}`} className="bg-red-600 text-white px-4 py-1 rounded text-center hover:bg-red-700">اتصال</a>
                     {user?.username === alert.requester && alert.status === 'active' && (
                       <button onClick={() => handleResolveSos(alert.id)} className="text-xs text-gray-500 underline">تم الحل</button>
                     )}
                  </div>
                </div>
              ))}
              {sosAlerts.length === 0 && <div className="text-center py-10 text-gray-400">لا توجد حالات طارئة نشطة</div>}
            </div>
          </div>
        )}

      </main>

      <Footer />

      {/* --- Modals --- */}

      {/* Notification Modal */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title="الإشعارات">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.filter(n => n.toUser === user?.username).length === 0 ? (
             <p className="text-center text-gray-500 py-4">لا توجد إشعارات جديدة</p>
          ) : (
            notifications.filter(n => n.toUser === user?.username).map(notif => (
              <div key={notif.id} className="p-3 bg-gray-50 border-b border-gray-100 rounded hover:bg-gray-100">
                 <p className="text-sm text-gray-800">{notif.message}</p>
                 <span className="text-xs text-gray-400 block mt-1 text-left">{new Date(notif.timestamp).toLocaleString('ar-EG')}</span>
              </div>
            ))
          )}
        </div>
        <button onClick={() => setNotifications([])} className="mt-4 w-full text-center text-red-500 text-sm hover:underline">مسح الكل</button>
      </Modal>

      {/* Add Parking Spot Modal */}
      <Modal isOpen={showAddSpot} onClose={() => setShowAddSpot(false)} title="إضافة ركنة جديدة">
        <AddSpotForm onSubmit={handleAddSpot} />
      </Modal>

      {/* Parking Details Modal */}
      {selectedSpot && (
        <Modal isOpen={!!selectedSpot} onClose={() => setSelectedSpot(null)} title="تفاصيل الركنة">
           <div className="space-y-4">
             <DetailRow label="العنوان" value={selectedSpot.address} copyable />
             <DetailRow label="المنطقة" value={selectedSpot.region} />
             <DetailRow label="المدة" value={`${selectedSpot.durationHours} ساعة`} />
             <div className="bg-gray-50 p-3 rounded">
                <label className="text-xs text-gray-500 block mb-1">الموقع (Link)</label>
                <a href={selectedSpot.locationLink} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm break-all">{selectedSpot.locationLink}</a>
             </div>
             <DetailRow label="طرق الدفع" value={selectedSpot.paymentMethods.map(p => p.type).join(', ')} />
             
             {/* Share Button Inside Modal */}
             <button onClick={() => handleShare('parking', selectedSpot.id)} className="w-full border border-gray-300 text-gray-600 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                <ICONS.Share /> مشاركة الركنة
             </button>

             <div className="border-t pt-4 mt-4">
                <button 
                  onClick={() => { handleRequestSpot(selectedSpot); setSelectedSpot(null); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow"
                >
                  طلب الركنة
                </button>
                <button 
                   onClick={() => { openChat(selectedSpot.owner, selectedSpot.id); setSelectedSpot(null); }}
                   className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2"
                >
                  <ICONS.MessageCircle /> تواصل مع المعلن
                </button>
             </div>
           </div>
        </Modal>
      )}

      {/* Add Service Request Modal */}
      <Modal isOpen={showAddRequest} onClose={() => setShowAddRequest(false)} title="طلب خدمة">
        <AddServiceForm onSubmit={handleAddServiceRequest} />
      </Modal>

      {/* Add Carpool Modal */}
      <Modal isOpen={showAddCarpool} onClose={() => setShowAddCarpool(false)} title="إضافة مشوار (Carpool)">
        <AddCarpoolForm onSubmit={handleAddCarpool} />
      </Modal>

      {/* Add Lost Item Modal */}
      <Modal isOpen={showAddLostItem} onClose={() => setShowAddLostItem(false)} title="إبلاغ عن مفقودات">
        <AddLostItemForm onSubmit={handleAddLostItem} />
      </Modal>

      {/* Add SOS Modal */}
      <Modal isOpen={showAddSos} onClose={() => setShowAddSos(false)} title="طلب نجدة عاجلة">
        <AddSosForm onSubmit={handleAddSos} />
      </Modal>

      {/* Service Details & Negotiation Modal */}
      {selectedRequest && (
        <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="تفاصيل الخدمة">
          <div className="space-y-4">
             <DetailRow label="الخدمة" value={selectedRequest.serviceName} />
             <DetailRow label="السعر المقترح" value={`${selectedRequest.suggestedPrice} ج.م`} />
             {selectedRequest.finalPrice && <DetailRow label="السعر النهائي (العرض)" value={`${selectedRequest.finalPrice} ج.م`} highlight />}
             <DetailRow label="رقم الهاتف" value={selectedRequest.phone} />
             <DetailRow label="محطة المترو" value={selectedRequest.metroStation} />
             <DetailRow label="طريقة الدفع" value={selectedRequest.paymentMethods.map(p => p.type).join(', ')} />
             
             <button onClick={() => handleShare('busy', selectedRequest.id)} className="w-full border border-gray-300 text-gray-600 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                <ICONS.Share /> مشاركة الطلب
             </button>

             <div className="border-t pt-4 mt-4">
               {/* Logic: If user is requester and status is negotiating */}
               {user?.username === selectedRequest.requester && selectedRequest.status === 'negotiating' && (
                 <div className="bg-orange-50 p-4 rounded border border-orange-200">
                    <p className="font-bold text-orange-800 mb-2">عرض جديد من: {selectedRequest.provider}</p>
                    <p className="mb-4">السعر المقترح للتنفيذ: <span className="font-bold">{selectedRequest.finalPrice} ج.م</span></p>
                    <div className="flex gap-2">
                       <button onClick={() => handleAcceptOffer(selectedRequest, true)} className="flex-1 bg-green-600 text-white py-2 rounded">موافق</button>
                       <button onClick={() => handleAcceptOffer(selectedRequest, false)} className="flex-1 bg-red-600 text-white py-2 rounded">رفض</button>
                    </div>
                 </div>
               )}

               {/* Logic: If user is NOT requester (Potential Provider) */}
               {user?.username !== selectedRequest.requester && selectedRequest.status === 'pending' && (
                 <NegotiationForm 
                   initialPrice={selectedRequest.suggestedPrice} 
                   onSubmit={(price, phone) => handleOfferService(selectedRequest, price, phone)} 
                 />
               )}

               {selectedRequest.status === 'accepted' && (
                 <div className="bg-green-100 p-4 rounded text-center text-green-800 font-bold">
                   تم الاتفاق! تواصل على {user?.username === selectedRequest.requester ? selectedRequest.providerPhone : selectedRequest.phone}
                 </div>
               )}
             </div>
          </div>
        </Modal>
      )}

      {/* Chat Modal */}
      <Modal isOpen={showChat.isOpen} onClose={() => setShowChat({...showChat, isOpen: false})} title={`محادثة مع ${showChat.targetUser}`}>
        <div className="h-64 flex flex-col">
          <div className="flex-grow overflow-y-auto bg-gray-50 p-2 rounded mb-2 border">
            {chatMessages
              .filter(m => (m.sender === user?.username && m.receiver === showChat.targetUser) || (m.sender === showChat.targetUser && m.receiver === user?.username))
              .map(msg => (
                <div key={msg.id} className={`mb-2 flex ${msg.sender === user?.username ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-3 py-1 rounded max-w-[80%] ${msg.sender === user?.username ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              id="chatInput"
              className="flex-grow border rounded p-2" 
              placeholder="اكتب رسالة..."
            />
            <button 
              onClick={() => {
                const input = document.getElementById('chatInput') as HTMLInputElement;
                if(input.value) {
                  sendChatMessage(input.value);
                  input.value = '';
                }
              }}
              className="bg-blue-600 text-white px-4 rounded"
            >
              إرسال
            </button>
          </div>
        </div>
      </Modal>

      {/* Other Apps Modal */}
      <Modal isOpen={showAppsModal} onClose={() => setShowAppsModal(false)} title="تطبيقات أخرى مقترحة">
        <div className="grid grid-cols-2 gap-4">
           {appLinks.map(app => (
             <a key={app.id} href={app.url} target="_blank" rel="noreferrer" className="block bg-gray-50 hover:bg-gray-100 p-3 rounded border text-center group">
               <img src={app.thumbnail} alt={app.name} className="w-16 h-16 rounded mx-auto mb-2 object-cover shadow-sm group-hover:scale-105 transition" />
               <h4 className="font-bold text-blue-600">{app.name}</h4>
               <p className="text-xs text-gray-500">{app.description}</p>
             </a>
           ))}
        </div>
      </Modal>

      {/* Admin Panel */}
      {showAdmin && user?.role === UserRole.ADMIN && (
        <AdminDashboard 
           isOpen={showAdmin} 
           onClose={() => setShowAdmin(false)}
           appName={appName}
           setAppName={setAppName}
           ads={ads}
           setAds={setAds}
           appLinks={appLinks}
           setAppLinks={setAppLinks}
           customHtml={customHtml}
           setCustomHtml={setCustomHtml}
        />
      )}
    </>
  );
}

// --- Sub-Components (Forms & Details) ---

const DetailRow = ({ label, value, copyable, highlight }: { label: string, value: string, copyable?: boolean, highlight?: boolean }) => (
  <div className={`flex justify-between items-center border-b pb-2 ${highlight ? 'bg-yellow-50 p-2 rounded' : ''}`}>
    <span className="text-gray-500 text-sm">{label}:</span>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-800">{value}</span>
      {copyable && (
        <button onClick={() => navigator.clipboard.writeText(value)} className="text-blue-500 text-xs hover:bg-blue-100 px-1 rounded">نسخ</button>
      )}
    </div>
  </div>
);

const AddSpotForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    address: '', region: '', locationLink: '', whatsapp: '', description: '', durationHours: 1,
    paymentInsta: false, paymentWallet: false, paymentCash: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentMethods: PaymentMethod[] = [];
    if(formData.paymentInsta) paymentMethods.push({type: 'instapay'});
    if(formData.paymentWallet) paymentMethods.push({type: 'wallet'});
    if(formData.paymentCash) paymentMethods.push({type: 'cash'});

    onSubmit({ ...formData, paymentMethods });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required placeholder="العنوان بالتفصيل" className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
      <input required placeholder="المنطقة" className="w-full border p-2 rounded" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
      <input required placeholder="رابط الموقع (Google Maps)" className="w-full border p-2 rounded" value={formData.locationLink} onChange={e => setFormData({...formData, locationLink: e.target.value})} />
      <input required placeholder="رقم الواتساب للتواصل" type="tel" className="w-full border p-2 rounded" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
      <div className="flex gap-2">
        <label className="text-sm">المدة (ساعات):</label>
        <input type="number" min="1" className="border p-1 rounded w-20" value={formData.durationHours} onChange={e => setFormData({...formData, durationHours: parseInt(e.target.value)})} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold">طرق الدفع:</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentInsta} onChange={e => setFormData({...formData, paymentInsta: e.target.checked})} /> انستا باي</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentWallet} onChange={e => setFormData({...formData, paymentWallet: e.target.checked})} /> محفظة إلكترونية</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentCash} onChange={e => setFormData({...formData, paymentCash: e.target.checked})} /> كاش</label>
      </div>
      <textarea placeholder="وصف إضافي..." className="w-full border p-2 rounded h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">تأكيد ونشر</button>
    </form>
  );
};

const AddServiceForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    serviceName: '', suggestedPrice: 0, phone: '', deliveryMethod: 'metro', metroStation: METRO_STATIONS[0], locationLink: '',
    paymentInsta: false, paymentWallet: false, paymentCash: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentMethods: PaymentMethod[] = [];
    if(formData.paymentInsta) paymentMethods.push({type: 'instapay'});
    if(formData.paymentWallet) paymentMethods.push({type: 'wallet'});
    if(formData.paymentCash) paymentMethods.push({type: 'cash'});

    onSubmit({ ...formData, paymentMethods });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required placeholder="نوع الخدمة / الطلب" className="w-full border p-2 rounded" value={formData.serviceName} onChange={e => setFormData({...formData, serviceName: e.target.value})} />
      <div>
         <label className="block text-xs text-gray-500">القيمة المقترحة (قابلة للتعديل)</label>
         <input required type="number" placeholder="السعر" className="w-full border p-2 rounded" value={formData.suggestedPrice} onChange={e => setFormData({...formData, suggestedPrice: parseInt(e.target.value)})} />
      </div>
      <input required type="tel" placeholder="رقم الهاتف" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      
      <div>
        <label className="block text-xs text-gray-500 mb-1">محطة المترو</label>
        <select 
          className="w-full bg-black text-white p-2 rounded border border-gray-600"
          value={formData.metroStation}
          onChange={e => setFormData({...formData, metroStation: e.target.value})}
        >
          {METRO_STATIONS.map(station => <option key={station} value={station}>{station}</option>)}
        </select>
      </div>

      <input placeholder="لوكيشن المكان (اختياري)" className="w-full border p-2 rounded" value={formData.locationLink} onChange={e => setFormData({...formData, locationLink: e.target.value})} />
      
      <div className="space-y-1">
        <p className="text-sm font-bold">طرق الدفع:</p>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentInsta} onChange={e => setFormData({...formData, paymentInsta: e.target.checked})} /> انستا باي</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentWallet} onChange={e => setFormData({...formData, paymentWallet: e.target.checked})} /> محفظة إلكترونية</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={formData.paymentCash} onChange={e => setFormData({...formData, paymentCash: e.target.checked})} /> كاش</label>
      </div>

      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">رفع الطلب</button>
    </form>
  );
};

const AddCarpoolForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    from: '', to: '', time: '', seats: 3, price: 0, phone: '', carModel: ''
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-3">
      <input required placeholder="من (مكان الانطلاق)" className="w-full border p-2 rounded" value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} />
      <input required placeholder="إلى (الوجهة)" className="w-full border p-2 rounded" value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} />
      <input required placeholder="موديل السيارة" className="w-full border p-2 rounded" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} />
      <div className="flex gap-2">
        <input required type="time" className="w-full border p-2 rounded" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
        <input required type="number" placeholder="المقاعد" className="w-24 border p-2 rounded" value={formData.seats} onChange={e => setFormData({...formData, seats: parseInt(e.target.value)})} />
      </div>
      <input required type="number" placeholder="السعر للفرد" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
      <input required type="tel" placeholder="رقم الهاتف" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">نشر المشوار</button>
    </form>
  );
};

const AddLostItemForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    itemName: '', description: '', location: '', contact: '', type: 'lost', date: new Date().toISOString().split('T')[0]
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-3">
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setFormData({...formData, type: 'lost'})} className={`flex-1 py-2 rounded font-bold ${formData.type === 'lost' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>مفقود (ضاع مني)</button>
        <button type="button" onClick={() => setFormData({...formData, type: 'found'})} className={`flex-1 py-2 rounded font-bold ${formData.type === 'found' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>موجود (لقيته)</button>
      </div>
      <input required placeholder="اسم الشيء (موبايل، محفظة...)" className="w-full border p-2 rounded" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} />
      <input required placeholder="المكان" className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
      <input type="date" className="w-full border p-2 rounded" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
      <input required type="tel" placeholder="رقم للتواصل" className="w-full border p-2 rounded" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
      <textarea placeholder="وصف وتفاصيل إضافية..." className="w-full border p-2 rounded h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">نشر الإعلان</button>
    </form>
  );
};

const AddSosForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    issueType: 'battery', location: '', phone: ''
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-3">
      <label className="block font-bold mb-1">نوع المشكلة:</label>
      <select className="w-full border p-2 rounded" value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})}>
        <option value="battery">شحن بطارية (وصلة)</option>
        <option value="tire">تغيير إطار (كاوتش)</option>
        <option value="fuel">نفاذ وقود</option>
        <option value="accident">حادث بسيط</option>
        <option value="other">أخرى</option>
      </select>
      <input required placeholder="موقعك الحالي (وصف دقيق)" className="w-full border p-2 rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
      <input required type="tel" placeholder="رقم هاتفك" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      <div className="bg-red-50 p-2 text-xs text-red-800 rounded">
        تنبيه: هذا الطلب سيظهر للجميع كحالة طارئة. يرجى استخدامه للضرورة فقط.
      </div>
      <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold animate-pulse">إرسال نداء استغاثة</button>
    </form>
  );
};

const NegotiationForm = ({ initialPrice, onSubmit }: { initialPrice: number, onSubmit: (p: number, phone: string) => void }) => {
  const [price, setPrice] = useState(initialPrice);
  const [phone, setPhone] = useState('');

  return (
    <div className="bg-gray-100 p-4 rounded border border-gray-300 mt-4">
      <h4 className="font-bold mb-2 text-center">تقديم عرض تنفيذ</h4>
      <div className="space-y-2">
        <div>
           <label className="text-xs">السعر الذي ستأخذه:</label>
           <input type="number" className="w-full border p-2 rounded" value={price} onChange={e => setPrice(parseInt(e.target.value))} />
        </div>
        <div>
           <label className="text-xs">رقم هاتفك للتواصل:</label>
           <input type="tel" className="w-full border p-2 rounded" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" required />
        </div>
        <button 
           onClick={() => { if(phone) onSubmit(price, phone); else alert('اكتب رقم الهاتف'); }}
           className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold"
        >
          موافقة وإرسال العرض
        </button>
      </div>
    </div>
  );
};

// --- Authentication Screens ---

const AuthScreen = ({ onLogin, onRegister }: { onLogin: (u: User) => void; onRegister: () => void; }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin backdoor
    if (username === 'admin' && password === 'admin') {
      onLogin({ username: 'Admin', role: UserRole.ADMIN });
      return;
    }

    const users = JSON.parse(localStorage.getItem('helpMe_users_db') || '[]');
    const foundUser = users.find((u: User) => u.username === username && u.password === password);

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">تسجيل الدخول - Help Me</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border p-3 rounded" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="w-full border p-3 rounded" type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition">دخول</button>
        </form>
        <button onClick={onRegister} className="w-full mt-4 text-blue-600 text-sm hover:underline">إنشاء حساب جديد</button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onBack, onRegisterSuccess }: { onBack: () => void; onRegisterSuccess: () => void; }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPass) { alert('كلمات المرور غير متطابقة'); return; }
    
    const users = JSON.parse(localStorage.getItem('helpMe_users_db') || '[]');
    if(users.find((u: User) => u.username === username)) { alert('اسم المستخدم موجود بالفعل'); return; }

    const newUser: User = { username, password, role: UserRole.USER };
    localStorage.setItem('helpMe_users_db', JSON.stringify([...users, newUser]));
    alert('تم إنشاء الحساب بنجاح');
    onRegisterSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">حساب جديد</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input className="w-full border p-3 rounded" placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="w-full border p-3 rounded" type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
          <input className="w-full border p-3 rounded" type="password" placeholder="تأكيد كلمة المرور" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
          <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">تسجيل</button>
        </form>
        <button onClick={onBack} className="w-full mt-4 text-gray-500 text-sm hover:underline">العودة لتسجيل الدخول</button>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---

const AdminDashboard = ({ isOpen, onClose, appName, setAppName, ads, setAds, appLinks, setAppLinks, customHtml, setCustomHtml }: any) => {
  if (!isOpen) return null;
  
  const [newAdText, setNewAdText] = useState('');
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdImage, setNewAdImage] = useState(''); // New State for Image
  const [newAppLinkName, setNewAppLinkName] = useState('');
  const [newAppLinkUrl, setNewAppLinkUrl] = useState('');
  const [newAppLinkThumb, setNewAppLinkThumb] = useState('https://picsum.photos/100/100');

  const handleAddAd = () => {
    if(!newAdText) return;
    setAds([...ads, { id: Date.now().toString(), content: newAdText, link: newAdLink || '#', thumbnail: newAdImage }]);
    setNewAdText(''); setNewAdLink(''); setNewAdImage('');
  };

  const handleAddAppLink = () => {
    if(!newAppLinkName) return;
    setAppLinks([...appLinks, { 
      id: Date.now().toString(), 
      name: newAppLinkName, 
      url: newAppLinkUrl || '#', 
      thumbnail: newAppLinkThumb,
      description: 'جديد'
    }]);
    setNewAppLinkName(''); setNewAppLinkUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0">
        <h2 className="text-xl font-bold">لوحة تحكم المدير (Admin)</h2>
        <button onClick={onClose} className="bg-red-600 px-4 py-2 rounded">إغلاق</button>
      </div>
      
      <div className="container mx-auto p-6 space-y-8">
        
        {/* App Settings */}
        <section className="bg-gray-50 p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4 text-blue-600">إعدادات عامة</h3>
          <div className="flex gap-4 items-center">
             <label>اسم التطبيق:</label>
             <input className="border p-2 rounded flex-grow" value={appName} onChange={e => setAppName(e.target.value)} />
          </div>
        </section>

        {/* Ads Manager */}
        <section className="bg-gray-50 p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4 text-yellow-600">إدارة شريط الإعلانات</h3>
          <div className="flex flex-col gap-2 mb-4">
             <input className="border p-2 rounded w-full" placeholder="نص الإعلان" value={newAdText} onChange={e => setNewAdText(e.target.value)} />
             <div className="flex gap-2">
               <input className="border p-2 rounded flex-grow" placeholder="رابط الإعلان (يمكن استخدام رابط مشاركة)" value={newAdLink} onChange={e => setNewAdLink(e.target.value)} />
               <input className="border p-2 rounded flex-grow" placeholder="رابط صورة الإعلان (URL)" value={newAdImage} onChange={e => setNewAdImage(e.target.value)} />
             </div>
             <button onClick={handleAddAd} className="bg-blue-600 text-white px-4 py-2 rounded self-end">إضافة</button>
          </div>
          <ul className="space-y-2">
            {ads.map((ad: Advertisement) => (
              <li key={ad.id} className="flex justify-between items-center bg-white p-2 rounded border">
                <div className="flex items-center gap-2">
                   {ad.thumbnail && <img src={ad.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />}
                   <span className="truncate max-w-xs">{ad.content}</span>
                </div>
                <button onClick={() => setAds(ads.filter((a: any) => a.id !== ad.id))} className="text-red-500 text-sm">حذف</button>
              </li>
            ))}
          </ul>
        </section>

        {/* App Links Manager */}
        <section className="bg-gray-50 p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4 text-purple-600">إدارة التطبيقات المقترحة (الروابط)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
             <input className="border p-2 rounded" placeholder="اسم التطبيق" value={newAppLinkName} onChange={e => setNewAppLinkName(e.target.value)} />
             <input className="border p-2 rounded" placeholder="رابط التطبيق" value={newAppLinkUrl} onChange={e => setNewAppLinkUrl(e.target.value)} />
             <input className="border p-2 rounded" placeholder="رابط الصورة" value={newAppLinkThumb} onChange={e => setNewAppLinkThumb(e.target.value)} />
          </div>
          <button onClick={handleAddAppLink} className="bg-purple-600 text-white px-4 py-2 rounded w-full mb-4">إضافة رابط جديد</button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {appLinks.map((app: AppLink) => (
              <div key={app.id} className="bg-white p-2 rounded border text-center relative">
                 <img src={app.thumbnail} alt="" className="w-10 h-10 mx-auto rounded-full"/>
                 <p className="text-xs font-bold mt-1">{app.name}</p>
                 <button onClick={() => setAppLinks(appLinks.filter((a: any) => a.id !== app.id))} className="text-red-500 text-xs mt-2 border border-red-200 px-2 rounded hover:bg-red-50">حذف</button>
              </div>
            ))}
          </div>
        </section>

        {/* Developer Mode (Custom HTML) */}
        <section className="bg-gray-50 p-6 rounded shadow border border-red-200">
           <h3 className="text-lg font-bold mb-4 text-red-600">وضع المطور (إضافة كود HTML)</h3>
           <p className="text-sm text-gray-500 mb-2">تنبيه: الكود المكتوب هنا سيظهر في الصفحة الرئيسية. استخدمه بحذر.</p>
           <textarea 
             className="w-full h-40 border p-2 rounded font-mono text-sm bg-gray-900 text-green-400" 
             placeholder="<div><h1>Custom Section</h1></div>"
             value={customHtml}
             onChange={e => setCustomHtml(e.target.value)}
           ></textarea>
        </section>

         <div className="flex justify-end">
             <a href="mailto:admin@helpmme.com" className="text-blue-600 underline">تواصل مع الإدارة الفنية</a>
         </div>

      </div>
    </div>
  );
};
