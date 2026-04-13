import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/Landing.js';
import { SignupPage } from './pages/Signup.js';
import { LoginPage } from './pages/Login.js';
import { ResetPasswordPage } from './pages/ResetPassword.js';
import { HomePage } from './pages/Home.js';
import { MyListPage } from './pages/MyList';
import { AnimeDetailPage } from './pages/AnimeDetail';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SearchResults from './pages/SearchResults';
import CommunitiesBrowse from './pages/CommunitiesBrowse';
import CommunityDetail from './pages/CommunityDetail';
import ExplorePage from './pages/Explore';
import { FeedPage } from './pages/Feed';
import { MyPlaylistsPage } from './pages/playlists/MyPlaylists';
import { PlaylistDetailPage } from './pages/playlists/PlaylistDetail';
import { ChroniclesExplorePage } from './pages/chronicles/ChroniclesExplore';
import MyChroniclesPage from './pages/chronicles/MyChronicles';
import ChronicleDetailPage from './pages/chronicles/ChronicleDetail';
import { ChronicleChapterReaderPage } from './pages/chronicles/ChapterReader';
import { ChronicleManagePage } from './pages/chronicles/ChronicleManage';
import { ChronicleChapterEditorPage } from './pages/chronicles/ChapterEditor';
import { AniJudgeHome } from './pages/anijudge/AniJudgeHome';
import { ArenaPage } from './pages/anijudge/ArenaPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import WatchPartyHub from './pages/WatchPartyHub';
import WatchPartyRoom from './pages/WatchPartyRoom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { NewsArticlePage } from './pages/NewsArticlePage';
import { AuthModal } from './components/auth/AuthModal';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppearanceProvider>
            <AuthModal />
            <Routes>
            {/* Public/Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Navigable Routes with Navbar */}
            <Route element={<ProtectedRoute />}>
              <Route path="/feed" element={<FeedPage />} />
            </Route>
            <Route element={<><Navbar /><div className="min-h-screen bg-[var(--bg-primary)]"><HomePage /></div></>} path="/home" />
            <Route path="/explore" element={<ExplorePage />} />
            <Route element={<><Navbar /><NewsArticlePage /></>} path="/news/article" />
            <Route element={<><Navbar /><AnimeDetailPage /></>} path="/anime/:id" />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<><Navbar /><SearchResults /></>} />
              <Route path="/profile/:username" element={<><Navbar /><ProfilePage /></>} />
              <Route path="/mylist" element={<><Navbar /><MyListPage /></>} />
              <Route path="/settings" element={<><Navbar /><SettingsPage /></>} />
              <Route path="/communities" element={<><Navbar /><CommunitiesBrowse /></>} />
              <Route path="/communities/:slug" element={<><Navbar /><CommunityDetail /></>} />
              <Route path="/playlists" element={<><Navbar /><MyPlaylistsPage /></>} />
               <Route path="/playlists/:id" element={<><Navbar /><PlaylistDetailPage /></>} />
              <Route path="/chronicles" element={<><Navbar /><ChroniclesExplorePage /></>} />
              <Route path="/chronicles/write" element={<><Navbar /><MyChroniclesPage /></>} />
              <Route path="/chronicles/:id" element={<><Navbar /><ChronicleDetailPage /></>} />
              <Route path="/chronicles/:id/manage" element={<><Navbar /><ChronicleManagePage /></>} />
              <Route path="/chronicles/:id/chapters/:chapterId" element={<ChronicleChapterReaderPage />} />
              <Route path="/chronicles/:id/chapters/:chapterId/edit" element={<ChronicleChapterEditorPage />} />
              
              {/* AniJudge Routes */}
              <Route path="/anijudge" element={<><Navbar /><AniJudgeHome /></>} />
              <Route path="/anijudge/arena/:code" element={<ArenaPage />} />

              {/* Messaging Routes */}
              <Route path="/messages" element={<><Navbar /><MessagesPage /></>} />
              <Route path="/messages/:id" element={<><Navbar /><MessagesPage /></>} />

              {/* Watch Party Routes */}
              <Route path="/watchparty" element={<><Navbar /><WatchPartyHub /></>} />
              <Route path="/watchparty/:code" element={<WatchPartyRoom />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          </AppearanceProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
