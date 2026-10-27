import NextImage, { type ImageProps } from "next/image";

export default function Image({ quality = 95, ...props }: ImageProps) {
  return <NextImage {...props} quality={quality} />;
}
