

import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { User, Show, ShowDetails, Review, WatchlistItem, List as UserList } from './types';
import { getCurrentUser, getUserById, login, register, logout, addToWatchlist, removeFromWatchlist, getAllMembers, updateTopFavorites, rateShow, getCommunityFavoriteIds, getMostWatchlistedIds, addReview, getReviewsByShowId, updateUser, getReviewsByUserId, createList, addShowToList, likeReview, replyToReview, getListById, likeList, getReviewById, deleteReview, deleteReply, addCommentToList, getUserRatingForShow, uploadAvatar, getAllPublicLists } from './services/authService';
import { getTrendingShows, searchShows, getImageUrl, getShowDetails, getShowsByIds, getClassicShows, getComedyShows, getSciFiShows, getAllCuratedShows } from './services/tmdbService';
import { checkAndNotify } from './services/notificationService';
import { Film, Search, User as UserIcon, LogOut, Settings, Plus, Check, Bell, Heart, X, Star, ChevronRight, ChevronDown, Calendar, Clock, MessageSquare, PlayCircle, Globe, Edit2, Filter, Image as ImageIcon, Type, Key, List, Grid, MoreHorizontal, Layout, ThumbsUp, Reply, ArrowLeft, Trash2, RefreshCcw, Eye, EyeOff, Lock, CheckSquare, Square, Mail, Menu, Users } from 'lucide-react';
import Turnstile from 'react-turnstile';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
   en: {
      community: "Members",
      watchlist: "Watchlist",
      viewProfile: "View Profile",
      login: "Log In",
      joinNow: "Join Now",
      featured: "Featured",
      inWatchlist: "In Watchlist",
      addToWatchlist: "Add to Watchlist",
      trackShow: "Track Show",
      tracking: "In Watchlist",
      viewDetails: "View Details",
      findObsession: "Find your next obsession",
      searchPlaceholder: "Search shows...",
      globalTrending: "Global Trending Now",
      hallOfFame: "Top Rated Classics",
      mindBenders: "Sci-Fi & Fantasy",
      sitcoms: "Comedy Hits",
      viewAll: "View All",
      settings: "Settings",
      logout: "Logout",
      watching: "Watching",
      ratedShows: "Rated Shows",
      favorites: "Favorites",
      lists: "Lists",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      tmdbKey: "TMDB API Key",
      language: "Language",
      notificationsActive: "Notifications",
      bio: "Bio",
      avatarUrl: "Avatar URL",
      emailAddr: "Email",
      username: "Username",
      password: "Password",
      overview: "Overview",
      topCast: "Top Cast",
      reviews: "Reviews",
      writeReview: "Write a review",
      postReview: "Post Review",
      nextEpisode: "Next Episode",
      ended: "Ended / TBD",
      createList: "Create New List",
      addToList: "Add to List",
      listName: "List Name",
      desc: "Description",
      privateList: "Private List",
      myLists: "My Lists",
      noLists: "No lists yet.",
      loadMore: "Load More",
      theme: "Theme",
      setupKey: "Setup API Key",
      tmdbDesc: "Setup your key to see data.",
      discoverShows: "Discover Shows",
      topFavorites: "Top Favorites",
      myWatchlist: "My Watchlist",
      communityTop: "Community Top Rated",
      mostTracked: "Most Watchlisted",
      sortBy: "Sort By",
      reply: "Reply",
      newPassword: "New Password",
      confirm: "Confirm",
      genre: "Genre",
      resetTheme: "Reset Theme",
      recentlyRated: "Recently Rated",
      incorrectCreds: "Incorrect email or password",
      rememberMe: "Remember me",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?"
   },
   tr: {
      community: "Üyeler",
      watchlist: "İzleme Listesi",
      viewProfile: "Profili Gör",
      login: "Giriş Yap",
      joinNow: "Katıl",
      featured: "Öne Çıkan",
      inWatchlist: "Listede",
      addToWatchlist: "Listeye Ekle",
      trackShow: "Takip Et",
      tracking: "Listede",
      viewDetails: "Detaylar",
      findObsession: "Yeni takıntını bul",
      searchPlaceholder: "Dizi ara...",
      globalTrending: "Dünyada Trend Olanlar",
      hallOfFame: "Efsaneler",
      mindBenders: "Bilim Kurgu",
      sitcoms: "Komedi",
      viewAll: "Tümünü Gör",
      settings: "Ayarlar",
      logout: "Çıkış",
      watching: "İzlenen",
      ratedShows: "Puanlanan",
      favorites: "Favoriler",
      lists: "Listeler",
      editProfile: "Profili Düzenle",
      saveChanges: "Kaydet",
      tmdbKey: "TMDB API Anahtarı",
      language: "Dil",
      notificationsActive: "Bildirimler",
      bio: "Biyografi",
      avatarUrl: "Avatar URL",
      emailAddr: "E-posta",
      username: "Kullanıcı Adı",
      password: "Şifre",
      overview: "Özet",
      topCast: "Oyuncular",
      reviews: "İncelemeler",
      writeReview: "İnceleme Yaz",
      postReview: "Gönder",
      nextEpisode: "Sonraki Bölüm",
      ended: "Bitti",
      createList: "Yeni Liste Oluştur",
      addToList: "Listeye Ekle",
      listName: "Liste Adı",
      desc: "Açıklama",
      privateList: "Gizli Liste",
      myLists: "Listelerim",
      noLists: "Henüz liste yok.",
      loadMore: "Daha Fazla Yükle",
      theme: "Tema",
      setupKey: "API Kur",
      tmdbDesc: "Veri görmek için key kur.",
      discoverShows: "Dizileri Keşfet",
      topFavorites: "Favoriler",
      myWatchlist: "İzleme Listem",
      communityTop: "Topluluk En İyileri",
      mostTracked: "En Çok Eklenenler",
      sortBy: "Sırala",
      reply: "Yanıtla",
      newPassword: "Yeni Şifre",
      confirm: "Onayla",
      genre: "Tür",
      resetTheme: "Temayı Sıfırla",
      recentlyRated: "Son Puanlananlar",
      incorrectCreds: "Hatalı e-posta veya şifre",
      rememberMe: "Beni hatırla",
      dontHaveAccount: "Hesabın yok mu?",
      alreadyHaveAccount: "Zaten hesabın var mı?"
   }
};

type Language = 'en' | 'tr';

// --- Utility ---
const getAvatarColor = (username: string) => {
   const colors = [
      'from-red-500 to-orange-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-yellow-500 to-amber-500',
      'from-indigo-500 to-violet-500'
   ];
   let hash = 0;
   for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
   }
   return colors[Math.abs(hash) % colors.length];
};

// --- Contexts ---
const AuthContext = createContext<{
   user: User | null;
   refreshUser: () => Promise<void>;
   handleLogout: () => void;
}>({ user: null, refreshUser: async () => { }, handleLogout: () => { } });

const BackgroundContext = createContext<{
   setBackground: (url: string | null) => void;
}>({ setBackground: () => { } });

const LanguageContext = createContext<{
   language: Language;
   setLanguage: (lang: Language) => void;
   t: (key: keyof typeof TRANSLATIONS['en']) => string;
}>({
   language: 'en',
   setLanguage: () => { },
   t: (key) => key
});

const useTranslation = () => useContext(LanguageContext);

// --- Basic Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = "button", disabled }: any) => {
   const baseStyle = "px-4 py-2 rounded font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm tracking-wide shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 active:scale-95";
   const variants: any = {
      primary: "bg-accentGreen text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,224,84,0.4)] border border-transparent",
      secondary: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-accentGreen/30",
      danger: "bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/20",
   };
   return (
      <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
         {children}
      </button>
   );
};

const Input = ({ type = "text", placeholder, value, onChange, className = "", disabled = false, autoFocus = false }: any) => (
   <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`w-full bg-transparent border border-white/20 px-3 py-2 rounded text-white focus:outline-none focus:border-accentGreen transition-all placeholder-gray-500 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
   />
);

const StarRating = ({ rating, onRate, readOnly = false, size = 20 }: { rating: number, onRate?: (r: number) => void, readOnly?: boolean, size?: number }) => {
   const [hover, setHover] = useState(0);
   return (
      <div className="flex items-center gap-1">
         {[1, 2, 3, 4, 5].map((star) => (
            <button
               key={star}
               disabled={readOnly}
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRate && onRate(star); }}
               onMouseEnter={() => !readOnly && setHover(star)}
               onMouseLeave={() => !readOnly && setHover(0)}
               className={`transition-transform ${!readOnly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            >
               <Star
                  size={readOnly ? size * 0.7 : size}
                  className={`${(hover || rating) >= star ? 'text-accentOrange fill-accentOrange drop-shadow-[0_0_8px_rgba(255,128,0,0.5)]' : 'text-gray-600 fill-gray-600/20'}`}
               />
            </button>
         ))}
      </div>
   );
};

const Modal = ({ children, onClose, title }: any) => (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1f2329] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
         <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0"><h3 className="text-lg font-black text-white uppercase tracking-wider">{title}</h3><button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button></div>
         <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
   </div>
);

// Logo Component - Perfectly Symmetrical
const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
   const sizes = {
      sm: { outer: 'w-8 h-8', mid: 'w-5 h-5', inner: 'w-2 h-2' },
      md: { outer: 'w-12 h-12', mid: 'w-8 h-8', inner: 'w-3 h-3' },
      lg: { outer: 'w-20 h-20', mid: 'w-12 h-12', inner: 'w-5 h-5' }
   };
   const s = sizes[size];
   return (
      <div className={`${s.outer} bg-accentGreen flex items-center justify-center shadow-lg`}>
         <div className={`${s.mid} bg-black flex items-center justify-center`}>
            <div className={`${s.inner} bg-accentGreen`}></div>
         </div>
      </div>
   );
};

