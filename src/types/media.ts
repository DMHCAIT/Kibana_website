export interface MediaFile {
  id: string;
  name: string;
  url: string;
  bucket: string;
  path: string;
  type: "image" | "video";
  size: number;
  uploadedAt: string;
}
