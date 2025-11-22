
import { supabase } from './supabase';
import { User, Show, Review, List, ReviewReply, WatchlistItem } from '../types';

// --- HELPER: Transform Profile to User ---
import { getShowsByIds } from './tmdbService';

// ... (imports)

// ... (transformProfileToUser, getCurrentUser, getUserById, login, register, logout)

export const getAllMembers = async (): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username', { ascending: true });

  if (error || !profiles) {
    console.error('Error fetching members:', error);
    return [];
  }

  // Çevrimiçi kullanıcıları en üste al
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.is_online && !b.is_online) return -1;
    if (!a.is_online && b.is_online) return 1;
    return 0;
  });

  return sortedProfiles.map(profile => ({
    id: profile.id,
    username: profile.username,
    email: profile.email,
    avatar: profile.avatar_url,
    bio: profile.bio,
    backgroundTheme: profile.background_theme,
    settings: profile.settings || { language: 'en', notificationsEnabled: true },
    topFavorites: profile.top_favorites || [],
    watchlist: [],
    ratings: {},
    lists: [],
    joinedAt: profile.created_at || new Date().toISOString(),
    lastSeen: profile.last_seen || null,
    isOnline: profile.is_online || false
  }));
};

// Helper function to transform profile to user
const transformProfileToUser = (profile: any, authUser: any): User => ({
  id: profile.id,
  username: profile.username,
  email: profile.email || authUser?.email,
  avatar: profile.avatar_url,
  bio: profile.bio,
  backgroundTheme: profile.background_theme,
  settings: profile.settings || { language: 'en', notificationsEnabled: true },
  topFavorites: profile.top_favorites || [],
  watchlist: [],
  ratings: {},
  lists: [],
  joinedAt: profile.created_at || new Date().toISOString(),
  lastSeen: profile.last_seen || null,
  isOnline: profile.is_online || false
});

export const updateUser = async (updatedUser: User) => {
  // 1. Update Auth Email if changed
  if (updatedUser.email) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email && user.email.trim().toLowerCase() !== updatedUser.email.trim().toLowerCase()) {
      const { error } = await supabase.auth.updateUser({ email: updatedUser.email });
      if (error) throw error;
    }
  }

  // 2. Update Profile Fields
  const { error } = await supabase
    .from('profiles')
    .update({
      username: updatedUser.username,
      avatar_url: updatedUser.avatar,
      bio: updatedUser.bio,
      background_theme: updatedUser.backgroundTheme,
      settings: updatedUser.settings,
    })
    .eq('id', updatedUser.id);

  if (error) throw error;
};

