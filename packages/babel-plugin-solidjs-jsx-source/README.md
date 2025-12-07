# babel-plugin-solidjs-jsx-source

A Babel plugin that adds source file and location information to JSX elements. This enables powerful debugging capabilities and development tools, such as click-to-source functionality in browser DevTools.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/5b39ba8d02e34b359339bfca0406e2c8)](https://app.codacy.com/gh/y1j2x34/babel-plugin-solidjs-jsx-source/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![npm version](https://img.shields.io/npm/v/babel-plugin-solidjs-jsx-source.svg)](https://www.npmjs.com/package/babel-plugin-solidjs-jsx-source)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Features

- 🔍 **Source Tracking**: Automatically inject source file location into JSX elements
- 🛠️ **Debugging Tools**: Enable click-to-source and other IDE integrations
- ⚙️ **Configurable**: Customize attribute names and filter specific elements
- 🚀 **Zero Runtime Overhead**: Only active in development mode
- 💪 **TypeScript Support**: Fully typed for better DX

## 📦 Installation

```bash
# npm
npm install --save-dev babel-plugin-solidjs-jsx-source

# yarn
yarn add --dev babel-plugin-solidjs-jsx-source

# pnpm
pnpm add --save-dev babel-plugin-solidjs-jsx-source
```

## 🚀 Quick Start

### Babel Configuration

Add the plugin to your Babel configuration:

**babel.config.json**

```json
{
  "plugins": ["babel-plugin-solidjs-jsx-source"]
}
```

**babel.config.js**

```javascript
module.exports = {
  plugins: ['babel-plugin-solidjs-jsx-source']
};
```

### Vite Integration

For Vite projects using `vite-plugin-solid`:

**vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solid({
      babel: {
        plugins: [['babel-plugin-solidjs-jsx-source', { /* options */ }]]
      }
    })
  ]
});
```

## 📖 How It Works

The plugin transforms your JSX code by adding source location attributes:

### Input

```jsx
function App() {
  return (
    <div>
      <Component />
      <span>Hello World</span>
    </div>
  );
}
```

### Output

```jsx
function App() {
  return (
    <div data-source="src/App.tsx:3:5">
      <Component data-source="src/App.tsx:4:7" />
      <span data-source="src/App.tsx:5:7">Hello World</span>
    </div>
  );
}
```

The format is: `filename:line:column`

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `attribute` | `string` | `'data-source'` | The attribute name used to inject source location |
| `ignoreTags` | `string[]` | `[]` | List of JSX tag names to skip (e.g., `['Fragment', 'Show']`) |
| `disabled` | `boolean` | `false` | Disable the plugin entirely |

### Advanced Configuration Example

```json
{
  "plugins": [
    [
      "babel-plugin-solidjs-jsx-source",
      {
        "attribute": "__source",
        "ignoreTags": ["Fragment", "Show", "For"],
        "disabled": false
      }
    ]
  ]
}
```

## 💡 Usage Examples

### Development Only

Enable the plugin only in development mode:

**babel.config.js**

```javascript
module.exports = {
  plugins: [
    process.env.NODE_ENV === 'development' && 'babel-plugin-solidjs-jsx-source'
  ].filter(Boolean)
};
```

### Custom Attribute Name

Use a custom attribute name for compatibility with other tools:

```json
{
  "plugins": [
    [
      "babel-plugin-solidjs-jsx-source",
      {
        "attribute": "data-debug-source"
      }
    ]
  ]
}
```

### Ignoring Specific Components

Skip adding source info to specific components:

```json
{
  "plugins": [
    [
      "babel-plugin-solidjs-jsx-source",
      {
        "ignoreTags": ["Portal", "Suspense", "ErrorBoundary"]
      }
    ]
  ]
}
```

## 🎨 Use Cases

### Click-to-Source in DevTools

Integrate with browser extensions or dev tools to navigate from rendered elements to source code:

```javascript
// Example: Click handler to open source in editor
document.addEventListener('click', (e) => {
  if (e.metaKey || e.ctrlKey) {
    const source = e.target.getAttribute('data-source');
    if (source) {
      // Open in your editor (VSCode, WebStorm, etc.)
      fetch(`/__open-in-editor?file=${source}`);
    }
  }
});
```

### Component Inspector

Build custom dev tools that display component hierarchy with source locations:

```javascript
function inspectElement(element) {
  const source = element.getAttribute('data-source');
  console.log(`Component rendered from: ${source}`);
}
```

### Error Reporting

Enhance error reports with precise source locations:

```javascript
function trackError(error, element) {
  const source = element.getAttribute('data-source');
  reportError({
    message: error.message,
    sourceLocation: source,
    stackTrace: error.stack
  });
}
```

## 🔧 Troubleshooting

### Plugin Not Working

1. **Check Babel is processing your files**: Ensure `.babelrc` or `babel.config.js` is properly configured
2. **Verify NODE_ENV**: If conditionally applied, check `NODE_ENV === 'development'`
3. **Check build output**: Inspect compiled code to verify attributes are added

### Attributes Not Appearing

- **Ignored tags**: Check if your component is in the `ignoreTags` list
- **Build optimization**: Some bundlers may strip attributes in production builds
- **Caching**: Clear your build cache and rebuild

### Performance Concerns

The plugin only adds static strings and has negligible impact on bundle size or runtime performance. For production builds, simply disable the plugin:

```javascript
{
  plugins: [
    process.env.NODE_ENV !== 'production' && 'babel-plugin-solidjs-jsx-source'
  ].filter(Boolean)
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🔗 Related Projects

- [babel-plugin-jsx-source](https://github.com/babel/babel/tree/main/packages/babel-plugin-transform-react-jsx-source) - React's official JSX source transform
- [vite-plugin-solid](https://github.com/solidjs/vite-plugin-solid) - Vite plugin for SolidJS

## 📝 Changelog

See [Releases](https://github.com/y1j2x34/babel-plugin-solidjs-jsx-source/releases) for detailed version history.
