import { useEffect, useState } from 'react'

interface AnimatedHeadingProps {
  text: string
  className?: string
  initialDelay?: number
  charDelay?: number
}

export default function AnimatedHeading({
  text,
  className = '',
  initialDelay = 200,
  charDelay = 30,
}: AnimatedHeadingProps) {
  const [visibleChars, setVisibleChars] = useState<Set<string>>(new Set())

  const lines = text.split('\n')

  const charKeys: string[] = []
  lines.forEach((line, li) => {
    line.split('').forEach((_, ci) => {
      charKeys.push(`${li}-${ci}`)
    })
  })

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    lines.forEach((line, lineIndex) => {
      const prevLineChars = lines
        .slice(0, lineIndex)
        .reduce((acc, l) => acc + l.length, 0)

      line.split('').forEach((_, charIndex) => {
        const globalIndex = prevLineChars + charIndex
        const delay = initialDelay + globalIndex * charDelay
        const key = `${lineIndex}-${charIndex}`
        const t = setTimeout(() => {
          setVisibleChars(prev => new Set(prev).add(key))
        }, delay)
        timers.push(t)
      })
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} style={{ display: 'block' }}>
          {line.split('').map((char, charIndex) => {
            const key = `${lineIndex}-${charIndex}`
            const visible = visibleChars.has(key)
            return (
              <span
                key={charIndex}
                style={{
                  display: 'inline-block',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-18px)',
                  transition: 'opacity 500ms ease, transform 500ms ease',
                  whiteSpace: 'pre',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}
