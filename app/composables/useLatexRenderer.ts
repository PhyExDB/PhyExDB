import katex from 'katex'
import 'katex/dist/katex.min.css'

export function useLatexRenderer() {
    function renderLatex(text: string): string {
        if (!text) return text

        // Display math $$...$$ (multiline allowed)
        text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) =>
            katex.renderToString(formula.trim(), {
                displayMode: true,
                throwOnError: false,
            })
        )

        // Inline math $...$ (single-line)
        text = text.replace(/(?<!\$)\$([^\n$]+)\$(?!\$)/g, (_, formula) =>
            katex.renderToString(formula.trim(), {
                displayMode: false,
                throwOnError: false,
            })
        )

        return text
    }

    return { renderLatex }
}
