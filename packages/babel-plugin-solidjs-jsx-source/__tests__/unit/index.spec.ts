import { transformSync } from '@babel/core';
import solidJSXSourcePlugin from '../../src/index';
import { describe, it, expect } from 'vitest';

/**
 * Helper function to transform SolidJS JSX code using the plugin
 */
function transformCode(code: string, options?: any, filename = 'test.tsx') {
    const result = transformSync(code, {
        filename,
        plugins: [[solidJSXSourcePlugin, options]],
        parserOpts: {
            plugins: ['jsx', 'typescript'],
        },
    });
    return result?.code || '';
}

describe('babel-plugin-solidjs-jsx-source', () => {
    describe('basic functionality', () => {
        it('should add data-source attribute to JSX elements', () => {
            const input = `<div>Hello</div>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            expect(output).toContain('test.tsx:1:0');
        });

        it('should add data-source to self-closing JSX elements', () => {
            const input = `<Component />`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            expect(output).toContain('test.tsx:1:0');
        });

        it('should add data-source to multiple JSX elements', () => {
            const input = `
<div>
    <span>Text</span>
    <Component />
</div>`;
            const output = transformCode(input);

            // Should have multiple data-source attributes
            const matches = output.match(/data-source/g);
            expect(matches).toBeTruthy();
            expect(matches!.length).toBe(3); // div, span, Component
        });

        it('should add data-source to nested JSX elements', () => {
            const input = `
<div>
    <header>
        <h1>Title</h1>
    </header>
    <main>
        <p>Content</p>
    </main>
</div>`;
            const output = transformCode(input);

            const matches = output.match(/data-source/g);
            expect(matches).toBeTruthy();
            expect(matches!.length).toBe(5); // div, header, h1, main, p
        });

        it('should preserve existing JSX attributes', () => {
            const input = `<div className="container" id="main">Content</div>`;
            const output = transformCode(input);

            expect(output).toContain('className="container"');
            expect(output).toContain('id="main"');
            expect(output).toContain('data-source');
        });

        it('should handle SolidJS components', () => {
            const input = `<Show when={true}><div>Content</div></Show>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            // Both Show and div should have data-source
            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(2);
        });

        it('should handle SolidJS For component', () => {
            const input = `<For each={items}>{(item) => <div>{item}</div>}</For>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });
    });

    describe('custom attribute name', () => {
        it('should use custom attribute name when specified', () => {
            const input = `<div>Hello</div>`;
            const output = transformCode(input, { attribute: '__source' });

            expect(output).toContain('__source');
            expect(output).not.toContain('data-source');
            expect(output).toContain('test.tsx:1:0');
        });

        it('should use custom attribute name for multiple elements', () => {
            const input = `
<div>
    <span>Text</span>
</div>`;
            const output = transformCode(input, { attribute: 'data-location' });

            expect(output).toContain('data-location');
            expect(output).not.toContain('data-source');

            const matches = output.match(/data-location/g);
            expect(matches!.length).toBe(2);
        });
    });

    describe('ignoreTags option', () => {
        it('should ignore specified tags', () => {
            const input = `
<div>
    <Fragment>
        <span>Text</span>
    </Fragment>
</div>`;
            const output = transformCode(input, { ignoreTags: ['Fragment'] });

            // div and span should have data-source, but not Fragment
            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(2); // div and span only
        });

        it('should ignore multiple specified tags', () => {
            const input = `
<div>
    <Fragment>
        <Show when={true}>
            <span>Text</span>
        </Show>
    </Fragment>
</div>`;
            const output = transformCode(input, { ignoreTags: ['Fragment', 'Show'] });

            // Only div and span should have data-source
            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(2);
        });

        it('should not ignore tags when ignoreTags is empty', () => {
            const input = `
<div>
    <Fragment>
        <span>Text</span>
    </Fragment>
</div>`;
            const output = transformCode(input, { ignoreTags: [] });

            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(3); // all elements
        });
    });

    describe('disabled option', () => {
        it('should not add data-source when disabled is true', () => {
            const input = `<div>Hello</div>`;
            const output = transformCode(input, { disabled: true });

            expect(output).not.toContain('data-source');
        });

        it('should not modify code when disabled', () => {
            const input = `
<div className="container">
    <span>Text</span>
</div>`;
            const output = transformCode(input, { disabled: true });

            expect(output).not.toContain('data-source');
            // Should still contain original attributes
            expect(output).toContain('className="container"');
        });
    });

    describe('source location format', () => {
        it('should include correct line and column numbers', () => {
            const input = `
<div>
    <span>Line 3</span>
</div>`;
            const output = transformCode(input);

            // First element (div) is on line 2, column 0
            expect(output).toContain('test.tsx:2:0');
            // Second element (span) is on line 3
            expect(output).toContain('test.tsx:3:4');
        });

        it('should handle inline elements correctly', () => {
            const input = `<div><span>Inline</span></div>`;
            const output = transformCode(input);

            expect(output).toContain('test.tsx:1:0'); // div
            expect(output).toContain('test.tsx:1:5'); // span
        });
    });

    describe('filename handling', () => {
        it('should use provided filename in source attribute', () => {
            const input = `<div>Hello</div>`;
            const output = transformCode(input, {}, 'src/App.tsx');

            expect(output).toContain('src/App.tsx:1:0');
        });

        it('should handle different file extensions', () => {
            const input = `<div>Hello</div>`;
            const output = transformCode(input, {}, 'components/Button.jsx');

            expect(output).toContain('components/Button.jsx:1:0');
        });

        it('should handle unknown filename', () => {
            const input = `<div>Hello</div>`;
            const result = transformSync(input, {
                filename: 'unknown',
                plugins: [solidJSXSourcePlugin],
                parserOpts: {
                    plugins: ['jsx', 'typescript'],
                },
            });

            expect(result?.code).toContain('unknown:1:0');
        });
    });

    describe('edge cases', () => {
        it('should not add duplicate data-source if already exists', () => {
            const input = `<div data-source="existing">Hello</div>`;
            const output = transformCode(input);

            // Should only have one data-source attribute
            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(1);
            // Should keep the existing value
            expect(output).toContain('data-source="existing"');
        });

        it('should handle JSX fragments (SolidJS style)', () => {
            const input = `
<>
    <div>First</div>
    <div>Second</div>
</>`;
            const output = transformCode(input);

            // Should add data-source to div elements
            const matches = output.match(/data-source/g);
            expect(matches).toBeTruthy();
            expect(matches!.length).toBeGreaterThanOrEqual(2);
        });

        it('should handle elements with spread attributes', () => {
            const input = `<div {...props}>Content</div>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });

        it('should handle elements with event handlers (SolidJS style)', () => {
            const input = `<button onClick={handleClick}>Click me</button>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            expect(output).toContain('onClick');
        });

        it('should handle SolidJS reactive attributes', () => {
            const input = `<div class={className()} style={styles()}>Content</div>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            expect(output).toContain('class');
            expect(output).toContain('style');
        });

        it('should handle empty JSX elements', () => {
            const input = `<div></div>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });

        it('should handle JSX with expressions', () => {
            const input = `<div>{count()}</div>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });

        it('should handle conditional rendering (SolidJS style)', () => {
            const input = `<Show when={isVisible()}><div>Visible</div></Show>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });
    });

    describe('sourceRoot handling', () => {
        it('should strip sourceRoot from filename', () => {
            const input = `<div>Hello</div>`;
            const result = transformSync(input, {
                filename: '/project/src/App.tsx',
                sourceRoot: '/project/',
                plugins: [solidJSXSourcePlugin],
                parserOpts: {
                    plugins: ['jsx', 'typescript'],
                },
            });

            expect(result?.code).toContain('src/App.tsx:1:0');
            expect(result?.code).not.toContain('/project/');
        });
    });

    describe('plugin should not run twice', () => {
        it('should only process the file once even with multiple plugin instances', () => {
            const input = `<div>Hello</div>`;
            const result = transformSync(input, {
                filename: 'test.tsx',
                plugins: [
                    [solidJSXSourcePlugin, {}],
                    [solidJSXSourcePlugin, {}, 'instance-2'],
                ],
                parserOpts: {
                    plugins: ['jsx', 'typescript'],
                },
            });

            // Should only have one data-source attribute per element
            const matches = result?.code?.match(/data-source/g);
            expect(matches!.length).toBe(1);
        });
    });

    describe('SolidJS specific components', () => {
        it('should handle SolidJS Switch component', () => {
            const input = `
<Switch>
    <Match when={condition1}><div>Case 1</div></Match>
    <Match when={condition2}><div>Case 2</div></Match>
</Switch>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
            // Switch, 2 Match, 2 div
            const matches = output.match(/data-source/g);
            expect(matches!.length).toBe(5);
        });

        it('should handle SolidJS Portal component', () => {
            const input = `<Portal><div>Portaled content</div></Portal>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });

        it('should handle SolidJS Dynamic component', () => {
            const input = `<Dynamic component={comp}><span>Child</span></Dynamic>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });

        it('should handle SolidJS ErrorBoundary', () => {
            const input = `
<ErrorBoundary fallback={<div>Error</div>}>
    <div>Content</div>
</ErrorBoundary>`;
            const output = transformCode(input);

            expect(output).toContain('data-source');
        });
    });

    describe('combined options', () => {
        it('should work with both custom attribute and ignoreTags', () => {
            const input = `
<div>
    <Fragment>
        <span>Text</span>
    </Fragment>
</div>`;
            const output = transformCode(input, {
                attribute: '__source',
                ignoreTags: ['Fragment'],
            });

            expect(output).toContain('__source');
            expect(output).not.toContain('data-source');

            // div and span should have __source, but not Fragment
            const matches = output.match(/__source/g);
            expect(matches!.length).toBe(2);
        });

        it('should work with custom attribute and multiple ignored tags', () => {
            const input = `
<div>
    <Show when={true}>
        <For each={items}>
            <span>Item</span>
        </For>
    </Show>
</div>`;
            const output = transformCode(input, {
                attribute: 'data-loc',
                ignoreTags: ['Show', 'For'],
            });

            expect(output).toContain('data-loc');
            // Only div and span
            const matches = output.match(/data-loc/g);
            expect(matches!.length).toBe(2);
        });
    });
});
