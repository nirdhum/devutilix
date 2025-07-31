import { useSEO } from "../hooks/useSEO";

const SEO = ({
  title = "Developer Utilities Suite - 30+ Essential Tools for Developers",
  description = "Complete collection of 30+ developer utilities including JSON formatters, image converters, hash generators, QR code generators, and more. Free, fast, and privacy-focused.",
  keywords = "developer tools, json formatter, base64 encoder, hash generator, image converter, qr code generator, password generator, uuid generator, css tools, regex tester",
  canonical,
  ogImage = "/og-image.png",
}) => {
  useSEO({
    title,
    description,
    keywords,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: "website",
  });

  return null; // This component doesn't render anything
};

export default SEO;
