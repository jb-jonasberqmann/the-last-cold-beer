// Client-side photo helper — downscale a camera capture to a compact JPEG data-URL
// small enough to store in the database (~150-300 KB).

export async function fileToJpegDataUrl(file: File, maxW = 1280): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
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
      let out = canvas.toDataURL("image/jpeg", 0.72);
      if (out.length > 850_000) out = canvas.toDataURL("image/jpeg", 0.5);
      resolve(out);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
