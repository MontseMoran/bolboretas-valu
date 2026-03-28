const MAX_INPUT_BYTES = 3 * 1024 * 1024;

function buildOutputName(fileName) {
  const normalizedName = String(fileName || "").trim();
  const baseName = normalizedName.replace(/\.[^.]+$/, "") || "imagen";
  return `${baseName}.jpg`;
}

async function loadImageFromFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

export async function resizeImageFile(file, maxLong = 1200, quality = 0.7) {
  if (!file) {
    throw new Error("No se ha recibido ninguna imagen.");
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("La imagen supera el máximo permitido de 3 MB.");
  }

  const fileName = String(file.name || "").toLowerCase();
  const fileType = String(file.type || "").toLowerCase();
  const isHeicLike =
    fileType.includes("heic") ||
    fileType.includes("heif") ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif");

  if (isHeicLike) {
    throw new Error("Las fotos HEIC o HEIF no son compatibles todavía. Usa JPG o PNG.");
  }

  const img = await loadImageFromFile(file);

  const ratio =
    img.width > img.height ? img.width / maxLong : img.height / maxLong;
  const width = Math.round(img.width / Math.max(1, ratio));
  const height = Math.round(img.height / Math.max(1, ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar la imagen para subirla.");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) {
    throw new Error("No se pudo convertir la imagen. Prueba con otra foto JPG o PNG.");
  }

  return new File([blob], buildOutputName(file.name), {
    type: "image/jpeg",
  });
}

export async function cropImageFile(
  file,
  {
    aspectRatio = 4 / 5,
    zoom = 1,
    offsetX = 0,
    offsetY = 0,
    outputWidth = 1200,
    quality = 0.82,
  } = {}
) {
  if (!file) {
    throw new Error("No se ha recibido ninguna imagen.");
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("La imagen supera el máximo permitido de 3 MB.");
  }

  const img = await loadImageFromFile(file);
  const outputHeight = Math.round(outputWidth / aspectRatio);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar la imagen para recortarla.");
  }

  const baseScale = Math.max(outputWidth / img.width, outputHeight / img.height);
  const finalScale = baseScale * Math.max(1, zoom);
  const scaledWidth = img.width * finalScale;
  const scaledHeight = img.height * finalScale;
  const maxShiftX = Math.max(0, (scaledWidth - outputWidth) / 2);
  const maxShiftY = Math.max(0, (scaledHeight - outputHeight) / 2);
  const safeOffsetX = Math.max(-1, Math.min(1, offsetX));
  const safeOffsetY = Math.max(-1, Math.min(1, offsetY));
  const drawX = (outputWidth - scaledWidth) / 2 + safeOffsetX * maxShiftX;
  const drawY = (outputHeight - scaledHeight) / 2 + safeOffsetY * maxShiftY;

  ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) {
    throw new Error("No se pudo generar el recorte de la imagen.");
  }

  return new File([blob], buildOutputName(file.name), {
    type: "image/jpeg",
  });
}
