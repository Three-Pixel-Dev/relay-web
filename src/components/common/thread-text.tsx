interface ThreadTextProps {
  text: string
}

export function ThreadText({ text }: ThreadTextProps) {
  const parts = text.split(/(\*\*.+?\*\*)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <b key={index}>{part.slice(2, -2)}</b>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  )
}
