// Client-side photo helper — downscale a camera capture to a compact JPEG data-URL
// small enough to store in the database (~150-300 KB).

// Thrown by fileToJpegDataUrl when the captured image is portrait (taller than
// wide). The ritual/witness photo must be landscape — callers should catch this
// specifically to show a "turn your phone sideways" prompt instead of a generic
// failure message.
export class NotLandscapeError extends Error {
  constructor() {
    super("Photo must be landscape — turn your phone sideways and try again.");
    this.name = "NotLandscapeError";
  }
}

export async function fileToJpegDataUrl(file: File, maxW = 1024, requireLandscape = false): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (requireLandscape && img.height > img.width) {
        URL.revokeObjectURL(url);
        reject(new NotLandscapeError());
        return;
      }
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      let out = canvas.toDataURL("image/jpeg", 0.68);
      if (out.length > 600_000) out = canvas.toDataURL("image/jpeg", 0.5);
      if (out.length > 600_000) out = canvas.toDataURL("image/jpeg", 0.35);
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
