/**
 * YouTube link to MP3 conversion utility
 * 
 * This module handles YouTube URL processing and validation
 */

/**
 * YouTube URL patterns for validation
 */
const YOUTUBE_PATTERNS = {
  SHORT: /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  STANDARD: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|u\/\w\/|playlist\?list=))([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  PLAYLIST: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)(?:\?.*)?$/
};

/**
 * YouTube video ID extractor
 * Supports various YouTube URL formats including:
 * - Standard watch URLs (youtube.com/watch?v=...)
 * - Short URLs (youtu.be/...)
 * - Embed URLs (youtube.com/embed/...)
 * - Playlist URLs (youtube.com/playlist?list=...)
 */
export const extractYoutubeId = (url: string | undefined | null): string | null => {
  // Return null if url is undefined or null
  if (!url) return null;

  try {
    // Try short URL pattern first
    const shortMatch = url.match(YOUTUBE_PATTERNS.SHORT);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }

    // Try standard URL pattern
    const standardMatch = url.match(YOUTUBE_PATTERNS.STANDARD);
    if (standardMatch && standardMatch[1]) {
      return standardMatch[1];
    }

    // Try playlist pattern
    const playlistMatch = url.match(YOUTUBE_PATTERNS.PLAYLIST);
    if (playlistMatch && playlistMatch[1]) {
      return playlistMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
};

/**
 * Validate if a URL is a valid YouTube link
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  return !!extractYoutubeId(url);
};

/**
 * Get YouTube video thumbnail
 * Returns different quality options:
 * - default: 120x90
 * - mqdefault: 320x180
 * - hqdefault: 480x360
 * - sddefault: 640x480
 * - maxresdefault: 1280x720
 */
export const getYoutubeThumbnail = (youtubeUrl: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'mqdefault'): string | null => {
  const videoId = extractYoutubeId(youtubeUrl);
  if (!videoId) return null;
  
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Get YouTube video ID
 * This is a utility function to extract the video ID from a YouTube URL
 */
export const getYoutubeVideoId = (youtubeUrl: string): string | null => {
  return extractYoutubeId(youtubeUrl);
};

/**
 * Process a single music URL to get playable URL and title
 */
export const processMusicUrl = (url: string): { url: string; title: string } => {
  const isYoutube = isValidYoutubeUrl(url);
  const videoId = isYoutube ? extractYoutubeId(url) : null;
  
  return {
    url: isYoutube && videoId ? `https://www.youtube.com/watch?v=${videoId}` : url,
    title: isYoutube 
      ? `YouTube Video ${videoId || ''}`
      : url.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unknown'
  };
};

/**
 * Process an array of music URLs to get playable URLs and titles
 */
export const processMusicUrls = (urls: string[]): Array<{ url: string; title: string }> => {
  return urls.map(processMusicUrl);
}; 