export const updateLastSeen = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('profiles')
    .update({ 
      last_seen: new Date().toISOString(),
      is_online: true // Çevrimiçi durumunu güncelle
    })
    .eq('id', user.id);
    
  // 5 dakika sonra çevrimdışı olarak işaretle
  setTimeout(async () => {
    const { data: lastActivity } = await supabase
      .from('profiles')
      .select('last_seen')
      .eq('id', user.id)
      .single();
      
    // Eğer son aktivite 5 dakikadan eskiyse çevrimdışı yap
    if (lastActivity && new Date(lastActivity.last_seen).getTime() < Date.now() - 5 * 60 * 1000) {
      await supabase
        .from('profiles')
        .update({ is_online: false })
        .eq('id', user.id);
    }
  }, 5 * 60 * 1000); // 5 dakika sonra kontrol et
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/reset-password`,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).limit(5);
  if (!data) return [];
  return data.map(p => transformProfileToUser(p, null));
};

export const uploadAvatar = async (file: File): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};

// ... (getAllMembers, addToWatchlist, etc.)

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  const { data } = await supabase.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (!data) return [];

  const showIds = Array.from(new Set(data.map(r => r.show_id)));
  const shows = await getShowsByIds(showIds);
  const showMap = new Map(shows.map(s => [s.id, s]));

  return data.map(r => {
    const show = showMap.get(r.show_id);
    return {
      id: r.id,
      showId: r.show_id,
      showName: show?.name || "Unknown",
      showPoster: show?.poster_path || null,
      userId: r.user_id,
      username: r.username,
      content: r.content,
      rating: r.rating,
      createdAt: r.created_at,
      likes: r.likes,
      replies: r.replies
    };
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  // Fetch Profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') return null;

  if (!profile) {
    // RECOVERY: If user exists in Auth but not in Profiles (due to DB reset), create profile now.
    console.log("User has no profile, attempting to create one...");
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
        avatar_url: session.user.user_metadata?.avatar_url
      })
      .select()
      .single();

    if (createError || !newProfile) {
      console.error("Failed to create recovery profile:", createError);
      return null;
    }
    // Use the newly created profile
    const user = transformProfileToUser(newProfile, session.user);
    // Initialize empty arrays for the rest
    user.watchlist = [];
    user.lists = [];
    return user;
  }

  const user = transformProfileToUser(profile, session.user);

  // Fetch Watchlist
  const { data: watchlist } = await supabase
    .from('watchlists')
    .select('show_id, added_at')
    .eq('user_id', user.id);

  user.watchlist = watchlist?.map(w => ({ showId: w.show_id, addedAt: w.added_at })) || [];

  // Fetch Ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('show_id, rating')
    .eq('user_id', user.id);

  if (ratings) {
    ratings.forEach(r => {
      user.ratings[r.show_id] = r.rating;
    });
  }

  // Fetch Lists
  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user.id);

  user.lists = lists?.map(l => ({
    id: l.id,
    userId: l.user_id,
    username: l.username,
    name: l.name,
    description: l.description,
    isPrivate: l.is_private,
    items: l.items || [],
    likes: l.likes || [],
    comments: l.comments || [],
    createdAt: l.created_at
  })) || [];

  return user;
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile) return undefined;

  // We return a partial user for public view (lists/ratings fetched if needed, but for now basic info)
  // For full profile view, we might need more, but let's stick to basic for now to avoid N+1 queries everywhere
  const user = transformProfileToUser(profile, null);

  // Fetch Ratings for public profile stats
  const { data: ratings } = await supabase.from('ratings').select('show_id, rating').eq('user_id', userId);
  if (ratings) ratings.forEach(r => user.ratings[r.show_id] = r.rating);

  // Fetch Watchlist items (not just count) so we can display them
  const { data: watchlist } = await supabase
    .from('watchlists')
    .select('show_id, added_at')
    .eq('user_id', userId);
  user.watchlist = watchlist?.map(w => ({ showId: w.show_id, addedAt: w.added_at })) || [];

  // Fetch Lists for public profile
  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_private', false); // Only public lists

  user.lists = lists?.map(l => ({
    id: l.id,
    userId: l.user_id,
    username: l.username,
    name: l.name,
    description: l.description,
    isPrivate: l.is_private,
    items: l.items || [],
    likes: l.likes || [],
    comments: l.comments || [],
    createdAt: l.created_at
  })) || [];

  return user;
};

export const login = async (identifier: string, password: string): Promise<void> => {
  let email = identifier;

  // If identifier is not an email, try to find the email by username
  if (!identifier.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single();

    if (profile?.email) {
      email = profile.email;
    } else {
      // If username not found, let Supabase handle the error (it will likely fail with invalid login)
      // or we could throw "User not found" here.
      // Let's proceed with the identifier as is, Supabase will reject it if it's not an email.
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Handle specific Supabase error messages
    if (error.message?.toLowerCase().includes('email logins are disabled')) {
      throw new Error('Email authentication is currently disabled. Please contact support or use an alternative login method.');
    }
    throw error;
  }
};

export const register = async (username: string, email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  if (error) {
    // Handle specific Supabase error messages
    if (error.message?.toLowerCase().includes('email signups are disabled')) {
      throw new Error('Email signups are currently disabled. Please contact support or use an alternative signup method.');
    }
    throw error;
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
};



export const getAllMembers = async (): Promise<User[]> => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, watchlists(count), ratings(count), lists(count)')
    .limit(50);

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }

  if (!profiles) return [];

  // Fetch all lists for all users in parallel
  const userIds = profiles.map((p: any) => p.id);
  const { data: allLists } = await supabase
    .from('lists')
    .select('*')
    .in('user_id', userIds);

  // Group lists by user_id
  const listsByUserId: Record<string, any[]> = {};
  if (allLists) {
    allLists.forEach((list: any) => {
      if (!listsByUserId[list.user_id]) {
        listsByUserId[list.user_id] = [];
      }
      listsByUserId[list.user_id].push({
        id: list.id,
        userId: list.user_id,
        username: list.username,
        name: list.name,
        description: list.description,
        isPrivate: list.is_private,
        items: list.items || [],
        likes: list.likes || [],
        comments: list.comments || [],
        createdAt: list.created_at
      });
    });
  }

  return profiles.map((p: any) => {
    const user = transformProfileToUser(p, null);

    // Fix counts for UI
    const watchlistCount = p.watchlists?.[0]?.count || 0;
    const ratingsCount = p.ratings?.[0]?.count || 0;

    // Hack to show correct counts in UI without fetching all data
    // The UI checks .length, so we create a dummy array of that length
    user.watchlist = Array(watchlistCount).fill({ showId: 0, addedAt: '' });

    // For ratings, UI checks Object.keys(ratings).length
    for (let i = 0; i < ratingsCount; i++) {
      user.ratings[i] = 0;
    }

    // Set actual lists for the user
    user.lists = listsByUserId[p.id] || [];

    return user;
  });
};

export const addToWatchlist = async (showId: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('watchlists').insert({ user_id: user.id, show_id: showId });
};

export const removeFromWatchlist = async (showId: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('watchlists').delete().eq('user_id', user.id).eq('show_id', showId);
};

export const updateTopFavorites = async (shows: Show[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('profiles').update({ top_favorites: shows.slice(0, 3) }).eq('id', user.id);
};

export const rateShow = async (showId: number, rating: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // If rating is 0, remove the rating
  if (rating === 0) {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('show_id', showId);
    if (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  } else {
    // Otherwise upsert the rating - specify onConflict to handle unique constraint
    const { error } = await supabase
      .from('ratings')
      .upsert(
        { user_id: user.id, show_id: showId, rating },
        { onConflict: 'user_id,show_id' }
      );
    if (error) {
      console.error('Error upserting rating:', error);
      throw error;
    }
  }
};

// --- LISTS SYSTEM ---

export const createList = async (name: string, description: string, isPrivate: boolean): Promise<List | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

  const { data, error } = await supabase.from('lists').insert({
    user_id: user.id,
    username: profile?.username,
    name,
    description,
    is_private: isPrivate,
    items: [],
    likes: [],
    comments: []
  }).select().single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    name: data.name,
    description: data.description,
    isPrivate: data.is_private,
    items: data.items,
    likes: data.likes,
    comments: data.comments,
    createdAt: data.created_at
  };
};

export const addShowToList = async (listId: string, show: ShowDetails) => {
  const { data: list } = await supabase.from('lists').select('items').eq('id', listId).single();
  if (!list) return;

  const currentItems = list.items || [];
  if (currentItems.find((i: any) => i.id === show.id)) return; // Already added

  const newItem = {
    id: show.id,
    name: show.name,
    poster_path: show.poster_path,
    vote_average: show.vote_average,
    first_air_date: show.first_air_date
  };

  await supabase.from('lists').update({ items: [...currentItems, newItem] }).eq('id', listId);
};

export const removeShowFromList = async (listId: string, showId: number) => {
  const { data: list } = await supabase.from('lists').select('items').eq('id', listId).single();
  if (!list) return;

  const currentItems = list.items || [];
  const newItems = currentItems.filter((i: any) => i.id !== showId);

  await supabase.from('lists').update({ items: newItems }).eq('id', listId);
};

export const getListById = async (listId: string): Promise<List | null> => {
  const { data } = await supabase.from('lists').select('*').eq('id', listId).single();

  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    name: data.name,
    description: data.description,
    isPrivate: data.is_private,
    items: data.items,
    likes: data.likes,
    comments: data.comments,
    createdAt: data.created_at
  };
};

export const reorderListItems = async (listId: string, items: Show[]) => {
  await supabase
    .from('lists')
    .update({ items })
    .eq('id', listId);
};

export const getAllPublicLists = async (): Promise<List[]> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;

    return (data || []).map((list: any) => ({
      id: list.id,
      name: list.name,
      description: list.description || '',
      userId: list.user_id,
      username: list.username || 'Unknown',
      userAvatar: list.user_avatar || '',
      items: list.items || [],
      createdAt: list.created_at,
      isPrivate: list.is_private || false,
      likes: list.likes || 0,
      comments: list.comments || []
    }));
  } catch (error) {
    console.error('Error fetching public lists:', error);
    return [];
  }
};

export const likeList = async (listId: string, userId: string) => {
  const { data: list } = await supabase.from('lists').select('likes').eq('id', listId).single();
  if (!list) return;

  let likes = list.likes || [];
  if (likes.includes(userId)) {
    likes = likes.filter((id: string) => id !== userId);
  } else {
    likes.push(userId);
  }

  await supabase.from('lists').update({ likes }).eq('id', listId);
};

export const addCommentToList = async (listId: string, comment: Omit<ReviewReply, 'id' | 'createdAt'>) => {
  const { data: list } = await supabase.from('lists').select('comments').eq('id', listId).single();
  if (!list) return;

  const newComment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };

  const comments = list.comments || [];
  comments.push(newComment);

  await supabase.from('lists').update({ comments }).eq('id', listId);
};


// --- Reviews System ---

export const addReview = async (review: Omit<Review, 'id' | 'createdAt' | 'likes' | 'replies'>) => {
  const { data, error } = await supabase.from('reviews').insert({
    user_id: review.userId,
    username: review.username,
    show_id: review.showId,
    rating: review.rating,
    content: review.content,
    likes: [],
    replies: []
  }).select().single();

  return data;
};

export const getReviewById = async (reviewId: string): Promise<Review | undefined> => {
  const { data } = await supabase.from('reviews').select('*').eq('id', reviewId).single();
  if (!data) return undefined;

  // Fetch show details from TMDB
  const shows = await getShowsByIds([data.show_id]);
  const show = shows[0];

  return {
    id: data.id,
    showId: data.show_id,
    showName: show?.name || "Unknown",
    showPoster: show?.poster_path || null,
    userId: data.user_id,
    username: data.username,
    userAvatar: data.user_avatar,
    content: data.content,
    rating: data.rating,
    createdAt: data.created_at,
    likes: data.likes,
    replies: data.replies
  };
};

export const deleteReview = async (reviewId: string) => {
  await supabase.from('reviews').delete().eq('id', reviewId);
};

export const likeReview = async (reviewId: string, userId: string) => {
  try {
    // First, get the current likes
    const { data: review, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();
      
    if (error) throw error;
    if (!review) throw new Error('Review not found');

    // Ensure likes is an array
    const currentLikes = Array.isArray(review.likes) ? [...review.likes] : [];
    const likeIndex = currentLikes.findIndex(id => id === userId);
    
    let updatedLikes;
    if (likeIndex > -1) {
      // Remove like
      updatedLikes = currentLikes.filter(id => id !== userId);
    } else {
      // Add like
      updatedLikes = [...currentLikes, userId];
    }

    // Update the review with the new likes array
    const updateData: any = { 
      likes: updatedLikes 
    };
    
    // Try to update without timestamp first
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    return { 
      likes: updatedLikes,
      review: updatedReview
    };
  } catch (error) {
    console.error('Error in likeReview:', error);
    throw new Error('Failed to update like. Please try again.');
  }
};

export const replyToReview = async (reviewId: string, reply: Omit<ReviewReply, 'id' | 'createdAt'>) => {
  try {
    // First, get the current review with replies
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!review) throw new Error('Review not found');

    // Create the new reply with proper typing
    const newReply: ReviewReply = {
      ...reply,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Ensure replies is an array and add the new reply
    const currentReplies = Array.isArray(review.replies) ? [...review.replies] : [];
    const updatedReplies = [...currentReplies, newReply];

    // Update the review with the new replies array
    const updateData: any = {
      replies: updatedReplies
    };
    
    // Try to update without timestamp first
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    return { 
      replies: updatedReplies,
      review: updatedReview
    };
  } catch (error) {
    console.error('Error in replyToReview:', error);
    throw new Error('Failed to post reply. Please try again.');
  }
};

export const deleteReply = async (reviewId: string, replyId: string) => {
  const { data: review } = await supabase.from('reviews').select('replies').eq('id', reviewId).single();
  if (!review) return;

  const replies = review.replies.filter((r: any) => r.id !== replyId);
  await supabase.from('reviews').update({ replies }).eq('id', reviewId);
};

export const getReviewsByShowId = async (showId: number): Promise<Review[]> => {
  const { data } = await supabase.from('reviews').select('*').eq('show_id', showId).order('created_at', { ascending: false });
  if (!data) return [];

  return data.map(r => ({
    id: r.id,
    showId: r.show_id,
    showName: "",
    showPoster: null,
    userId: r.user_id,
    username: r.username,
    content: r.content,
    rating: r.rating,
    createdAt: r.created_at,
    likes: r.likes,
    replies: r.replies
  }));
};



export const getUserRatingForShow = async (userId: string, showId: number): Promise<number> => {
  const { data } = await supabase.from('ratings').select('rating').eq('user_id', userId).eq('show_id', showId).single();
  return data?.rating || 0;
};

// --- Aggregation Services ---

export const getCommunityFavoriteIds = async (): Promise<{ id: number, score: number }[]> => {
  // This is complex in NoSQL-ish structure. 
  // For now, let's just fetch all ratings (expensive!) or use a stored procedure.
  // To keep it simple for this migration, we'll fetch last 1000 ratings.
  const { data } = await supabase.from('ratings').select('*').limit(1000);
  if (!data) return [];

  const showScores: Record<number, { total: number, count: number }> = {};
  data.forEach(r => {
    if (!showScores[r.show_id]) showScores[r.show_id] = { total: 0, count: 0 };
    showScores[r.show_id].total += r.rating;
    showScores[r.show_id].count += 1;
  });

  return Object.entries(showScores)
    .map(([id, data]) => ({ id: parseInt(id), score: data.total / data.count }))
    .sort((a, b) => b.score - a.score);
};

export const getMostWatchlistedIds = async (): Promise<{ id: number, count: number }[]> => {
  // Similar limitation.
  const { data } = await supabase.from('watchlists').select('show_id').limit(2000);
  if (!data) return [];

  const counts: Record<number, number> = {};
  data.forEach(w => {
    counts[w.show_id] = (counts[w.show_id] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(x => ({ id: parseInt(x[0]), count: x[1] }));
};

// --- SUGGESTIONS SYSTEM ---

const ADMIN_USER_ID = '9f05df16-4a02-46cc-a45c-e0ad1aa53892'; // Admin user ID for receiving suggestions

export interface Suggestion {
  id: string;
  fromUserId: string | null;
  fromUsername: string | null;
  message: string;
  createdAt: string;
}

export const submitSuggestion = async (message: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to submit suggestions');

  // Get username from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const { error } = await supabase
    .from('suggestions')
    .insert({
      from_user_id: user.id,
      from_username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
      to_user_id: ADMIN_USER_ID,
      message: message.trim()
    });

  if (error) throw error;
};

export const getSuggestions = async (): Promise<Suggestion[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Only admin can see suggestions
  if (user.id !== ADMIN_USER_ID) return [];

  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('to_user_id', ADMIN_USER_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  if (!data) return [];

  return data.map(s => ({
    id: s.id,
    fromUserId: s.from_user_id,
    fromUsername: s.from_username,
    message: s.message,
    createdAt: s.created_at
  }));
};

export const deleteSuggestion = async (id: string): Promise<void> => {
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  if (error) throw error;
};

