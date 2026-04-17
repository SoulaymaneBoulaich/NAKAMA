// NAKAMA Shared Types
export type LayoutDensity = 'COMPACT' | 'COMFORTABLE';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
  
  // Identity & Contact
  fullName?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  
  // Preferences & Appearance
  language: string;
  timezone: string;
  theme: string;
  typography: string;
  accentColor: string;
  layoutDensity: LayoutDensity;
  
  // Privacy & Status
  isPrivate: boolean;
  isPremium: boolean;
  searchIndexable: boolean;
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  deactivatedAt?: string | Date | null;
  
  // AniQuiz Status
  isUltraNakama: boolean;
  ultraNakamaExpiresAt?: string | Date | null;
  isNakamaLeader: boolean;
  nakamaLeaderSince?: string | Date | null;
  gauntletFrameUrl?: string | null;
  
  joinDate?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  followerCount?: number;
  followingCount?: number;
}

export type AnimeStatus = 'WATCHING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_WATCH';
export const AnimeStatusEnum = {
  WATCHING: 'WATCHING',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  DROPPED: 'DROPPED',
  PLAN_TO_WATCH: 'PLAN_TO_WATCH',
} as const;

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface SignupData {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password?: string;
}

// Jikan Interfaces
export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  title: string;
  title_english?: string;
  type?: string;
  episodes?: number;
  status: string;
  duration?: string;
  rating?: string;
  score?: number;
  synopsis?: string;
  year?: number;
  studios: Array<{ mal_id: number; name: string }>;
  genres: Array<{ mal_id: number; name: string }>;
}


export interface AnimeEntry {
  id: string;
  userId: string;
  animeId: string;
  status: AnimeStatus;
  episodeProgress: number;
  rewatchCount: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  privateNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  animeData?: JikanAnime; // Joined from Jikan
  rating?: Rating; // Joined from local DB
}

export interface Rating {
  id: string;
  userId: string;
  animeId: string;
  animation: number;
  characters: number;
  buildUp: number;
  story: number;
  feeling: number;
  ending: number;
  calculatedScore: number;
  review?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RatingCategoryStats {
  category: string;
  average: number;
}

export type ActivityType = 'ANIME_ADD' | 'ANIME_UPDATE' | 'ANIME_RATE' | 'FOLLOW' | 'POST_CREATE' | 'POST_LIKE' | 'POST_COMMENT';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  entityId?: string | null;
  entityTitle?: string | null;
  entityImage?: string | null;
  metadata?: any;
  createdAt: string | Date;
  user?: User;
}

export interface PrivacySettings {
  id: string;
  userId: string;
  profileVisibility: Visibility;
  showStats: boolean;
  showTopTen: boolean;
  showFingerprint: boolean;
  showActivity: boolean;
  showCommunities: boolean;
  showPlaylists: boolean;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  marketingEmails: boolean;
  systemAlerts: boolean;
  pushNotifications: boolean;
}

export interface UserStats {
  totalTracked: number;
  episodesWatched: number;
  communitiesJoined: number;
  postsCount: number;
}

export interface TopTenEntry {
  id: string;
  userId: string;
  animeId: string;
  animeTitle: string;
  animeCover?: string | null;
  rank: number;
  createdAt: string | Date;
}

export interface FollowData {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string | Date;
  follower?: User;
  following?: User;
}

export interface UserProfile extends User {
  privacySettings?: PrivacySettings;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  category?: string | null;
  memberCount: number;
  isValidated: boolean;
  createdAt: string | Date;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  communityId?: string | null;
  community?: Community | null;
  content: string;
  imageUrl?: string | null;
  animeId?: string | null;
  animeData?: JikanAnime | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  pollId?: string | null;
  poll?: Poll | null;
  videoUrl?: string | null;
  videoTitle?: string | null;
}

export type AniShotType = 'THOUGHT' | 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'HYPE';

export interface AniShot {
  id: string;
  userId: string;
  user: User;
  content?: string | null;
  mediaUrl?: string | null;
  animeId?: string | null;
  animeTitle?: string | null;
  animeCover?: string | null;
  type: AniShotType;
  expiresAt: string | Date;
  viewCount: number;
  createdAt: string | Date;
  viewed?: boolean;
}

export interface Poll {
  id: string;
  postId: string;
  question: string;
  expiresAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
  voteCount: number;
  votes: { userId: string }[];
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  createdAt: string | Date;
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string | null;
  actor?: User | null;
  type: string;
  message: string;
  isRead: boolean;
  referenceId?: string | null;
  createdAt: string | Date;
}

export interface SearchResponse {
  anime: JikanAnime[];
  users: UserProfile[];
  communities: Community[];
}

export type PlaylistVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface Playlist {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  visibility: PlaylistVisibility;
  createdAt: string | Date;
  updatedAt: string | Date;
  entries?: PlaylistEntry[];
  collaborators?: PlaylistCollaborator[];
  follows?: PlaylistFollow[];
  comments?: PlaylistComment[];
  _count?: {
    entries: number;
    follows: number;
    comments: number;
  };
}

export interface PlaylistEntry {
  id: string;
  playlistId: string;
  animeId: string;
  animeTitle: string;
  animeCover: string;
  userId: string;
  note?: string | null;
  order: number;
  createdAt: string | Date;
}

export interface PlaylistCollaborator {
  id: string;
  playlistId: string;
  userId: string;
  joinedAt: string | Date;
}

export interface PlaylistFollow {
  id: string;
  playlistId: string;
  userId: string;
  createdAt: string | Date;
}

export interface PlaylistComment {
  id: string;
  playlistId: string;
  userId: string;
  content: string;
  createdAt: string | Date;
}
