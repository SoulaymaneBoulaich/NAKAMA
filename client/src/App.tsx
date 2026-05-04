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
import AniQuizHub from './pages/aniquiz/AniQuizHub';
import AniQuizSession from './pages/aniquiz/AniQuizSession';
import ContributePage from './pages/aniquiz/ContributePage';
import ReviewSubmissionsPage from './pages/aniquiz/ReviewSubmissionsPage';
import HallOfShamePage from './pages/aniquiz/HallOfShamePage';
import QuizRoomsPage from './pages/aniquiz/QuizRoomsPage';
import CommunityTournamentsPage from './pages/aniquiz/CommunityTournaments';
import BattleArenaPage from './pages/aniquiz/BattleArena';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { NewsArticlePage } from './pages/NewsArticlePage';
import { MainLayout } from './components/layout/MainLayout';
import { AuthModal } from './components/auth/AuthModal';

import { useActivityTracker } from './hooks/useActivityTracker';

function AppInner() {
  useActivityTracker();
  return (
    <Routes>
      {/* Public/Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Navigation and Main Application Flow */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/news/article" element={<NewsArticlePage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/communities" element={<CommunitiesBrowse />} />
          <Route path="/communities/:slug" element={<CommunityDetail />} />
          <Route path="/playlists" element={<MyPlaylistsPage />} />
          <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          <Route path="/chronicles" element={<ChroniclesExplorePage />} />
          <Route path="/chronicles/write" element={<MyChroniclesPage />} />
          <Route path="/chronicles/:id" element={<ChronicleDetailPage />} />
          <Route path="/chronicles/:id/manage" element={<ChronicleManagePage />} />
          <Route path="/chronicles/:id/chapters/:chapterId" element={<ChronicleChapterReaderPage />} />
          <Route path="/chronicles/:id/chapters/:chapterId/edit" element={<ChronicleChapterEditorPage />} />
          
          {/* AniJudge Routes */}
          <Route path="/anijudge" element={<AniJudgeHome />} />
          <Route path="/anijudge/arena/:code" element={<ArenaPage />} />

          {/* Messaging Routes */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessagesPage />} />

          {/* Watch Party Routes */}
          <Route path="/watchparty" element={<WatchPartyHub />} />
          <Route path="/watchparty/:code" element={<WatchPartyRoom />} />

          {/* AniQuiz Routes */}
          <Route path="/aniquiz" element={<AniQuizHub />} />
          <Route path="/aniquiz/play/:id" element={<AniQuizSession />} />
          <Route path="/aniquiz/contribute" element={<ContributePage />} />
          <Route path="/aniquiz/review" element={<ReviewSubmissionsPage />} />
          <Route path="/aniquiz/shame" element={<HallOfShamePage />} />
          <Route path="/aniquiz/rooms" element={<QuizRoomsPage />} />
          <Route path="/aniquiz/tournaments" element={<CommunityTournamentsPage />} />
          <Route path="/aniquiz/battle" element={<BattleArenaPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppearanceProvider>
            <AuthModal />
            <AppInner />
          </AppearanceProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
