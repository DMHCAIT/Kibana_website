import type { Product } from "@/types/product";

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

export function getShopDisplayImage(
  product: Product,
  variant: Product["colorVariants"][number],
): string {
  if (product.slug === "prizma-sling-bag") {
    if (variant.slug === "teal-blue") {
      return (
        variant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ??
        variant.gallery?.[5] ??
        variant.image ??
        product.image
      );
    }
    if (variant.slug === "tan") {
      return (
        variant.image?.replace(/\/\d+\.webp$/i, "/4.webp") ??
        variant.gallery?.[2] ??
        variant.image ??
        product.image
      );
    }
    return variant.gallery?.[0] ?? product.gallery?.[0] ?? variant.image ?? product.image;
  }

  if (product.slug === "valera-dome") {
    const valeraImageByColor: Record<string, string> = {
      black: "06",
      "forest-green": "02",
      "milky-blue": "01",
      "royal-blue": "06",
    };
    const targetNumber = valeraImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "cordia-bag") {
    const cordiaImageByColor: Record<string, string> = {
      black: "01",
      "light-purple": "06",
      "lime-yellow": "06",
    };
    const targetNumber = cordiaImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "halo-mini" && variant.slug === "turquoise-blue") {
    return (
      variant.image?.replace(/Image\d+\.webp$/i, "Image02.webp") ?? variant.image ?? product.image
    );
  }

  if (product.slug === "crescent-sling-bag") {
    const crescentImageByColor: Record<string, string> = {
      "milky-blue": "01",
      "turquoise-blue": "06",
      wine: "05",
    };
    const targetNumber = crescentImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "business-laptop-briefcase") {
    const targetImageNumber =
      variant.slug === "black" ? "7" : variant.slug === "tan" ? "4" : undefined;
    if (targetImageNumber) {
      return (
        variant.image?.replace(/\/\d+\.webp$/i, `/${targetImageNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "lekha-wallet") {
    const targetImage = variant.slug === "wine" ? "/5.webp" : "/2.webp";
    return (
      variant.image?.replace(/\/\d+\.webp$/i, targetImage) ?? variant.gallery?.[0] ?? variant.image
    );
  }

  if (product.slug === "zippy-wallet") {
    return variant.image?.replace(/\/\d+\.webp$/i, "/1.webp") ?? variant.image ?? product.image;
  }

  if (product.slug === "vistara-tote-bag") {
    // Use the first gallery image for better display
    return variant.gallery?.[0] ?? variant.image ?? product.image;
  }

  if (product.slug === "large-aurelia-fan-tote") {
    // Use gallery first for better product showcase
    if (variant.gallery && variant.gallery.length > 0) {
      return variant.gallery[0];
    }
    // Fallback to specific images per color
    const aureliaImageByColor: Record<string, string> = {
      mocha: "/kibana_product_images/2%20collection/Large%20Aurelia%20fan%20tote/Mocha/02-04-2026--paulina06474_result.webp",
      wine: "/kibana_product_images/2%20collection/Large%20Aurelia%20fan%20tote/Wine/02-04-2026--paulina06342_result.webp",
    };
    const aureliaImage = aureliaImageByColor[variant.slug];
    return aureliaImage ?? variant.image ?? product.image;
  }

  if (product.slug === "mini-aurelia-fan-tote") {
    // Use gallery first for better product showcase
    if (variant.gallery && variant.gallery.length > 0) {
      return variant.gallery[0];
    }
    // Fallback to specific image for mocha
    if (variant.slug === "mocha") {
      return "/kibana_product_images/2%20collection/mini%20Aurelia%20fab%20tote/mocha/1.webp";
    }
    return variant.image ?? product.image;
  }

  if (product.slug === "sandesh-laptop-bag" && variant.slug === "tan") {
    return (
      variant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ?? variant.gallery?.[5] ?? variant.image
    );
  }

  if (product.slug === "sandesh-laptop-bag" && variant.slug === "teal-blue") {
    return (
      variant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ?? variant.gallery?.[5] ?? variant.image
    );
  }

  if (product.slug === "vistapack") {
    const targetImageNumber =
      variant.slug === "tan"
        ? "6"
        : variant.slug === "milky-blue"
          ? "1"
          : variant.slug === "mint-green"
            ? "6"
            : variant.slug === "teal-blue"
              ? "2"
              : "5";
    const colorImage = variant.image?.replace(/\/\d+\.webp$/i, `/${targetImageNumber}.webp`);
    return (
      colorImage ??
      variant.gallery?.[3] ??
      product.gallery?.[3] ??
      variant.gallery?.[0] ??
      variant.image ??
      product.image
    );
  }

  return pickDefaultProductImage(
    variant.image || product.image,
    variant.gallery ?? product.gallery,
  );
}
