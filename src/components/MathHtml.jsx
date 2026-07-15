import { useRef, useLayoutEffect } from 'react'
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs'

const DELIMS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
]

// Renders an HTML fragment and typesets any KaTeX math inside it.
export default function MathHtml({ html, className }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    try {
      renderMathInElement(el, {
        delimiters: DELIMS,
        throwOnError: false,
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
      })
    } catch {
      /* KaTeX errors are swallowed; raw text stays visible */
    }
  }, [html])

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html || '' }}
    />
  )
}