const Navbar = () => {
   const { user } = useContext(AuthContext);
   const { t } = useTranslation();
   const [isScrolled, setIsScrolled] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const location = useLocation();

   useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   useEffect(() => {
      setIsMobileMenuOpen(false);
   }, [location]);

   return (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#14181c]/90 backdrop-blur-xl border-b border-white/5 py-2 shadow-2xl' : 'bg-transparent py-6'}`}>
         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-3 z-50 relative">
               <Logo size="sm" />
               <span className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-accentGreen transition-colors">
                  Easy Series <span className="font-light text-gray-400 group-hover:text-white transition-colors">Tracker</span>
               </span>
            </Link>

            <button
               className="md:hidden text-white z-50 relative hover:text-accentGreen transition-colors"
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
               {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <div className="hidden md:flex items-center gap-8">
               <div className="flex items-center gap-6">
                  <Link to="/members" className={`text-xs font-bold uppercase tracking-widest hover:text-accentGreen transition-colors ${location.pathname === '/members' ? 'text-white' : 'text-gray-400'}`}>{t('community')}</Link>
                  <Link to="/browse" className={`text-xs font-bold uppercase tracking-widest hover:text-accentGreen transition-colors ${location.pathname === '/browse' ? 'text-white' : 'text-gray-400'}`}>{t('discoverShows') || 'Discover'}</Link>
               </div>

               {user ? (
                  <>
                     <div className="flex items-center gap-6">
                        <Link to="/watchlist" className={`text-xs font-bold uppercase tracking-widest hover:text-accentGreen transition-colors ${location.pathname === '/watchlist' ? 'text-white' : 'text-gray-400'}`}>{t('watchlist')}</Link>
                     </div>
                     <div className="h-5 w-px bg-white/10 block" />
                     <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition group pl-2">
                        <div className="text-right block">
                           <span className="block text-xs font-bold text-white group-hover:text-accentGreen transition-colors">{user.username}</span>
                        </div>
                        <div className={`w-9 h-9 rounded-full ring-2 ring-transparent group-hover:ring-accentGreen overflow-hidden flex items-center justify-center text-white font-black bg-gradient-to-br ${getAvatarColor(user.username)}`}>
                           {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                        </div>
                     </Link>
                  </>
               ) : (
                  <div className="flex items-center gap-4">
                     <Link to="/login" className="text-xs font-bold uppercase text-gray-300 hover:text-white tracking-wider">{t('login')}</Link>
                     <Link to="/register">
                        <Button variant="primary" className="!py-2 !px-5 !rounded-full text-xs">{t('joinNow')}</Button>
                     </Link>
                  </div>
               )}
            </div>

            <div className={`fixed inset-0 bg-[#14181c]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
               <Link to="/members" className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accentGreen transition-colors">{t('community')}</Link>
               <Link to="/browse" className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accentGreen transition-colors">{t('discoverShows') || 'Discover'}</Link>
               {user ? (
                  <>
                     <Link to="/watchlist" className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accentGreen transition-colors">{t('watchlist')}</Link>
                     <Link to="/profile" className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter text-white hover:text-accentGreen transition-colors">
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white font-black bg-gradient-to-br ${getAvatarColor(user.username)}`}>
                           {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
                        </div>
                        Profile
                     </Link>
                  </>
               ) : (
                  <>
                     <Link to="/login" className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accentGreen transition-colors">{t('login')}</Link>
                     <Link to="/register" className="text-2xl font-black uppercase tracking-tighter text-accentGreen hover:text-white transition-colors">{t('joinNow')}</Link>
                  </>
               )}
            </div>
         </div>
      </nav>
   );
};

const ShowCard = ({ show }: { show: Show }) => {
   const { user, refreshUser } = useContext(AuthContext);
   const { t } = useTranslation();
   const isAdded = user?.watchlist.some(w => w.showId === show.id);
   const userRating = user?.ratings?.[show.id];
   const [hoverRating, setHoverRating] = useState(0);

   const toggleTrack = async () => {
      if (!user) return;
      if (isAdded) await removeFromWatchlist(show.id);
      else await addToWatchlist(show.id);
      refreshUser();
   };

   const handleQuickRate = async (r: number) => {
      if (!user) return;
      await rateShow(show.id, r);
      refreshUser();
   };

   return (
      <div className="group relative flex-shrink-0 w-full block">
         <Link to={`/show/${show.id}`} className="block aspect-[2/3] overflow-hidden rounded-lg bg-[#1f2329] ring-1 ring-white/5 transition-all duration-500 group-hover:ring-accentGreen/50 group-hover:shadow-[0_0_40px_rgba(0,224,84,0.15)] relative transform group-hover:-translate-y-2 z-10">
            <img
               src={getImageUrl(show.poster_path)}
               alt={show.name}
               loading="lazy"
               className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 ease-out"
            />

            {/* Quick Track Button (Center on Hover) */}
            {user && (
               <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTrack(); }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-20 ${isAdded ? 'bg-accentGreen text-black' : 'bg-black/80 text-white hover:bg-accentGreen hover:text-black'} opacity-0 group-hover:opacity-100 hover:scale-110`}
                  title={isAdded ? "Untrack" : "Track"}
               >
                  {isAdded ? <Check size={20} /> : <Plus size={20} />}
               </button>
            )}

            {/* Badges */}
            {userRating && (
               <div className="absolute top-2 left-2 bg-accentOrange text-black text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 z-20">
                  <Star size={8} fill="black" /> {userRating}
               </div>
            )}

            {/* Quick Rate Inside Image at Bottom */}
            {user && (
               <div
                  className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center gap-1.5 z-10"
                  onClick={(e) => e.preventDefault()}
                  onMouseLeave={() => setHoverRating(0)}
               >
                  {[1, 2, 3, 4, 5].map((star) => (
                     <button
                        key={star}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickRate(star); }}
                        onMouseEnter={() => setHoverRating(star)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                     >
                        <Star
                           size={20}
                           className={`${(hoverRating || userRating || 0) >= star ? 'text-accentOrange fill-accentOrange drop-shadow-[0_0_8px_rgba(255,153,0,0.8)]' : 'text-gray-600'}`}
                        />
                     </button>
                  ))}
               </div>
            )}
         </Link>

         <div className="mt-3 px-1 group-hover:translate-x-1 transition-transform duration-300">
            <Link to={`/show/${show.id}`} className="font-bold text-sm text-gray-100 leading-tight truncate group-hover:text-accentGreen transition-colors block">{show.name}</Link>

            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-500">{show.first_air_date?.split('-')[0]}</span>
                  <div className="flex items-center gap-1 bg-white/5 px-1 py-0.5 rounded">
                     <Star size={8} className="text-accentOrange fill-accentOrange" />
                     <span className="text-[10px] font-bold text-gray-300">{show.vote_average?.toFixed(1)}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const RatedShowCard = ({ id, rating }: { id: number, rating: number }) => {
   const [show, setShow] = useState<ShowDetails | null>(null);
   useEffect(() => { getShowDetails(id).then(setShow) }, [id]);
   if (!show) return <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />;
   return (
      <Link to={`/show/${id}`} className="relative block aspect-[2/3] rounded-lg overflow-hidden group border border-white/10 hover:border-accentGreen transition">
         <img src={getImageUrl(show.poster_path)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
         <div className="absolute top-2 left-2 bg-accentOrange text-black text-xs font-black px-2 py-1 rounded shadow-lg z-20 flex items-center gap-1">
            <Star size={10} fill="black" /> {rating}
         </div>
      </Link>
   )
}

const SimpleShowCard = ({ id }: { id: number }) => {
   const [show, setShow] = useState<ShowDetails | null>(null);
   const [error, setError] = useState(false);
   useEffect(() => {
      if (!id || isNaN(id)) {
         setError(true);
         return;
      }
      getShowDetails(id).then(data => {
         if (data) setShow(data);
         else setError(true);
      }).catch(() => setError(true));
   }, [id]);
   if (error || !id || isNaN(id)) return <div className="aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center text-gray-500 text-xs">Not found</div>;
   if (!show) return <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-lg" />;
   return <ShowCard show={show} />
}

// --- Main Components ---

const Home = () => {
   const { user, refreshUser } = useContext(AuthContext);
   const [sections, setSections] = useState<{ title: string, data: Show[], link: string, isCommunity?: boolean }[]>([]);
   const [heroCandidates, setHeroCandidates] = useState<Show[]>([]);
   const [heroIndex, setHeroIndex] = useState(0);
   const [isHeroPaused, setIsHeroPaused] = useState(false);
   const [progress, setProgress] = useState(0);

   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState<Show[]>([]);
   const [dataLoaded, setDataLoaded] = useState(false);
   const [showRatingReminder, setShowRatingReminder] = useState(false);
   const [reminderShow, setReminderShow] = useState<ShowDetails | null>(null);
   const [reminderRating, setReminderRating] = useState(0);
   const hasShownReminderRef = useRef(false);
   const [communityLists, setCommunityLists] = useState<UserList[]>([]);
   const { t } = useTranslation();

   useEffect(() => {
      const loadData = async () => {
         // 1. Load Trending (Hero + First Section) - Critical Path
         const trending = await getTrendingShows();

         if (trending && trending.length > 0) {
            const validTrending = trending.filter(s => s.backdrop_path);
            if (validTrending.length > 0) {
               setHeroCandidates(validTrending.slice(0, 5));
            }
            setSections([
               { title: t('globalTrending'), data: trending.slice(0, 6), link: "/browse?sort=popularity.desc" }
            ]);
            setDataLoaded(true); // Show UI immediately
         }

         // 2. Load other TMDB categories in parallel
         const [classics, comedy, scifi] = await Promise.all([
            getClassicShows(),
            getComedyShows(),
            getSciFiShows()
         ]);

         setSections(prev => [
            ...prev,
            { title: t('hallOfFame'), data: classics.slice(0, 6), link: "/browse?sort=vote_average.desc" },
            { title: t('mindBenders'), data: scifi.slice(0, 6), link: "/browse?sort=popularity.desc&genre=scifi" },
            { title: t('sitcoms'), data: comedy.slice(0, 6), link: "/browse?sort=popularity.desc&genre=comedy" }
         ]);

         // 3. Load Community Data (Slower, requires DB + TMDB)
         try {
            const commTopList = await getCommunityFavoriteIds();
            const commTopIds = commTopList.slice(0, 6).map(x => x.id);

            const commTrackList = await getMostWatchlistedIds();
            const commTrackIds = commTrackList.slice(0, 6).map(x => x.id);

            const [commTop, commTrack] = await Promise.all([
               getShowsByIds(commTopIds),
               getShowsByIds(commTrackIds)
            ]);

            // Only add if not already present (prevent duplicates)
            setSections(prev => {
               const hasCommTop = prev.some(s => s.link === "/browse?sort=site_rating");
               const hasMostTracked = prev.some(s => s.link === "/browse?sort=site_pop");

               const newSections = [];
               if (!hasCommTop && commTop.length > 0) {
                  newSections.push({ title: t('communityTop'), data: commTop, link: "/browse?sort=site_rating", isCommunity: true });
               }
               if (!hasMostTracked && commTrack.length > 0) {
                  newSections.push({ title: t('mostTracked'), data: commTrack, link: "/browse?sort=site_pop", isCommunity: true });
               }

               return [...prev, ...newSections];
            });

            // Load community lists
            const publicLists = await getAllPublicLists();
            setCommunityLists(publicLists);
         } catch (error) {
            console.error("Failed to load community sections", error);
         }
      };
      loadData();
   }, [t]);

   useEffect(() => {
      if (heroCandidates.length === 0) return;

      let interval: any;
      if (!isHeroPaused) {
         interval = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroCandidates.length);
            setProgress(0);
         }, 5000);
      }

      const progressInterval = setInterval(() => {
         if (!isHeroPaused) {
            setProgress(p => Math.min(p + 2, 100));
         }
      }, 100);

      return () => {
         clearInterval(interval);
         clearInterval(progressInterval);
      };
   }, [heroCandidates, isHeroPaused]);

   useEffect(() => setProgress(0), [heroIndex]);

   useEffect(() => {
      const search = async () => {
         if (searchQuery.trim().length > 2) {
            const results = await searchShows(searchQuery);
            setSearchResults(results.slice(0, 5));
         } else {
            setSearchResults([]);
         }
      };
      const timeout = setTimeout(search, 300);
      return () => clearTimeout(timeout);
   }, [searchQuery]);

   useEffect(() => {
      console.log('[REMINDER DEBUG] useEffect triggered', {
         hasUser: !!user,
         watchlistLength: user?.watchlist?.length || 0,
         hasShown: hasShownReminderRef.current
      });

      // Rating reminder: show once when component mounts
      if (!user) {
         console.log('[REMINDER DEBUG] No user, skipping');
         return;
      }

      if (user.watchlist.length === 0) {
         console.log('[REMINDER DEBUG] Empty watchlist, skipping');
         return;
      }

      if (hasShownReminderRef.current) {
         console.log('[REMINDER DEBUG] Already shown, skipping');
         return;
      }

      // Find unrated shows from watchlist
      const unratedShows = user.watchlist.filter(w => !user.ratings[w.showId]);
      console.log('[REMINDER DEBUG] Found unrated shows:', unratedShows.length);

      if (unratedShows.length === 0) {
         console.log('[REMINDER DEBUG] All shows rated, skipping');
         return;
      }

      // Mark as shown immediately to prevent multiple triggers
      hasShownReminderRef.current = true;
      console.log('[REMINDER DEBUG] Setting timer to show reminder...');

      // Show reminder after short delay
      const timer = setTimeout(() => {
         console.log('[REMINDER DEBUG] Timer fired, loading show...');
         const randomShow = unratedShows[Math.floor(Math.random() * unratedShows.length)];
         getShowDetails(randomShow.showId).then(show => {
            console.log('[REMINDER DEBUG] Show loaded, displaying reminder:', show.name);
            setReminderShow(show);
            setShowRatingReminder(true);
         }).catch(err => {
            console.error("[REMINDER DEBUG] Failed to load show:", err);
         });
      }, 500); // Reduced to 500ms for faster testing

      return () => {
         console.log('[REMINDER DEBUG] Cleanup timer');
         clearTimeout(timer);
      };
   }, [user]);

   const handleReminderRate = async (rating: number) => {
      if (reminderShow && user) {
         await rateShow(reminderShow.id, rating);
         await refreshUser();
         setShowRatingReminder(false);
         setReminderShow(null);
      }
   };

   // Removed blocking loading state to allow incremental rendering
   if (!dataLoaded && sections.length === 0) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 border-4 border-accentGreen border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm animate-pulse">Loading content...</p>
         </div>
      )
   }

   const heroShow = heroCandidates[heroIndex];

   return (
      <div className="relative min-h-screen w-full overflow-hidden">
         <div className="fixed inset-0 z-0 bg-black">
            {heroShow && (
               <div key={heroShow.id} className="absolute inset-0 animate-ken-burns opacity-60 transition-opacity duration-1000">
                  <img src={getImageUrl(heroShow.backdrop_path, 'original')} className="w-full h-full object-cover" />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#14181c]/20 via-[#14181c]/80 to-[#14181c]" />
         </div>

         <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
            {heroShow && (
               <div
                  className="mb-24 animate-fade-in-up cursor-default relative flex flex-col items-start"
                  onMouseEnter={() => setIsHeroPaused(true)}
                  onMouseLeave={() => setIsHeroPaused(false)}
               >
                  <div className="inline-block px-3 py-1 mb-4 rounded-full border border-accentGreen/30 bg-accentGreen/10 backdrop-blur text-accentGreen text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,224,84,0.2)]">
                     {t('featured') || 'Featured'}
                  </div>
                  <h1 key={`${heroShow.id}-title`} className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl leading-[0.9] animate-fade-in-up">
                     {heroShow.name}
                  </h1>
                  <p key={`${heroShow.id}-desc`} className="text-lg text-gray-200 line-clamp-2 max-w-xl mb-8 font-medium drop-shadow-md animate-fade-in-up">
                     {heroShow.overview}
                  </p>

                  <div className="flex gap-4 mb-8">
                     <Link to={`/show/${heroShow.id}`}>
                        <Button variant="primary" className="!px-8 !py-3">{t('viewDetails')}</Button>
                     </Link>
                  </div>

                  {/* Progress Bar Outside Buttons */}
                  <div className="flex gap-2 mt-4 w-64">
                     {heroCandidates.map((_, idx) => (
                        <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                           <div
                              className={`h-full bg-accentGreen transition-all duration-300 ${idx === heroIndex ? 'w-full' : (idx < heroIndex ? 'w-full' : 'w-0')}`}
                              style={idx === heroIndex ? { width: `${progress}%`, transition: 'width 0.1s linear' } : {}}
                           ></div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="mb-20 relative max-w-lg z-50">
               <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all focus-within:border-accentGreen/50 focus-within:shadow-[0_0_30px_rgba(0,224,84,0.1)]">
                  <Search className="text-gray-400" />
                  <input
                     type="text"
                     className="w-full bg-transparent text-white font-bold placeholder-gray-500 focus:outline-none"
                     placeholder={t('searchPlaceholder')}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-[#1f2329] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60]">
                     {searchResults.map(s => (
                        <Link to={`/show/${s.id}`} key={s.id} className="flex items-center gap-4 p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                           <img src={getImageUrl(s.poster_path)} className="w-10 h-14 object-cover rounded bg-gray-800" />
                           <div>
                              <div className="text-white font-bold text-sm">{s.name}</div>
                              <div className="text-gray-500 text-xs">{s.first_air_date?.split('-')[0]}</div>
                           </div>
                        </Link>
                     ))}
                  </div>
               )}
            </div>

            <div className="space-y-20">
               {sections.map((section, idx) => (
                  <div key={idx} className={section.isCommunity ? "p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20" : ""}>
                     <div className="flex items-end justify-between mb-6 border-b border-white/5 pb-2">
                        <h2 className={`text-2xl font-black uppercase tracking-tighter ${section.isCommunity ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-white'}`}>{section.title}</h2>
                        <Link to={section.link} className="text-xs font-bold text-accentGreen hover:text-white uppercase tracking-widest flex items-center gap-1">
                           {t('viewAll')} <ChevronRight size={14} />
                        </Link>
                     </div>
                     {section.data.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                           {section.data.map(show => <ShowCard key={show.id} show={show} />)}
                        </div>
                     ) : (
                        <div className="text-center text-gray-500 text-sm py-10 font-bold">No data yet.</div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Rating Reminder Modal */}
         {showRatingReminder && reminderShow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
               <div className="bg-[#1f2329] rounded-2xl border border-white/10 shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                  {/* Show Backdrop */}
                  <div className="relative h-48 bg-gradient-to-b from-transparent to-[#1f2329]">
                     {reminderShow.backdrop_path && (
                        <>
                           <img src={getImageUrl(reminderShow.backdrop_path, 'w500')} className="w-full h-full object-cover opacity-50" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#1f2329] via-[#1f2329]/50 to-transparent" />
                        </>
                     )}
                     <button
                        onClick={() => setShowRatingReminder(false)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition"
                     >
                        <X size={16} className="text-white" />
                     </button>
                  </div>

                  <div className="p-6 -mt-16 relative z-10">
                     <div className="flex gap-4 mb-4">
                        <img
                           src={getImageUrl(reminderShow.poster_path)}
                           alt={reminderShow.name}
                           className="w-24 h-36 rounded-lg shadow-xl border-2 border-white/20"
                        />
                        <div className="flex-1">
                           <h3 className="text-xl font-black text-white mb-1">{reminderShow.name}</h3>
                           <p className="text-xs text-gray-400 mb-2">{reminderShow.first_air_date?.split('-')[0]} • {reminderShow.number_of_seasons} Seasons</p>
                           <p className="text-sm text-gray-300 line-clamp-2">{reminderShow.overview}</p>
                        </div>
                     </div>

                     <div className="bg-[#14181c] rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-300 mb-3 text-center font-medium">How's it going? Rate your experience!</p>
                        <div className="flex justify-center gap-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                 key={star}
                                 onClick={() => setReminderRating(star)}
                                 className="transition-transform hover:scale-125"
                              >
                                 <Star
                                    size={32}
                                    className={`${reminderRating >= star ? 'text-accentOrange fill-accentOrange' : 'text-gray-600 hover:text-accentOrange'}`}
                                 />
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="flex gap-3">
                        <button
                           onClick={() => setShowRatingReminder(false)}
                           className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm text-white hover:text-accentGreen transition-all duration-200 border border-white/20 hover:border-accentGreen/50 hover:shadow-lg hover:shadow-accentGreen/10"
                        >
                           Maybe Later
                        </button>
                        <button
                           onClick={() => handleReminderRate(reminderRating)}
                           disabled={reminderRating === 0}
                           className="flex-1 py-3 bg-accentGreen hover:bg-accentGreen/80 rounded-xl font-bold text-sm text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           Rate Show
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

const BrowsePage = () => {
   const [shows, setShows] = useState<Show[]>([]);
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [searchParams, setSearchParams] = useSearchParams();

   // Params
   const sort = searchParams.get('sort') || 'popularity.desc';
   const genreParam = searchParams.get('genre') || '';
   const withoutGenresParam = searchParams.get('without_genres') || '';
   const yearParam = searchParams.get('year') || '';
   const statusParam = searchParams.get('status') || '';
   const langParam = searchParams.get('lang') || '';

   const selectedGenres = genreParam ? genreParam.split(',') : [];
   const excludedGenres = withoutGenresParam ? withoutGenresParam.split(',') : [];

   const observer = useRef<IntersectionObserver | null>(null);
   const { t } = useTranslation();

   const lastShowElementRef = useCallback((node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
         if (entries[0].isIntersecting) {
            setPage(prevPage => prevPage + 1);
         }
      });
      if (node) observer.current.observe(node);
   }, [loading]);

   useEffect(() => {
      setShows([]);
      setPage(1);
   }, [sort, genreParam, withoutGenresParam, yearParam, statusParam, langParam]);

   useEffect(() => {
      const loadData = async () => {
         setLoading(true);
         let res: Show[] = [];

         if (sort === 'site_rating') {
            const list = await getCommunityFavoriteIds();
            const ids = list.slice((page - 1) * 20, page * 20).map(x => x.id);
            res = await getShowsByIds(ids);
         } else if (sort === 'site_pop') {
            const list = await getMostWatchlistedIds();
            const ids = list.slice((page - 1) * 20, page * 20).map(x => x.id);
            res = await getShowsByIds(ids);
         } else {
            const minVotes = sort === 'vote_average.desc' ? 300 : undefined;
            res = await getAllCuratedShows(page, sort, genreParam, minVotes, withoutGenresParam, yearParam, statusParam, langParam);
         }

         setShows(prev => [...prev, ...res]);
         setLoading(false);
      };
      loadData();
   }, [page, sort, genreParam, withoutGenresParam, yearParam, statusParam, langParam]);

   const genres = [
      { id: '10759', label: 'Action & Adventure' },
      { id: '16', label: 'Animation' },
      { id: '35', label: 'Comedy' },
      { id: '80', label: 'Crime' },
      { id: '99', label: 'Documentary' },
      { id: '18', label: 'Drama' },
      { id: '10751', label: 'Family' },
      { id: '10762', label: 'Kids' },
      { id: '9648', label: 'Mystery' },
      { id: '10763', label: 'News' },
      { id: '10764', label: 'Reality' },
      { id: '10765', label: 'Sci-Fi & Fantasy' },
      { id: '10766', label: 'Soap' },
      { id: '10767', label: 'Talk' },
      { id: '10768', label: 'War & Politics' },
      { id: '37', label: 'Western' },
   ];

   const toggleGenre = (id: string) => {
      const isSelected = selectedGenres.includes(id);
      const isExcluded = excludedGenres.includes(id);

      let newSelected = [...selectedGenres];
      let newExcluded = [...excludedGenres];

      if (!isSelected && !isExcluded) {
         // State 1 -> 2: Include
         newSelected.push(id);
      } else if (isSelected) {
         // State 2 -> 3: Exclude
         newSelected = newSelected.filter(g => g !== id);
         newExcluded.push(id);
      } else if (isExcluded) {
         // State 3 -> 1: Reset
         newExcluded = newExcluded.filter(g => g !== id);
      }

      setSearchParams({
         sort,
         genre: newSelected.join(','),
         without_genres: newExcluded.join(','),
         year: yearParam,
         status: statusParam,
         lang: langParam
      });
   };

   const getGenreState = (id: string) => {
      if (selectedGenres.includes(id)) return 'selected';
      if (excludedGenres.includes(id)) return 'excluded';
      return 'none';
   };

   const updateFilter = (key: string, value: string) => {
      const newParams: any = {
         sort,
         genre: genreParam,
         without_genres: withoutGenresParam,
         year: yearParam,
         status: statusParam,
         lang: langParam
      };
      newParams[key] = value;
      setSearchParams(newParams);
   };

   return (
      <div className="pt-32 px-6 max-w-[1600px] mx-auto min-h-screen">
         <div className="flex flex-col gap-8 mb-12">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
               <div>
                  <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2">
                     Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentGreen to-emerald-600">Shows</span>
                  </h1>
                  <p className="text-gray-400 text-lg">Find your next obsession among thousands of series.</p>
               </div>

               {/* Sort Dropdown - Modernized */}
               <div className="relative group z-30">
                  <select
                     value={sort}
                     onChange={(e) => setSearchParams({ sort: e.target.value, genre: genreParam })}
                     className="appearance-none bg-[#1f2329] text-white pl-5 pr-12 py-3 rounded-xl border border-white/10 focus:border-accentGreen focus:ring-1 focus:ring-accentGreen outline-none font-medium cursor-pointer hover:bg-[#2a2f38] transition-colors shadow-lg"
                  >
                     <option value="popularity.desc">Most Popular</option>
                     <option value="vote_average.desc">Top Rated</option>
                     <option value="first_air_date.desc">Newest</option>
                     <option value="site_rating">Community Favs</option>
                     <option value="site_pop">Most Watchlisted</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-accentGreen transition-colors" size={20} />
               </div>
            </div>

            {/* Filters Container */}
            <div className="bg-[#14181c]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl space-y-6">

               {/* Advanced Filters Row */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year Filter */}
                  <div className="relative">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Release Year</label>
                     <input
                        type="number"
                        placeholder="Any Year"
                        value={yearParam}
                        onChange={(e) => updateFilter('year', e.target.value)}
                        className="w-full bg-[#0a0c0f] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-accentGreen outline-none transition-colors"
                     />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                     <select
                        value={statusParam}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="w-full bg-[#0a0c0f] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-accentGreen outline-none appearance-none cursor-pointer transition-colors"
                     >
                        <option value="">All Statuses</option>
                        <option value="0">Returning Series</option>
                        <option value="1">Planned</option>
                        <option value="2">In Production</option>
                        <option value="3">Ended</option>
                        <option value="4">Canceled</option>
                        <option value="5">Pilot</option>
                     </select>
                     <ChevronDown className="absolute right-3 bottom-3 text-gray-500 pointer-events-none" size={16} />
                  </div>

                  {/* Language Filter */}
                  <div className="relative">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Language</label>
                     <select
                        value={langParam}
                        onChange={(e) => updateFilter('lang', e.target.value)}
                        className="w-full bg-[#0a0c0f] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-accentGreen outline-none appearance-none cursor-pointer transition-colors"
                     >
                        <option value="">All Languages</option>
                        <option value="en">English</option>
                        <option value="ko">Korean</option>
                        <option value="ja">Japanese</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="tr">Turkish</option>
                     </select>
                     <ChevronDown className="absolute right-3 bottom-3 text-gray-500 pointer-events-none" size={16} />
                  </div>
               </div>

               {/* Genres Grid */}
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Genres (Click to Include, Click again to Exclude)</label>
                  <div className="flex flex-wrap gap-2">
                     {genres.map(g => {
                        const state = getGenreState(g.id);
                        return (
                           <button
                              key={g.id}
                              onClick={() => toggleGenre(g.id)}
                              className={`px - 4 py - 2 rounded - full text - sm font - medium transition - all duration - 300 border ${state === 'selected'
                                 ? 'bg-accentGreen text-black border-accentGreen shadow-[0_0_15px_rgba(0,224,84,0.3)]'
                                 : state === 'excluded'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
                                    : 'bg-[#1f2329] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                                 }`}
                           >
                              {state === 'excluded' && <span className="mr-1">✕</span>}
                              {state === 'selected' && <span className="mr-1">✓</span>}
                              {g.label}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>

         {/* Shows Grid */}
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
            {shows.map((show, i) => {
               if (shows.length === i + 1) {
                  return <div ref={lastShowElementRef} key={show.id} className="animate-in fade-in zoom-in duration-500"><ShowCard show={show} /></div>;
               } else {
                  return <div key={show.id} className="animate-in fade-in zoom-in duration-500"><ShowCard show={show} /></div>;
               }
            })}
         </div>

         {loading && (
            <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentGreen"></div>
            </div>
         )}
      </div>
   );
};

const ReviewDetailPage = () => {
   const { id } = useParams();
   const [review, setReview] = useState<Review | null>(null);
   const [replyContent, setReplyContent] = useState('');
   const [showBackdrop, setShowBackdrop] = useState<string | null>(null);
   const { user } = useContext(AuthContext);
   const navigate = useNavigate();

   useEffect(() => {
      if (id) {
         getReviewById(id).then(r => {
            setReview(r || null);
            if (r) {
               getShowDetails(r.showId).then(s => {
                  if (s) {
                     setShowBackdrop(s.backdrop_path);
                     setReview(prev => prev ? ({ ...prev, showName: s.name, showPoster: s.poster_path }) : null);
                  }
               });
            }
         });
      }
   }, [id]);

   const handleReply = async () => {
      if (!user || !review || !replyContent.trim()) return;
      await replyToReview(review.id, {
         userId: user.id,
         username: user.username,
         avatar: user.avatar,
         content: replyContent
      });
      const updated = await getReviewById(review.id);
      if (updated) {
         // Preserve show details if they were fetched separately
         setReview(prev => prev ? ({ ...updated, showName: prev.showName, showPoster: prev.showPoster }) : updated);
      }
      setReplyContent('');
   };

   const handleDeleteReview = async () => {
      if (review && window.confirm("Delete this review?")) {
         await deleteReview(review.id);
         navigate(`/show/${review.showId}`);
      }
   };

   const handleDeleteReply = async (replyId: string) => {
      if (review && window.confirm("Delete reply?")) {
         await deleteReply(review.id, replyId);
         const updated = await getReviewById(review.id);
         if (updated) {
            setReview(prev => prev ? ({ ...updated, showName: prev.showName, showPoster: prev.showPoster }) : updated);
         }
      }
   };

   if (!review) return <div className="pt-32 text-center">Review not found</div>;
   // Use the rating from the review object itself, which is the rating at the time of review
   const currentRating = review.rating;

   return (
      <div className="min-h-screen bg-[#14181c] relative pb-20">
         {/* Local Fixed Background - Full Screen */}
         {showBackdrop && (
            <div className="fixed inset-0 z-0 pointer-events-none">
               <img src={getImageUrl(showBackdrop, 'original')} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/80 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#14181c]/90 via-[#14181c]/40 to-transparent" />
            </div>
         )}

         <div className="relative z-10 pt-32 max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-10">

               {/* Left Sidebar (Poster) */}
               <div className="w-48 md:w-64 flex-shrink-0">
                  <Link to={`/show/${review.showId}`} className="block aspect-[2/3] rounded-lg shadow-2xl border border-white/20 hover:scale-105 transition transform overflow-hidden bg-[#1f2329] mb-6">
                     <img src={getImageUrl(review.showPoster)} className="w-full h-full object-cover" />
                  </Link>
               </div>

               {/* Right Content */}
               <div className="flex-1 pt-12 p-6 rounded-3xl border border-white/5 bg-[#1f2329]/60 backdrop-blur-sm">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-xl">
                     <Link to={`/show/${review.showId}`} className="hover:text-accentGreen transition text-shadow">{review.showName}</Link>
                  </h1>
                  <div className="flex items-center gap-4 mb-8 drop-shadow-md">
                     <Link to={`/profile/${review.userId}`} className="flex items-center gap-2 group">
                        <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${getAvatarColor(review.username)} flex items-center justify-center text-white font-bold text-xs`}>
                           {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full object-cover" /> : review.username[0]}
                        </div>
                        <span className="font-bold text-white group-hover:text-accentGreen text-shadow">{review.username}</span>
                     </Link>
                     {currentRating > 0 && (
                        <div className="flex items-center gap-1 text-accentOrange font-black text-sm drop-shadow-sm">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < currentRating ? "currentColor" : "none"} className={i < currentRating ? "text-accentOrange" : "text-gray-300"} />
                           ))}
                        </div>
                     )}
                     <span className="text-gray-400 text-xs uppercase font-bold text-shadow">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="bg-[#1f2329] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 mb-10">
                     {user?.id === review.userId && (
                        <button onClick={handleDeleteReview} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"><Trash2 size={18} /></button>
                     )}
                     <div className="text-gray-200 text-lg leading-relaxed font-serif whitespace-pre-line">
                        {review.content}
                     </div>
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                     <button
                        onClick={async () => { if (user) { await likeReview(review.id, user.id); setReview(await getReviewById(review.id) || null); } }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition shadow-md hover:-translate-y-0.5 ${user && review.likes.includes(user.id) ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                     >
                        <Heart size={20} fill={user && review.likes.includes(user.id) ? "currentColor" : "none"} /> {review.likes.length} Likes
                     </button>
                  </div>

                  {/* Replies */}
                  <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                     <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-6">Replies ({review.replies?.length || 0})</h3>
                     {user && (
                        <div className="flex gap-4 mb-8">
                           <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br ${getAvatarColor(user.username)} flex items-center justify-center text-white font-bold`}>{user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0]}</div>
                           <div className="flex-1">
                              <input value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Add a reply..." className="w-full bg-transparent border-b border-white/20 focus:border-accentGreen outline-none text-white pb-2 text-sm transition" />
                              <div className="flex justify-end mt-2"><Button onClick={handleReply} variant="secondary" className="!py-1.5 !px-4 !text-xs font-bold">Reply</Button></div>
                           </div>
                        </div>
                     )}
                     <div className="space-y-6">
                        {review.replies?.map(rep => (
                           <div key={rep.id} className="flex gap-4">
                              <Link to={`/profile/${rep.userId}`} className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br ${getAvatarColor(rep.username)} flex items-center justify-center text-white font-bold`}>{rep.avatar ? <img src={rep.avatar} className="w-full h-full object-cover" /> : rep.username[0]}</Link>
                              <div className="flex-1">
                                 <div className="flex justify-between items-baseline mb-1">
                                    <Link to={`/profile/${rep.userId}`} className="font-bold text-white text-sm hover:text-accentGreen">{rep.username}</Link>
                                    {user?.id === rep.userId && <button onClick={() => handleDeleteReply(rep.id)} className="text-gray-600 hover:text-red-500 transition"><X size={14} /></button>}
                                 </div>
                                 <p className="text-gray-300 text-sm leading-relaxed">{rep.content}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div >
   );
};

const ListDetailPage = () => {
   const { id } = useParams();
   const [list, setList] = useState<UserList | null>(null);
   const [newComment, setNewComment] = useState('');
   const { user } = useContext(AuthContext);

   useEffect(() => {
      if (id) {
         getListById(id).then(setList);
      }
   }, [id]);

   const handleComment = async () => {
      if (!user || !list || !newComment.trim()) return;
      await addCommentToList(list.id, {
         userId: user.id,
         username: user.username,
         avatar: user.avatar,
         content: newComment
      });
      setList(await getListById(list.id));
      setNewComment('');
   };

   if (!list) return <div className="pt-32 text-center">List not found</div>;

   return (
      <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen">
         <div className="mb-12 text-center">
            <h1 className="text-5xl font-black text-white mb-4">{list.name}</h1>
            {list.description && <p className="text-xl text-gray-400 italic max-w-2xl mx-auto">"{list.description}"</p>}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm font-bold uppercase tracking-widest text-gray-500">
               <span>Curated by <span className="text-white">{list.username}</span></span>
               <span>• {list.items.length} Shows</span>
               <button onClick={async () => { if (user) { await likeList(list.id, user.id); setList(await getListById(list.id)); } }} className="flex items-center gap-2 hover:text-accentGreen transition">
                  <Heart fill={user && list.likes?.includes(user.id) ? "currentColor" : "none"} className={user && list.likes?.includes(user.id) ? "text-red-500" : ""} /> {list.likes?.length || 0}
               </button>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-16">
            {list.items.map(item => (
               <ShowCard key={item.id} show={item} />
            ))}
         </div>

         <div className="max-w-2xl mx-auto border-t border-white/10 pt-10">
            <h3 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-6">Discussion</h3>
            {user && (
               <div className="flex gap-4 mb-8">
                  <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${getAvatarColor(user.username)} flex items-center justify-center text-white font-bold text-xs`}>{user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0]}</div>
                  <div className="flex-1">
                     <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Leave a comment..." className="w-full bg-transparent border-b border-white/20 focus:border-accentGreen outline-none text-white pb-2" />
                     <div className="flex justify-end mt-2"><Button onClick={handleComment} variant="secondary" className="!py-1 !px-3 !text-xs">Post</Button></div>
                  </div>
               </div>
            )}
            <div className="space-y-4">
               {list.comments?.map(c => (
                  <div key={c.id} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                     <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br ${getAvatarColor(c.username)} flex items-center justify-center text-white font-bold text-xs`}>{c.avatar ? <img src={c.avatar} className="w-full h-full object-cover" /> : c.username[0]}</div>
                     <div>
                        <div className="font-bold text-white text-sm">{c.username}</div>
                        <div className="text-gray-400 text-sm">{c.content}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
};

const Profile = () => {
   const { userId } = useParams();
   const { user: currentUser, refreshUser, handleLogout } = useContext(AuthContext);
   const { setBackground } = useContext(BackgroundContext);
   const [activeTab, setActiveTab] = useState<'overview' | 'watchlist' | 'ratings' | 'lists'>('overview');
   const [showEditProfile, setShowEditProfile] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
   const [showFavSearchModal, setShowFavSearchModal] = useState(false);
   const [showCreateListModal, setShowCreateListModal] = useState(false);
   const [newListName, setNewListName] = useState('');
   const [newListDesc, setNewListDesc] = useState('');
   const [profileUser, setProfileUser] = useState<User | null>(null);

   const [editBio, setEditBio] = useState('');
   const [editAvatar, setEditAvatar] = useState('');
   const [editTheme, setEditTheme] = useState('');
   const [editUsername, setEditUsername] = useState('');
   const [avatarFile, setAvatarFile] = useState<File | null>(null);
   const [favSearch, setFavSearch] = useState('');
   const [favResults, setFavResults] = useState<Show[]>([]);
   const [reviews, setReviews] = useState<Review[]>([]);

   const [editEmail, setEditEmail] = useState('');

   const [currentPass, setCurrentPass] = useState('');
   const [newPass, setNewPass] = useState('');
   const [confirmPass, setConfirmPass] = useState('');

   const [notifEnabled, setNotifEnabled] = useState(true);

   const { language, setLanguage, t } = useTranslation();
   const navigate = useNavigate();

   const [isOwnProfile, setIsOwnProfile] = useState(false);

   const themes = [
      { name: 'Dexter', url: 'https://image.tmdb.org/t/p/original/fIKc2cR1GglarzChMAb4BOP1qHP.jpg' },
      { name: 'The Boys', url: 'https://image.tmdb.org/t/p/original/7cqKGQMnNabzOpi7qaIgZvQ7NGV.jpg' },
      { name: 'Succession', url: 'https://image.tmdb.org/t/p/original/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg' },
      { name: 'Severance', url: 'https://image.tmdb.org/t/p/original/npD65vPa4vvn1ZHpp3o05A5vdKT.jpg' },
      { name: 'Arcane', url: 'https://image.tmdb.org/t/p/original/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg' },
      { name: 'Breaking Bad', url: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg' }
   ];

   useEffect(() => {
      const loadUser = async () => {
         let targetUser = currentUser;
         if (userId) {
            const found = await getUserById(userId);
            if (found) targetUser = found;
         } else if (!currentUser) {
            navigate('/login');
            return;
         }

         if (targetUser) {
            setProfileUser(targetUser);
            const userReviews = await getReviewsByUserId(targetUser.id);
            setReviews(userReviews);

            // Set Background
            setBackground(targetUser.backgroundTheme || null);

            // Determine Ownership
            const isOwn = currentUser ? currentUser.id === targetUser.id : false;
            setIsOwnProfile(isOwn);

            if (isOwn) {
               setEditBio(targetUser.bio || '');
               setEditAvatar(targetUser.avatar || '');
               setEditTheme(targetUser.backgroundTheme || '');
               setEditEmail(targetUser.email || '');
               setEditUsername(targetUser.username || '');
               setNotifEnabled(targetUser.settings.notificationsEnabled !== false);
               if (targetUser.settings.language) setLanguage(targetUser.settings.language);
            }
         }
      };
      loadUser();

      return () => setBackground(null);
   }, [userId, currentUser, navigate, setLanguage, setBackground]);

   const saveProfile = async () => {
      if (profileUser) {
         try {
            let avatarUrl = editAvatar;

            // Upload avatar file if selected
            if (avatarFile) {
               const uploadedUrl = await uploadAvatar(avatarFile);
               if (uploadedUrl) {
                  avatarUrl = uploadedUrl;
               }
            }

            await updateUser({ ...profileUser, username: editUsername, bio: editBio, avatar: avatarUrl, backgroundTheme: editTheme });
            await refreshUser();
            setShowEditProfile(false);
            setBackground(editTheme);
            setAvatarFile(null);
         } catch (e: any) {
            console.error("Profile update error:", e);
            alert("Error updating profile: " + e.message + "\n\nDid you run the setup_db.sql script?");
         }
      }
   };

   const handleCreateList = async () => {
      if (newListName.trim()) {
         await createList(newListName, newListDesc, false);
         await refreshUser();
         setShowCreateListModal(false);
         setNewListName('');
         setNewListDesc('');
      }
   };

   const saveSettings = async () => {
      if (profileUser) {
         let updatedUser = { ...profileUser };
         let emailChanged = false;
         if (editEmail !== profileUser.email) {
            if (window.confirm("Are you sure you want to change your email?")) {
               updatedUser.email = editEmail;
               emailChanged = true;
            } else {
               setEditEmail(profileUser.email);
            }
         }

         if (newPass) {
            if (currentPass !== profileUser.password) {
               alert("Incorrect current password");
               return;
            }
            if (newPass !== confirmPass) {
               alert("New passwords do not match");
               return;
            }
            updatedUser.password = newPass;
         }

         updatedUser.settings = {
            ...profileUser.settings,
            notificationsEnabled: notifEnabled,
            language: language
         };

         try {
            await updateUser(updatedUser);
            await refreshUser();
            setShowSettings(false);
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
            if (emailChanged) {
               alert("Email updated! Please check your new email for a confirmation link.");
            }
         } catch (e: any) {
            alert("Error updating settings: " + e.message);
         }
      }
   };

   const searchFavs = async (q: string) => {
      setFavSearch(q);
      if (q.length > 2) {
         const res = await searchShows(q);
         setFavResults(res.slice(0, 5));
      } else {
         setFavResults([]);
      }
   };

   const addTopFav = async (show: Show) => {
      if (profileUser) {
         const current = profileUser.topFavorites;
         let newFavs = [...current];
         if (newFavs.length < 3 && !newFavs.find(s => s.id === show.id)) {
            newFavs.push(show);
         }
         await updateTopFavorites(newFavs);
         await refreshUser();
         setProfileUser({ ...profileUser, topFavorites: newFavs });
         setShowFavSearchModal(false);
         setFavSearch(''); setFavResults([]);
      }
   };

   const removeFav = async (id: number) => {
      if (profileUser) {
         const newFavs = profileUser.topFavorites.filter(s => s.id !== id);
         await updateTopFavorites(newFavs);
         await refreshUser();
         setProfileUser({ ...profileUser, topFavorites: newFavs });
      }
   };

   if (!profileUser) return null;

   const populatedWatchlist = profileUser.watchlist;
   const ratedShowIds = Object.keys(profileUser.ratings).map(Number);
   // Reviews are now in state
   const recentRated = ratedShowIds.slice(-4).reverse();

   return (
      <div className="pt-32 px-6 max-w-6xl mx-auto min-h-screen relative z-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-accentGreen/20 bg-[#1f2329] shadow-2xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${getAvatarColor(profileUser.username)}`}>
               {profileUser.avatar ? <img src={profileUser.avatar} className="w-full h-full object-cover" /> : (
                  <div className="text-5xl font-black text-white">
                     {profileUser.username.charAt(0).toUpperCase()}
                  </div>
               )}
            </div>
            <div className="flex-1 mb-2">

               <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg text-shadow">{profileUser.username}</h1>
               <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={12} /> Member since {new Date(profileUser.joinedAt).toLocaleDateString()}
               </div>
               {profileUser.bio && <p className="text-gray-300 text-lg font-medium max-w-2xl text-shadow">{profileUser.bio}</p>}
            </div>
            {isOwnProfile && (
               <div className="flex gap-3 mb-4">
                  <Button variant="secondary" onClick={() => setShowEditProfile(true)}><Edit2 size={16} /> {t('editProfile')}</Button>
                  <Button variant="secondary" onClick={() => setShowSettings(true)}><Settings size={16} /></Button>
                  <Button variant="danger" onClick={handleLogout}><LogOut size={16} /></Button>
               </div>
            )}
         </div>

         {/* Modern Tab Navigation */}
         <div className="flex flex-wrap gap-3 mb-10 pb-6">
            {[
               { id: 'overview', label: t('overview'), count: null, icon: <Eye size={18} /> },
               { id: 'watchlist', label: t('watching'), count: profileUser.watchlist.length, icon: <PlayCircle size={18} /> },
               { id: 'ratings', label: t('ratedShows'), count: Object.keys(profileUser.ratings).length, icon: <Star size={18} /> },
               { id: 'lists', label: t('lists'), count: profileUser.lists.length, icon: <List size={18} /> },
               { id: 'reviews', label: t('reviews'), count: reviews.length, icon: <MessageSquare size={18} /> },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group relative px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-200 ${activeTab === tab.id
                     ? 'bg-accentGreen text-black shadow-xl shadow-accentGreen/40 scale-105'
                     : 'bg-gradient-to-br from-white/10 to-white/5 text-gray-200 border border-white/20 hover:border-accentGreen/60 hover:from-white/15 hover:to-white/10 hover:text-white hover:shadow-lg'
                     }`}
               >
                  <div className="flex items-center gap-2">
                     <span className={activeTab === tab.id ? 'text-black' : 'text-gray-400 group-hover:text-accentGreen'}>
                        {tab.icon}
                     </span>
                     <span>{tab.label}</span>
                     {tab.count !== null && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${activeTab === tab.id
                           ? 'bg-black/20 text-black'
                           : 'bg-white/20 text-gray-200 group-hover:bg-accentGreen/20 group-hover:text-accentGreen'
                           }`}>
                           {tab.count}
                        </span>
                     )}
                  </div>
               </button>
            ))}
         </div>

         <div className="animate-fade-in-up">
            {activeTab === 'overview' && (
               <div className="space-y-12">
                  {/* Top Favorites */}
                  <section>
                     <h2 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-6 text-shadow">{t('topFavorites')}</h2>
                     <div className="grid grid-cols-3 gap-6">
                        {[0, 1, 2].map(i => {
                           const show = profileUser.topFavorites[i];
                           return (
                              <div key={i} onClick={() => isOwnProfile && setShowFavSearchModal(true)} className={`aspect-[2/3] bg-[#1f2329] rounded-xl border border-white/10 overflow-hidden relative group ${isOwnProfile ? 'cursor-pointer hover:border-accentGreen/50' : ''}`}>
                                 {show ? (
                                    <>
                                       <img src={getImageUrl(show.poster_path)} className="w-full h-full object-cover" />
                                       {isOwnProfile && (
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                             <Button variant="danger" onClick={async (e: any) => { e.stopPropagation(); await removeFav(show.id); }}>Remove</Button>
                                          </div>
                                       )}
                                    </>
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                       {isOwnProfile ? <Plus size={40} className="opacity-50 group-hover:opacity-100 transition" /> : <span className="text-xs font-bold uppercase opacity-30">Empty</span>}
                                    </div>
                                 )}
                              </div>
                           )
                        })}
                     </div>
                  </section>

                  {/* Recently Rated */}
                  {recentRated.length > 0 && (
                     <section>
                        <h2 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-6 text-shadow">{t('recentlyRated')}</h2>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                           {recentRated.map(id => <RatedShowCard key={id} id={id} rating={profileUser.ratings[id]} />)}
                        </div>
                     </section>
                  )}

                  {/* Recent Reviews */}
                  {reviews.length > 0 && (
                     <section>
                        <h2 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-6 text-shadow">Recent Reviews</h2>
                        <div className="grid gap-4">
                           {reviews.slice(0, 3).map(r => (
                              <Link
                                 to={`/review/${r.id}`}
                                 key={r.id}
                                 className="bg-[#1f2329] hover:bg-[#252a32] p-4 md:p-6 rounded-xl border border-white/5 hover:border-accentGreen/30 transition-all group"
                              >
                                 <div className="flex gap-4 md:gap-6">
                                    <div className="w-12 h-18 md:w-16 md:h-24 flex-shrink-0 rounded bg-gray-800 overflow-hidden shadow-lg">
                                       <img src={getImageUrl(r.showPoster)} className="w-full h-full object-cover" alt={r.showName} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-2 mb-2">
                                          <div className="font-bold text-white group-hover:text-accentGreen transition-colors truncate text-sm md:text-base">{r.showName}</div>
                                          <div className="flex items-center gap-1 text-accentOrange text-xs flex-shrink-0">
                                             <Star size={10} fill="currentColor" /> {r.rating}
                                          </div>
                                       </div>
                                       <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-2">{r.content}</p>
                                       <div className="text-[10px] md:text-xs font-bold text-gray-500 group-hover:text-accentGreen uppercase tracking-wider transition-colors">Read More →</div>
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </section>
                  )}

               </div>
            )}

            {activeTab === 'lists' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileUser.lists.map(l => (
                     <Link to={`/list/${l.id}`} key={l.id} className="bg-[#1f2329] p-6 rounded-xl border border-white/5 hover:border-accentGreen/30 transition group">
                        <h3 className="font-bold text-white text-lg group-hover:text-accentGreen">{l.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-1">{l.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-600">
                           <span>{l.items.length} Shows</span>
                           <span>{l.likes.length} Likes</span>
                        </div>
                     </Link>
                  ))}
                  {isOwnProfile && (
                     <button onClick={() => setShowCreateListModal(true)} className="bg-transparent border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:border-accentGreen/50 transition h-32">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-widest"><Plus /> {t('createList')}</div>
                     </button>
                  )}
               </div>
            )}

            {activeTab === 'ratings' && (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {ratedShowIds.map(id => (
                     <RatedShowCard key={id} id={id} rating={profileUser.ratings[id]} />
                  ))}
               </div>
            )}

            {activeTab === 'watchlist' && (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {populatedWatchlist.filter(item => item && item.showId && !isNaN(item.showId)).map(item => (
                     <SimpleShowCard key={item.showId} id={item.showId} />
                  ))}
                  {populatedWatchlist.filter(item => item && item.showId && !isNaN(item.showId)).length === 0 && (
                     <div className="col-span-full text-center text-gray-500 py-12">No shows in watchlist yet.</div>
                  )}
               </div>
            )}

            {activeTab === 'reviews' && (
               <div className="grid gap-6">
                  {reviews.length > 0 ? reviews.map(r => (
                     <Link
                        to={`/review/${r.id}`}
                        key={r.id}
                        className="bg-gradient-to-br from-[#1f2329] to-[#14181c] p-6 rounded-2xl border border-white/5 hover:border-accentGreen/30 transition-all duration-300 group shadow-lg hover:shadow-accentGreen/10"
                     >
                        <div className="flex gap-6">
                           {/* Show Poster */}
                           <div className="w-24 md:w-32 flex-shrink-0">
                              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-xl group-hover:scale-105 transition-transform duration-300">
                                 <img src={getImageUrl(r.showPoster)} className="w-full h-full object-cover" alt={r.showName} />
                              </div>
                           </div>

                           {/* Review Content */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                 <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-accentGreen transition-colors mb-1">{r.showName}</h3>
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                       {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-accentOrange/10 px-3 py-1.5 rounded-full border border-accentOrange/20">
                                    <Star size={14} className="text-accentOrange fill-accentOrange" />
                                    <span className="text-sm font-black text-accentOrange">{r.rating}</span>
                                 </div>
                              </div>

                              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-3">{r.content}</p>

                              <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                                 <span className="flex items-center gap-1"><Heart size={12} /> {r.likes.length}</span>
                                 <span className="flex items-center gap-1"><MessageSquare size={12} /> {r.replies.length}</span>
                                 <span className="ml-auto text-accentGreen group-hover:underline">View Full Review →</span>
                              </div>
                           </div>
                        </div>
                     </Link>
                  )) : (
                     <div className="col-span-full text-center text-gray-500 py-12">No reviews yet.</div>
                  )}
               </div>
            )}
         </div>

         {/* Modals */}
         {showEditProfile && (
            <Modal title={t('editProfile')} onClose={() => setShowEditProfile(false)}>
               <div className="space-y-6">
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('username')}</label>
                     <Input value={editUsername} onChange={(e: any) => setEditUsername(e.target.value)} placeholder="Username" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">Avatar</label>
                     <div className="space-y-3">
                        {(avatarFile || editAvatar) && (
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
                                 <img
                                    src={avatarFile ? URL.createObjectURL(avatarFile) : editAvatar}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                              <button
                                 onClick={() => { setAvatarFile(null); setEditAvatar(''); }}
                                 className="text-xs text-red-500 font-bold hover:underline"
                              >
                                 Remove
                              </button>
                           </div>
                        )}
                        <input
                           type="file"
                           accept="image/*"
                           onChange={(e) => e.target.files?.[0] && setAvatarFile(e.target.files[0])}
                           className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-accentGreen file:text-black hover:file:bg-accentGreen/80 cursor-pointer"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('bio')}</label>
                     <Input value={editBio} onChange={(e: any) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." />
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('theme')}</label>
                     <div className="grid grid-cols-2 gap-3 mb-2">
                        {themes.map(th => (
                           <button key={th.name} onClick={() => setEditTheme(th.url)} className={`relative aspect-video rounded overflow-hidden border transition group ${editTheme === th.url ? 'border-accentGreen ring-2 ring-accentGreen/50' : 'border-white/20 hover:border-accentGreen'}`}>
                              <img src={th.url} className="w-full h-full object-cover group-hover:opacity-100" />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] font-bold text-white p-1 text-center">{th.name}</span>
                           </button>
                        ))}
                     </div>
                     <button onClick={() => setEditTheme('')} className="mt-2 w-full py-2 text-xs text-red-500 font-bold uppercase tracking-wide border border-red-500/20 hover:bg-red-500/10 rounded">{t('resetTheme')}</button>
                  </div>
                  <Button onClick={saveProfile} className="w-full">{t('saveChanges')}</Button>
               </div>
            </Modal>
         )}

         {showCreateListModal && (
            <Modal title={t('createList')} onClose={() => setShowCreateListModal(false)}>
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('listName')}</label>
                     <Input value={newListName} onChange={(e: any) => setNewListName(e.target.value)} placeholder="My Favorites..." />
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('desc')}</label>
                     <Input value={newListDesc} onChange={(e: any) => setNewListDesc(e.target.value)} placeholder="Optional description..." />
                  </div>
                  <Button onClick={handleCreateList} className="w-full">Create</Button>
               </div>
            </Modal>
         )}

         {showSettings && (
            <Modal title={t('settings')} onClose={() => setShowSettings(false)}>
               <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('language')}</label>
                     <div className="flex gap-2">
                        <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded font-bold text-xs transition ${language === 'en' ? 'bg-accentGreen text-black' : 'bg-white/5 text-gray-400'}`}>English</button>
                        <button onClick={() => setLanguage('tr')} className={`flex-1 py-2 rounded font-bold text-xs transition ${language === 'tr' ? 'bg-accentGreen text-black' : 'bg-white/5 text-gray-400'}`}>Türkçe</button>
                     </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">{t('emailAddr')}</label>
                     <Input value={editEmail} onChange={(e: any) => setEditEmail(e.target.value)} />
                  </div>
                  <div className="border-t border-white/10 pt-4">
                     <label className="block text-xs font-bold uppercase text-gray-500 tracking-widest mb-2">Change Password</label>
                     <Input type="password" value={currentPass} onChange={(e: any) => setCurrentPass(e.target.value)} placeholder="Current Password" className="mb-2" />
                     <Input type="password" value={newPass} onChange={(e: any) => setNewPass(e.target.value)} placeholder="New Password" />
                     <Input type="password" value={confirmPass} onChange={(e: any) => setConfirmPass(e.target.value)} placeholder="Confirm New Password" />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                     <div>
                        <span className="block text-sm font-bold text-white">{t('notificationsActive')}</span>
                        <span className="text-[10px] text-gray-500">Get emails when new episodes air.</span>
                     </div>
                     <button onClick={() => setNotifEnabled(!notifEnabled)} className={`w-10 h-6 rounded-full p-1 transition ${notifEnabled ? 'bg-accentGreen' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition transform ${notifEnabled ? 'translate-x-4' : ''}`} />
                     </button>
                  </div>
                  <Button onClick={saveSettings} className="w-full">{t('saveChanges')}</Button>
               </div>
            </Modal>
         )}

         {showFavSearchModal && (
            <Modal title="Add Favorite" onClose={() => setShowFavSearchModal(false)}>
               <Input value={favSearch} onChange={(e: any) => searchFavs(e.target.value)} placeholder="Search shows..." autoFocus />
               <div className="mt-4 space-y-2">
                  {favResults.map(s => (
                     <button key={s.id} onClick={() => addTopFav(s)} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded transition">
                        <img src={getImageUrl(s.poster_path)} className="w-8 h-12 object-cover rounded bg-gray-800" />
                        <span className="font-bold text-white text-sm">{s.name}</span>
                     </button>
                  ))}
               </div>
            </Modal>
         )}
      </div>
   );
};

const ShowPage = () => {
   const { id } = useParams();
   const { user, refreshUser } = useContext(AuthContext);
   const { setBackground } = useContext(BackgroundContext);
   const [show, setShow] = useState<ShowDetails | null>(null);
   const [userRating, setUserRating] = useState(0);
   const [reviewContent, setReviewContent] = useState('');
   const [reviews, setReviews] = useState<Review[]>([]);
   const [showListModal, setShowListModal] = useState(false);
   const { t } = useTranslation();
   const navigate = useNavigate();

   const isInWatchlist = user?.watchlist.some(w => w.showId === (show?.id || 0));

   useEffect(() => {
      // Disable global background for this page to manage layout manually
      setBackground(null);

      if (id) {
         getShowDetails(parseInt(id)).then(data => {
            setShow(data);
            // Local background management via the render
         });
         getReviewsByShowId(parseInt(id)).then(setReviews);
      }
      return () => setBackground(null);
   }, [id, setBackground]);

   useEffect(() => {
      if (user && id) {
         setUserRating(user.ratings[parseInt(id)] || 0);
      }
   }, [user, id]);

   const handleRate = async (r: number) => {
      if (!user) return navigate('/login');
      await rateShow(parseInt(id!), r);
      setUserRating(r);
      refreshUser();
   };

   const handleWatchlistToggle = async () => {
      if (!user) return navigate('/login');
      if (!show) return;

      if (isInWatchlist) {
         await removeFromWatchlist(show.id);
      } else {
         await addToWatchlist(show.id);
      }
      refreshUser();
   };

   const handleReview = async () => {
      if (!user) return navigate('/login');
      if (!reviewContent.trim()) return;

      await addReview({
         showId: parseInt(id!),
         showName: show!.name,
         showPoster: show!.poster_path,
         userId: user.id,
         username: user.username,
         userAvatar: user.avatar,
         content: reviewContent,
         rating: userRating
      });
      setReviews(await getReviewsByShowId(parseInt(id!)));
      setReviewContent('');
   };

   if (!show) return <div className="pt-32 text-center">Loading...</div>;

   // Calculate site average from reviews or a separate function if needed. 
   // For now, we can't easily get all members synchronously. 
   // We'll skip siteAvg for now or fetch it async.
   // Ideally we should have a getShowStats function.
   // For this refactor, I will comment out the synchronous calculation.
   const siteAvg = 'N/A';
   /* 
   const allMembers = getAllMembers();
   let siteTotal = 0;
   let siteCount = 0;
   allMembers.forEach(m => {
      if (m.ratings[show.id]) {
         siteTotal += m.ratings[show.id];
         siteCount++;
      }
   });
   const siteAvg = siteCount > 0 ? (siteTotal / siteCount).toFixed(1) : 'N/A';
   */

   return (
      <div className="min-h-screen bg-[#14181c] relative">
         {/* Local Fixed Background to ensure visibility behind UI as requested */}
         {show?.backdrop_path && (
            <div className="fixed inset-0 z-0 pointer-events-none">
               <img src={getImageUrl(show.backdrop_path, 'original')} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-[#14181c]/80 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#14181c]/90 via-[#14181c]/40 to-transparent" />
            </div>
         )}

         {/* Main Content */}
         <div className="relative z-10 pt-32 max-w-7xl mx-auto px-6 pb-20">
            <div className="grid md:grid-cols-12 gap-12">

               {/* Sidebar (Poster & Actions) - Left on Desktop */}
               <div className="md:col-span-3 space-y-6 order-first md:order-none">
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] relative group hover:scale-[1.02] transition-transform duration-500">
                     <img src={getImageUrl(show.poster_path)} className="w-full h-full object-cover" />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                     <button
                        onClick={handleWatchlistToggle}
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-300 ${isInWatchlist ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                     >
                        {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isInWatchlist ? 'Added' : 'Track'}</span>
                     </button>
                     <button
                        onClick={() => user ? setShowListModal(true) : navigate('/login')}
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                     >
                        <List size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">List</span>
                     </button>
                  </div>

                  {/* Rating Card */}
                  <div className="bg-[#1f2329]/80 backdrop-blur-md p-5 rounded-xl border border-white/10 text-center">
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Rating</div>
                     <div className="flex justify-center mb-2">
                        <StarRating rating={userRating} onRate={handleRate} size={24} />
                     </div>
                     <div className="text-sm font-medium text-gray-300">{userRating > 0 ? `${userRating}/5` : 'Rate this show'}</div>
                  </div>

                  {/* Watch Providers */}
                  <div className="bg-[#1f2329]/80 backdrop-blur-md p-5 rounded-xl border border-white/10">
                     <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Where to Watch</div>
                     <div className="space-y-2">
                        <div className="text-xs text-gray-400 text-center mb-3">Available on popular platforms:</div>
                        <div className="flex flex-wrap justify-center gap-2 mb-3">
                           <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">Netflix</span>
                           <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">Prime Video</span>
                           <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">Disney+</span>
                           <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-300">Hulu</span>
                        </div>
                        <a
                           href={`https://www.justwatch.com/us/tv-show/${show.name.toLowerCase().replace(/ /g, '-')}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 text-xs font-bold text-accentGreen hover:text-white transition-colors group py-2 px-3 bg-accentGreen/5 hover:bg-accentGreen/10 rounded-lg"
                        >
                           <Globe size={14} className="group-hover:rotate-12 transition-transform" />
                           Check Availability on JustWatch
                        </a>
                     </div>
                  </div>
               </div>

               {/* Main Info (Right) */}
               <div className="md:col-span-9">
                  {/* Header Info */}
                  <div className="mb-8">
                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 drop-shadow-2xl text-shadow-lg">{show.name}</h1>

                     <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                           <Star className="text-accentOrange fill-accentOrange" size={16} />
                           <span className="text-white">{show.vote_average?.toFixed(1)}</span>
                           <span className="text-gray-500 text-xs">TMDB</span>
                        </div>
                        <span>{show.first_air_date?.split('-')[0]}</span>
                        <span>{show.number_of_seasons} Seasons</span>
                        {show.next_episode_to_air ? (
                           <span className="text-accentGreen flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accentGreen animate-pulse" /> Airing</span>
                        ) : (
                           <span className="text-gray-500">Ended</span>
                        )}
                     </div>
                  </div>

                  <div className="text-xl text-gray-200 leading-relaxed font-medium mb-12 max-w-4xl drop-shadow-md">
                     {show.overview}
                  </div>

                  {/* Cast */}
                  <div className="mb-12">
                     <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                        <Users size={14} /> Top Cast
                     </h3>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mask-linear-fade">
                        {show.cast?.slice(0, 10).map((c, i) => (
                           <div key={i} className="flex-shrink-0 w-28 group">
                              <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden mb-3 shadow-lg border-2 border-white/10 group-hover:border-accentGreen transition-colors">
                                 {c.person.image ? (
                                    <img src={c.person.image.medium} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-500"><UserIcon size={32} /></div>
                                 )}
                              </div>
                              <div className="text-xs font-bold text-white truncate text-center px-1">{c.person.name}</div>
                              <div className="text-[10px] text-gray-400 truncate text-center px-1">{c.character.name}</div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Reviews Section */}
                  <div>
                     <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-6 flex justify-between items-center text-shadow">
                        {t('reviews')} <span className="text-white">{reviews.length}</span>
                     </h3>

                     {user && (
                        <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-8">
                           <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-4">{t('writeReview')}</h3>
                           <textarea
                              value={reviewContent}
                              onChange={e => setReviewContent(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-accentGreen min-h-[80px] resize-none mb-4 text-sm"
                              placeholder="Share your thoughts..."
                           />
                           <div className="flex justify-end">
                              <Button onClick={handleReview} className="!py-2 !px-6 !text-xs">{t('postReview')}</Button>
                           </div>
                        </div>
                     )}

                     <div className="space-y-4">
                        {reviews.map(r => {
                           const ratingAtTime = r.rating;
                           return (
                              <Link to={`/review/${r.id}`} key={r.id} className="block bg-transparent border-b border-white/10 pb-6 pt-2 hover:bg-white/5 transition rounded px-2 -mx-2">
                                 <div className="flex items-start gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${getAvatarColor(r.username)} flex items-center justify-center text-white font-bold text-xs`}>{r.userAvatar ? <img src={r.userAvatar} className="w-full h-full object-cover" /> : r.username[0]}</div>
                                    <div>
                                       <div className="font-bold text-white text-sm flex items-center gap-2 text-shadow">
                                          {r.username}
                                          {ratingAtTime > 0 && <div className="flex items-center text-accentOrange text-xs"><Star size={10} fill="currentColor" /> {ratingAtTime}</div>}
                                       </div>
                                       <div className="text-gray-500 text-[10px] font-bold uppercase">{new Date(r.createdAt).toLocaleDateString()}</div>
                                    </div>
                                 </div>
                                 <p className="text-gray-300 text-sm line-clamp-3 pl-11 text-shadow">{r.content}</p>
                                 <div className="pl-11 mt-2 flex items-center gap-4 text-xs font-bold text-gray-600">
                                    <span className="flex items-center gap-1"><Heart size={12} /> {r.likes.length}</span>
                                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {r.replies.length}</span>
                                 </div>
                              </Link>
                           )
                        })}
                        {reviews.length === 0 && <div className="text-gray-500 text-sm italic">No reviews yet. Be the first!</div>}
                     </div>
                  </div>
               </div>

            </div>
         </div>

         {/* Add To List Modal */}
         {showListModal && user && (
            <Modal title="Add to List" onClose={() => setShowListModal(false)}>
               {user.lists.length === 0 ? (
                  <div className="text-center py-4">
                     <p className="text-gray-400 mb-4">You haven't created any lists yet.</p>
                     <Link to="/profile" className="text-accentGreen font-bold hover:underline">Go to Profile to create one.</Link>
                  </div>
               ) : (
                  <div className="space-y-2">
                     {user.lists.map(l => (
                        <button
                           key={l.id}
                           onClick={async () => { await addShowToList(l.id, show!); setShowListModal(false); alert(`Added to ${l.name}`); }}
                           className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded border border-white/5 flex justify-between items-center group"
                        >
                           <span className="font-bold text-white group-hover:text-accentGreen">{l.name}</span>
                           <span className="text-xs text-gray-500">{l.items.length} shows</span>
                        </button>
                     ))}
                  </div>
               )}
            </Modal>
         )}
      </div>
   );
};

const Tracking = () => {
   const { user } = useContext(AuthContext);
   const [shows, setShows] = useState<ShowDetails[]>([]);
   const { t } = useTranslation();

   useEffect(() => {
      if (user) {
         const load = async () => {
            const details = await getShowsByIds(user.watchlist.map(w => w.showId));
            setShows(details as any);
         };
         load();
      }
   }, [user]);

   if (!user || shows.length === 0) return (
      <div className="pt-40 text-center px-6 flex flex-col items-center">
         <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-gray-600"><EyeOff size={40} /></div>
         <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Your List is Empty</h2>
         <p className="text-gray-500 mb-8">Start tracking shows to receive notifications.</p>
         <Link to="/browse"><Button variant="primary">{t('discoverShows')}</Button></Link>
      </div>
   );

   return (
      <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
         <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
            <div>
               <h1 className="text-5xl font-black text-white uppercase tracking-tighter text-glow mb-2">{t('myWatchlist')}</h1>
               <div className="flex items-center gap-2 text-accentGreen text-xs font-bold uppercase tracking-widest bg-accentGreen/10 px-3 py-1 rounded-full inline-flex">
                  <Bell size={12} /> Email Notifications Active
               </div>
            </div>
            <div className="text-right hidden md:block">
               <div className="text-3xl font-black text-white">{shows.length}</div>
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Shows</div>
            </div>
         </div>

         <div className="grid gap-4">
            {shows.map(s => (
               <div key={s.id} className="bg-[#1f2329] p-4 rounded-xl border border-white/5 flex gap-6 items-center group hover:border-accentGreen/30 transition">
                  <Link to={`/show/${s.id}`} className="w-16 h-24 flex-shrink-0 rounded bg-gray-800 overflow-hidden shadow-lg"><img src={getImageUrl(s.poster_path)} className="w-full h-full object-cover" /></Link>
                  <div className="flex-1 min-w-0">
                     <Link to={`/show/${s.id}`} className="text-xl font-black text-white truncate block hover:text-accentGreen">{s.name}</Link>
                     <div className="flex items-center gap-4 mt-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>S{s.number_of_seasons || '?'}</span>
                        <span>{s.next_episode_to_air ? <span className="text-blue-400">Next: {s.next_episode_to_air.air_date}</span> : <span className="text-gray-600">Ended</span>}</span>
                     </div>
                     {s.next_episode_to_air && (
                        <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-1/2 animate-pulse"></div>
                        </div>
                     )}
                  </div>
                  <div className="hidden md:block">
                     <Link to={`/show/${s.id}`}><Button variant="secondary" className="!py-2 !px-4 !text-xs">Details</Button></Link>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}



const Members = () => {
   const [members, setMembers] = useState<User[]>([]);
   const { t } = useTranslation();

   useEffect(() => {
      getAllMembers().then(setMembers);
   }, []);

   return (
      <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
         <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-12 text-glow">{t('community')}</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(m => (
               <Link to={`/profile/${m.id}`} key={m.id} className="bg-[#1f2329] border border-white/10 rounded-2xl p-6 hover:border-accentGreen/50 hover:shadow-[0_0_30px_rgba(0,224,84,0.1)] transition group relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6">
                     <div className={`w-16 h-16 rounded-full border-2 border-white/10 group-hover:border-accentGreen transition overflow-hidden bg-gradient-to-br ${getAvatarColor(m.username)} flex items-center justify-center text-white font-black text-2xl`}>
                        {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : m.username[0].toUpperCase()}
                     </div>
                     <div>
                        <div className="font-black text-white text-xl group-hover:text-accentGreen transition">{m.username}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Member since {new Date(m.joinedAt).toLocaleDateString()}</div>
                     </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 border-t border-white/5 pt-4">
                     <div className="text-center">
                        <div className="text-lg font-black text-white">{m.watchlist.length}</div>
                        <div className="text-[10px] font-bold uppercase text-gray-600">Tracking</div>
                     </div>
                     <div className="text-center">
                        <div className="text-lg font-black text-white">{Object.keys(m.ratings).length}</div>
                        <div className="text-[10px] font-bold uppercase text-gray-600">Rated</div>
                     </div>
                  </div>

                  {/* Favorites Preview */}
                  <div className="flex gap-2 justify-center">
                     {m.topFavorites.slice(0, 3).map((s, i) => (
                        <div key={i} className="w-16 aspect-[2/3] bg-gray-800 rounded overflow-hidden opacity-60 group-hover:opacity-100 transition">
                           <img src={getImageUrl(s.poster_path)} className="w-full h-full object-cover" />
                        </div>
                     ))}
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
};

const AuthPage = () => {
   const location = useLocation();
   const [isLogin, setIsLogin] = useState(location.pathname === '/login');
   const [username, setUsername] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [rememberMe, setRememberMe] = useState(false);

   const [bgIndex, setBgIndex] = useState(0);
   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
   const { refreshUser } = useContext(AuthContext);
   const { t } = useTranslation();
   const navigate = useNavigate();

   const bgImages = [
      'https://image.tmdb.org/t/p/original/fIKc2cR1GglarzChMAb4BOP1qHP.jpg', // Dexter
      'https://image.tmdb.org/t/p/original/7cqKGQMnNabzOpi7qaIgZvQ7NGV.jpg', // The Boys
      'https://image.tmdb.org/t/p/original/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg', // Succession
      'https://image.tmdb.org/t/p/original/npD65vPa4vvn1ZHpp3o05A5vdKT.jpg', // Severance
      'https://image.tmdb.org/t/p/original/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg', // Arcane
      'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', // Breaking Bad
   ];

   useEffect(() => {
      setIsLogin(location.pathname === '/login');
   }, [location.pathname]);

   useEffect(() => {
      const interval = setInterval(() => {
         setBgIndex(prev => (prev + 1) % bgImages.length);
      }, 6000);
      return () => clearInterval(interval);
   }, [bgImages.length]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!captchaToken) {
         setError("Please complete the captcha.");
         return;
      }

      try {
         if (isLogin) {
            if (!username.trim()) throw new Error("Username or Email is required.");
            await login(username, password);
         } else {
            if (!username.trim()) throw new Error("Username is required.");
            if (!email.includes('@') || !email.includes('.')) throw new Error("Invalid email format.");
            if (password.length < 4) throw new Error("Password too short.");
            await register(username, email, password);
            // Auto-login is handled by Supabase if email confirmation is off, but we can also just redirect
            // or let the user login manually if needed. But user requested auto-entry.
            // If Supabase is set to "Confirm Email", this might fail to auto-login without session.
            // Assuming user disabled it as requested.
            await login(username, password);
         }
         await refreshUser();
         navigate('/');
      } catch (err: any) {
         let errorMessage = err.message;

         // Handle specific error messages
         if (err.message === "Invalid credentials.") {
            errorMessage = t('incorrectCreds');
         } else if (err.message?.toLowerCase().includes('email signups are disabled') ||
            err.message?.toLowerCase().includes('email logins are disabled') ||
            err.message?.toLowerCase().includes('email authentication is currently disabled')) {
            errorMessage = 'Email authentication is currently disabled. Please check your Supabase dashboard settings to enable email authentication.';
         }

         setError(errorMessage);
      }
   };
   return (
      <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center relative overflow-hidden">
         {/* Cinematic Rotating Background */}
         <div className="absolute inset-0 overflow-hidden">
            {bgImages.map((img, i) => (
               <div
                  key={i}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${i === bgIndex ? 'opacity-40' : 'opacity-0'}`}
                  style={{ backgroundImage: `url('${img}')` }}
               ></div>
            ))}
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f12] via-[#0d0f12]/60 to-[#0d0f12] z-0"></div>

         <div className="relative z-10 w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-8">
               <div className="flex items-center justify-center gap-4">
                  <Logo size="md" />
                  <div className="text-left">
                     <h1 className="text-3xl font-black text-white tracking-tighter uppercase drop-shadow-2xl leading-none">Easy Series Tracker</h1>
                     <p className="text-gray-400 font-medium tracking-wide uppercase text-[10px] mt-1">Track, Rate, and Discuss your favorite shows.</p>
                  </div>
               </div>
            </div>

            <div className="bg-[#1f2329]/90 backdrop-blur-xl border border-white/10 p-10 shadow-2xl relative overflow-hidden group rounded-2xl">
               <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                  {isLogin ? t('login') : "Create Account"}
               </h2>

               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{t('username')} / Email</label>
                     <Input value={username} onChange={(e: any) => setUsername(e.target.value)} className="bg-black/30 border-white/10 focus:border-accentGreen rounded-lg" />
                  </div>

                  {!isLogin && (
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{t('emailAddr')}</label>
                        <Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} className="bg-black/30 border-white/10 focus:border-accentGreen rounded-lg" />
                     </div>
                  )}

                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{t('password')}</label>
                     <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} className="bg-black/30 border-white/10 focus:border-accentGreen rounded-lg" />
                  </div>

                  {isLogin && (
                     <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setRememberMe(!rememberMe)} className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition ${rememberMe ? 'bg-accentGreen border-accentGreen' : 'bg-transparent'}`}>
                           {rememberMe && <Check size={12} className="text-black" />}
                        </button>
                        <span className="text-xs text-gray-400">{t('rememberMe')}</span>
                     </div>
                  )}

                  {error && <div className="text-red-500 text-xs font-bold bg-red-500/10 p-3 border border-red-500/20 text-center uppercase tracking-wide rounded">{error}</div>}

                  <div className="flex justify-center py-2">
                     <Turnstile
                        sitekey="0x4AAAAAACB_4FugDXbOjYa5" // Real Key
                        onVerify={(token) => setCaptchaToken(token)}
                        theme="dark"
                     />
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-6 py-3 rounded-lg uppercase tracking-widest text-xs">{isLogin ? t('login') : "Start Tracking"}</Button>
               </form>


               <div className="mt-6 text-center pt-4 border-t border-white/10">
                  {isLogin ? (
                     <p className="text-xs text-gray-400">
                        {t('dontHaveAccount')} <button onClick={() => navigate('/register')} className="text-white font-bold hover:text-accentGreen underline decoration-accentGreen/50 hover:decoration-accentGreen transition">{t('joinNow')}</button>
                     </p>
                  ) : (
                     <p className="text-xs text-gray-400">
                        {t('alreadyHaveAccount')} <button onClick={() => navigate('/login')} className="text-white font-bold hover:text-accentGreen underline decoration-accentGreen/50 hover:decoration-accentGreen transition">{t('login')}</button>
                     </p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

const App = () => {
   const [user, setUser] = useState<User | null>(null);
   const [background, setBackground] = useState<string | null>(null);
   const [language, setLanguage] = useState<Language>('en');

   const refreshUser = async () => {
      const u = await getCurrentUser();
      setUser(u);
      if (u?.settings?.language) setLanguage(u.settings.language);
      if (u) checkAndNotify(u);
   };

   useEffect(() => {
      refreshUser();
   }, []);

   const handleLogout = async () => {
      await logout();
      setUser(null);
      setLanguage('en');
      window.location.href = '/';
   };

   const t = (key: keyof typeof TRANSLATIONS['en']) => {
      return TRANSLATIONS[language][key] || key;
   }

   return (
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
         <AuthContext.Provider value={{ user, refreshUser, handleLogout }}>
            <BackgroundContext.Provider value={{ setBackground }}>
               <HashRouter>
                  <div className="min-h-screen bg-[#14181c] text-gray-100 font-sans selection:bg-accentGreen selection:text-black">
                     {/* Global Dynamic Background */}
                     <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000">
                        {background && (
                           <>
                              {/* Image fully opaque, no blur */}
                              <div className="absolute inset-0 bg-cover bg-center animate-ken-burns" style={{ backgroundImage: `url(${background})` }} />
                              {/* Increased global overlay opacity to 40% for text readability */}
                              <div className="absolute inset-0 bg-black/40" />
                              {/* Add a gradient at the bottom so footer/scrolling isn't abrupt */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] via-transparent to-transparent" />
                           </>
                        )}
                        {/* Noise remains */}
                        <div className="absolute inset-0 bg-noise opacity-5" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
                     </div>

                     <Navbar />

                     <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="/show/:id" element={<ShowPage />} />
                        <Route path="/review/:id" element={<ReviewDetailPage />} />
                        <Route path="/list/:id" element={<ListDetailPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/watchlist" element={<Tracking />} />
                        <Route path="/members" element={<Members />} />
                     </Routes>
                  </div>
               </HashRouter>
            </BackgroundContext.Provider>
         </AuthContext.Provider>
      </LanguageContext.Provider>
   );
};

export default App;
