"use client";

import dynamic from "next/dynamic";

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    <span className="text-sm text-gray-500 dark:text-gray-400">Loading utility...</span>
  </div>
);

const utilityComponents = {
  CSVJSONConverter: dynamic(
    () => import("./CSVJSONConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  YAMLJSONConverter: dynamic(
    () => import("./YAMLJSONConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  QueryParamsConverter: dynamic(
    () => import("./QueryParamsConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  TimestampConverter: dynamic(
    () => import("./TimestampConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  Base64Converter: dynamic(
    () => import("./Base64Converter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HashGenerator: dynamic(
    () => import("./HashGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JWTParser: dynamic(
    () => import("./JWTParser"),
    { ssr: false, loading: LoadingSpinner }
  ),
  UUIDGenerator: dynamic(
    () => import("./UUIDGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HARViewer: dynamic(
    () => import("./HARViewer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  RegexTester: dynamic(
    () => import("./RegexTester"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CSSInliner: dynamic(
    () => import("./CSSInliner"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CSSUnitsConverter: dynamic(
    () => import("./CSSUnitsConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  NumberBaseConverter: dynamic(
    () => import("./NumberBaseConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HexRGBConverter: dynamic(
    () => import("./HexRGBConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ImageBase64Converter: dynamic(
    () => import("./ImageBase64Converter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ImageResizer: dynamic(
    () => import("./ImageResizer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SVGViewer: dynamic(
    () => import("./SVGViewer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  LoremGenerator: dynamic(
    () => import("./LoremGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ENVTOMLConverter: dynamic(
    () => import("./ENVTOMLConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  URLEncodeDecoder: dynamic(
    () => import("./URLEncodeDecoder"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HTMLEncodeDecoder: dynamic(
    () => import("./HTMLEncodeDecoder"),
    { ssr: false, loading: LoadingSpinner }
  ),
  PasswordGenerator: dynamic(
    () => import("./PasswordGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  TextCaseConverter: dynamic(
    () => import("./TextCaseConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JSONFormatter: dynamic(
    () => import("./JSONFormatter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  QRCodeGenerator: dynamic(
    () => import("./QRCodeGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  XMLFormatter: dynamic(
    () => import("./XMLFormatter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  MarkdownPreview: dynamic(
    () => import("./MarkdownPreview"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SQLFormatter: dynamic(
    () => import("./SQLFormatter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ImageOptimizer: dynamic(
    () => import("./ImageOptimizer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ScientificCalculator: dynamic(
    () => import("./ScientificCalculator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ASCIIArtGenerator: dynamic(
    () => import("./ASCIIArtGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  TextDiffChecker: dynamic(
    () => import("./TextDiffChecker"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JSONToTypeScript: dynamic(
    () => import("./JSONToTypeScript"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CronBuilder: dynamic(
    () => import("./CronBuilder"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CurlConverter: dynamic(
    () => import("./CurlConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ChmodCalculator: dynamic(
    () => import("./ChmodCalculator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SocialPreview: dynamic(
    () => import("./SocialPreview"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CIDRCalculator: dynamic(
    () => import("./CIDRCalculator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  DockerValidator: dynamic(
    () => import("./DockerValidator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  NginxConfigGenerator: dynamic(
    () => import("./NginxConfigGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  GitHelper: dynamic(
    () => import("./GitHelper"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SystemdGenerator: dynamic(
    () => import("./SystemdGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HTTPStatusCodes: dynamic(
    () => import("./HTTPStatusCodes"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HMACGenerator: dynamic(
    () => import("./HMACGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  KeyPairGenerator: dynamic(
    () => import("./KeyPairGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  BcryptTester: dynamic(
    () => import("./BcryptTester"),
    { ssr: false, loading: LoadingSpinner }
  ),
  BasicAuthGenerator: dynamic(
    () => import("./BasicAuthGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  FileChecksum: dynamic(
    () => import("./FileChecksum"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ContrastChecker: dynamic(
    () => import("./ContrastChecker"),
    { ssr: false, loading: LoadingSpinner }
  ),
  GlassmorphismGenerator: dynamic(
    () => import("./GlassmorphismGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CSSLayoutSandbox: dynamic(
    () => import("./CSSLayoutSandbox"),
    { ssr: false, loading: LoadingSpinner }
  ),
  GradientGenerator: dynamic(
    () => import("./GradientGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  PaletteExtractor: dynamic(
    () => import("./PaletteExtractor"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SVGOptimizer: dynamic(
    () => import("./SVGOptimizer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  UserAgentParser: dynamic(
    () => import("./UserAgentParser"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SwaggerViewer: dynamic(
    () => import("./SwaggerViewer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  CookieInspector: dynamic(
    () => import("./CookieInspector"),
    { ssr: false, loading: LoadingSpinner }
  ),
  HTMLToJSX: dynamic(
    () => import("./HTMLToJSX"),
    { ssr: false, loading: LoadingSpinner }
  ),
  FaviconGenerator: dynamic(
    () => import("./FaviconGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JSONToSQL: dynamic(
    () => import("./JSONToSQL"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JSONToCSVTable: dynamic(
    () => import("./JSONToCSVTable"),
    { ssr: false, loading: LoadingSpinner }
  ),
  XMLJSONConverter: dynamic(
    () => import("./XMLJSONConverter"),
    { ssr: false, loading: LoadingSpinner }
  ),
  JSONEscaper: dynamic(
    () => import("./JSONEscaper"),
    { ssr: false, loading: LoadingSpinner }
  ),
  EXIFRemover: dynamic(
    () => import("./EXIFRemover"),
    { ssr: false, loading: LoadingSpinner }
  ),
  SlugGenerator: dynamic(
    () => import("./SlugGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  MockDataGenerator: dynamic(
    () => import("./MockDataGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  NanoIDGenerator: dynamic(
    () => import("./NanoIDGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  TestDataGenerator: dynamic(
    () => import("./TestDataGenerator"),
    { ssr: false, loading: LoadingSpinner }
  ),
  ReadabilityAnalyzer: dynamic(
    () => import("./ReadabilityAnalyzer"),
    { ssr: false, loading: LoadingSpinner }
  ),
  DuplicateRemover: dynamic(
    () => import("./DuplicateRemover"),
    { ssr: false, loading: LoadingSpinner }
  ),
  StringObfuscator: dynamic(
    () => import("./StringObfuscator"),
    { ssr: false, loading: LoadingSpinner }
  ),
};

export default function UtilityLoader({ componentName }) {
  const Component = utilityComponents[componentName];

  if (!Component) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        Utility component not found.
      </div>
    );
  }

  return <Component />;
}
