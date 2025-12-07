# babel-plugin-solidjs-jsx-source

A Babel plugin that adds source file and location information to JSX elements. This is useful for debugging and development tools (like opening the source file from the UI).

## Example

**In**

```jsx
<Component />
<div />
```

**Out**

```jsx
<Component data-source="src/App.tsx:5:1" />
<div data-source="src/App.tsx:6:1" />
```

## Installation

```bash
npm install --save-dev babel-plugin-solidjs-jsx-source
```

```bash
yarn add --dev babel-plugin-solidjs-jsx-source
```

```bash
pnpm add --save-dev babel-plugin-solidjs-jsx-source
```

## Usage

### With a configuration file (Recommended)

`babel.config.json`

```json
{
  "plugins": ["babel-plugin-solidjs-jsx-source"]
}
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `attribute` | `string` | `'data-source'` | The attribute name used to inject source location. |
| `ignoreTags` | `string[]` | `[]` | List of JSX tags to ignore. Elements with these tag names will not have the source attribute added. |
| `disabled` | `boolean` | `false` | Whether to disable the plugin entirely. |

#### Example with options

```json
{
  "plugins": [
    [
      "babel-plugin-solidjs-jsx-source",
      {
        "attribute": "__source",
        "ignoreTags": ["Fragment"]
      }
    ]
  ]
}
```
