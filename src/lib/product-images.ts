const normalizePath = (value?: string) => (value ? decodeURIComponent(value).toLowerCase() : "");

const fileName = (value?: string) => {
  const normalized = normalizePath(value);
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? "";
};

const isImage06 = (value?: string) => {
  const name = fileName(value);
  return /(?:image0*6|(?:^|[^0-9])6(?:_result)?)(?:\.[a-z0-9]+)$/i.test(name);
};

export function pickDefaultProductImage(primary?: string, gallery: string[] = []): string {
  const safeGallery = gallery.filter(Boolean);
  const image06FromGallery = safeGallery.find((image) => isImage06(image));

  if (image06FromGallery) return image06FromGallery;
  if (isImage06(primary)) return primary!;
  if (primary) return primary;
  return safeGallery[0] || "/extracted/img-060.jpg";
}
