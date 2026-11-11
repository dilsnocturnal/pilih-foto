/**
 * Utility to optimize and compress image files for web preview & Firestore storage.
 * Keeps resolution sharp while ensuring document size stays well below Firestore's 1MB limit.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.8
): Promise<{ dataUrl: string; filename: string }> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('File bukan gambar'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (event) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: event.target?.result as string, filename: file.name });
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl: compressedDataUrl, filename: file.name });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
