// From ass3 helper.js
import defaultThumbnail from "../assets/default-thumbnail.png";

export function fileToDataUrl(file) {
  const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const valid = validFileTypes.find((type) => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error("provided file is not a png, jpg or jpeg image.");
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// Convert local image URL to data URL
function imageUrlToDataUrl(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

const countBeds = (bedrooms) => {
  return bedrooms.reduce((acc, curr) => acc + curr.single + curr.double, 0);
};

// Extract YouTube video ID from various YouTube URL formats
function extractYouTubeVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Convert YouTube URL to embed format
function convertToEmbedUrl(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export async function formatFormData(params) {
  const { title, address, price, youtubeUrl, ...metadata } = params;
  let thumbnail = params.thumbnail;

  // If YouTube URL is provided, use it as thumbnail
  if (youtubeUrl) {
    const embedUrl = convertToEmbedUrl(youtubeUrl);
    thumbnail = embedUrl || youtubeUrl;
  } else if (!thumbnail) {
    // If no thumbnail provided, convert default thumbnail to data URL
    thumbnail = await imageUrlToDataUrl(defaultThumbnail);
  }

  metadata.beds = countBeds(metadata.bedrooms);
  return { title, address, price, thumbnail, metadata };
}
