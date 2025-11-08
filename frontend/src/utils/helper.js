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

export async function formatFormData(params) {
  const { title, address, price, ...metadata } = params;
  let thumbnail = params.thumbnail;
  
  // If no thumbnail provided, convert default thumbnail to data URL
  if (!thumbnail) {
    thumbnail = await imageUrlToDataUrl(defaultThumbnail);
  }
  
  metadata.beds = countBeds(metadata.bedrooms);
  return { title, address, price, thumbnail, metadata };
}
