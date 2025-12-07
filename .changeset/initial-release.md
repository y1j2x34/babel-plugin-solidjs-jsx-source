---
"babel-plugin-solidjs-jsx-source": major
---

🎉 Initial release of babel-plugin-solidjs-jsx-source

A Babel plugin that adds source file and location information to JSX elements in SolidJS applications, enabling powerful debugging capabilities and development tools.

**Features:**
- 🔍 **Source Tracking**: Automatically inject source file location into JSX elements
- 🛠️ **Debugging Tools**: Enable click-to-source and other IDE integrations  
- ⚙️ **Configurable**: Customize attribute names and filter specific elements
- 🚀 **Zero Runtime Overhead**: Only active in development mode
- 💪 **TypeScript Support**: Fully typed for better developer experience

**Configuration Options:**
- `attribute`: Customize the attribute name (default: `data-source`)
- `ignoreTags`: List of JSX tag names to skip
- `disabled`: Disable the plugin entirely

**Integration:**
- ✅ Works with standard Babel configuration
- ✅ Seamless Vite integration via `vite-plugin-solid`
- ✅ Development mode best practices included

