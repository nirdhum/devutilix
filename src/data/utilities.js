export const utilities = [
  {
    id: 'csv-json',
    title: 'CSV ↔ JSON',
    description: 'Convert between CSV and JSON formats',
    category: 'Data',
    tags: ['csv', 'json', 'convert', 'data'],
    component: 'CSVJSONConverter'
  },
  {
    id: 'yaml-json',
    title: 'YAML ↔ JSON', 
    description: 'Convert between YAML and JSON formats',
    category: 'Data',
    tags: ['yaml', 'json', 'convert', 'data'],
    component: 'YAMLJSONConverter'
  },
  {
    id: 'query-params',
    title: 'Query Params to JSON',
    description: 'Parse URL query parameters into JSON',
    category: 'Web',
    tags: ['url', 'query', 'params', 'json'],
    component: 'QueryParamsConverter'
  },
  {
    id: 'timestamp',
    title: 'Timestamp ↔ Date',
    description: 'Convert between timestamps and human-readable dates',
    category: 'Time',
    tags: ['timestamp', 'date', 'time', 'convert'],
    component: 'TimestampConverter'
  },
  {
    id: 'base64',
    title: 'Base64 Encode/Decode',
    description: 'Encode and decode Base64 strings',
    category: 'Encoding',
    tags: ['base64', 'encode', 'decode'],
    component: 'Base64Converter'
  },
  {
    id: 'hash',
    title: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256 hashes',
    category: 'Security',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'security'],
    component: 'HashGenerator'
  },
  {
    id: 'jwt',
    title: 'JWT Parser',
    description: 'Decode and inspect JSON Web Tokens',
    category: 'Security',
    tags: ['jwt', 'token', 'decode', 'security'],
    component: 'JWTParser'
  },
  {
    id: 'uuid',
    title: 'UUID Generator',
    description: 'Generate various types of UUIDs',
    category: 'Generation',
    tags: ['uuid', 'guid', 'generate', 'random'],
    component: 'UUIDGenerator'
  },
  {
    id: 'har',
    title: 'HAR File Viewer',
    description: 'View and analyze HTTP Archive files',
    category: 'Web',
    tags: ['har', 'http', 'archive', 'network'],
    component: 'HARViewer'
  },
  {
    id: 'regex',
    title: 'Regex Tester',
    description: 'Test regular expressions against sample text',
    category: 'Development',
    tags: ['regex', 'regexp', 'test', 'pattern'],
    component: 'RegexTester'
  },
  {
    id: 'css-inliner',
    title: 'CSS Inliner',
    description: 'Inline CSS for email templates',
    category: 'CSS',
    tags: ['css', 'inline', 'email', 'html'],
    component: 'CSSInliner'
  },
  {
    id: 'css-units',
    title: 'CSS Units Converter',
    description: 'Convert between CSS units (px, em, rem, etc.)',
    category: 'CSS',
    tags: ['css', 'units', 'px', 'em', 'rem'],
    component: 'CSSUnitsConverter'
  },
  {
    id: 'number-base',
    title: 'Number Base Converter',
    description: 'Convert numbers between different bases',
    category: 'Math',
    tags: ['number', 'base', 'binary', 'hex', 'decimal'],
    component: 'NumberBaseConverter'
  },
  {
    id: 'hex-rgb',
    title: 'HEX ↔ RGB',
    description: 'Convert between HEX and RGB color formats',
    category: 'Color',
    tags: ['hex', 'rgb', 'color', 'convert'],
    component: 'HexRGBConverter'
  },
  {
    id: 'image-base64',
    title: 'Image to Base64',
    description: 'Convert images to Base64 encoded strings',
    category: 'Images',
    tags: ['image', 'base64', 'convert', 'encode'],
    component: 'ImageBase64Converter'
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize images while maintaining quality',
    category: 'Images',
    tags: ['image', 'resize', 'scale', 'compress'],
    component: 'ImageResizer'
  },
  {
    id: 'svg-viewer',
    title: 'SVG Viewer',
    description: 'Preview and inspect SVG files',
    category: 'Images',
    tags: ['svg', 'viewer', 'preview', 'vector'],
    component: 'SVGViewer'
  },
  {
    id: 'lorem',
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs',
    category: 'Generation',
    tags: ['lorem', 'ipsum', 'text', 'placeholder'],
    component: 'LoremGenerator'
  },
  {
    id: 'env-toml',
    title: 'ENV to Netlify TOML',
    description: 'Convert environment variables to Netlify TOML format',
    category: 'DevOps',
    tags: ['env', 'toml', 'netlify', 'environment'],
    component: 'ENVTOMLConverter'
  },
  {
  id: 'url-encode-decode',
  title: 'URL Encode/Decode',
  description: 'Encode and decode URLs and query parameters for web development',
  category: 'Encoding',
  tags: ['url', 'encode', 'decode', 'web', 'query', 'parameters'],
  component: 'URLEncodeDecoder'
  },
  {
  id: 'html-encode-decode',
  title: 'HTML Encode/Decode',
  description: 'Encode and decode HTML entities and special characters for web development',
  category: 'Encoding',
  tags: ['html', 'encode', 'decode', 'entities', 'escape', 'web', 'xss'],
  component: 'HTMLEncodeDecoder'
  },
  {
  id: 'password-generator',
  title: 'Password Generator',
  description: 'Generate secure passwords with customizable length and character sets',
  category: 'Security',
  tags: ['password', 'security', 'random', 'generator', 'authentication', 'strong'],
  component: 'PasswordGenerator'
  },
  {
  id: 'text-case-converter',
  title: 'Text Case Converter',
  description: 'Convert text between different cases: uppercase, lowercase, camelCase, PascalCase, and more',
  category: 'Text Processing',
  tags: ['text', 'case', 'convert', 'uppercase', 'lowercase', 'camelcase', 'pascal', 'snake', 'kebab'],
  component: 'TextCaseConverter'
  },
  {
  id: 'json-formatter',
  title: 'JSON Formatter / Validator',
  description: 'Validate, prettify, minify and inspect JSON',
  category: 'Data',
  tags: ['json', 'format', 'validate', 'prettify', 'minify', 'data'],
  component: 'JSONFormatter'
},
{
  id: 'qr-code-generator',
  title: 'QR Code Generator',
  description: 'Generate customizable QR codes for URLs, text, WiFi, contact info and more',
  category: 'Generation',
  tags: ['qr', 'code', 'generator', 'barcode', 'scan', 'mobile', 'wifi', 'url'],
  component: 'QRCodeGenerator'
}



];

export const categories = [...new Set(utilities.map(u => u.category))];
