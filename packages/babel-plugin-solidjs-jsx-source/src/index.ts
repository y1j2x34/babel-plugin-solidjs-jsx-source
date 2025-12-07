import type { PluginObj, PluginPass } from '@babel/core';
import type { NodePath, Visitor } from '@babel/traverse';
import type { JSXOpeningElement } from '@babel/types';

interface SolidJSXSourcePluginOptions {
    /**
     * List of JSX tags to ignore.
     * Elements with these tag names will not have the source attribute added.
     * @default []
     */
    ignoreTags?: string[];
    /**
     * The attribute name used to inject source location.
     * @default 'data-source'
     */
    attribute?: string;
    /**
     * Whether to disable the plugin entirely.
     * @default false
     */
    disabled?: boolean;
}
const DEFAULT_ATTRIBUTE_NAME = 'data-source';

function resolveFilename({ filename, sourceRoot }: { filename?: string | null; sourceRoot?: string | null }) {
    if (!filename || filename === 'unknown') {
        return 'unknown';
    }
    if (sourceRoot) {
        return filename.slice(sourceRoot.length);
    }
    return filename;
}

const FIELD_FOR_MARK_SOURCE_VISITED = '@@babel-plugin-solidjs-jsx-source-visited';

export default function ({ types: t }: { types: typeof import('@babel/types') }): PluginObj<PluginPass> {
    const visitor: Visitor<PluginPass> = {
        Program(path, state) {
            const options = (state.opts ?? {}) as SolidJSXSourcePluginOptions;
            if (options.disabled) {
                return;
            }
            const file = state.file as any;
            if (file.get(FIELD_FOR_MARK_SOURCE_VISITED)) {
                return;
            }
            file.set(FIELD_FOR_MARK_SOURCE_VISITED, true);

            const tagsToExclude = options.ignoreTags ?? [];
            const attributeName = options.attribute ?? DEFAULT_ATTRIBUTE_NAME;
            const fileName = resolveFilename(state.file.opts) ?? 'unknown';

            path.traverse({
                JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
                    const node = path.node;
                    const { name, loc } = node;

                    if (!loc) {
                        return;
                    }
                    if (name && name.type === 'JSXIdentifier' && tagsToExclude.includes(name.name)) {
                        return;
                    }

                    const { line, column } = loc.start;

                    const locationString = `${fileName}:${line}:${column}`;

                    const hasSourceLoc = node.attributes.some(attr => {
                        return attr.type === 'JSXAttribute' && attr.name && attr.name.name === attributeName;
                    });

                    if (hasSourceLoc) {
                        return;
                    }
                    const attribute = t.jsxAttribute(t.jsxIdentifier(attributeName), t.stringLiteral(locationString));
                    node.attributes.push(attribute);
                },
            });
        },
    };
    return {
        name: 'babel-plugin-solidjs-jsx-source',
        visitor,
    };
}
