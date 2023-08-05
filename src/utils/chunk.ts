export const chunk = (content: string, limit: number): string[] => {
  const chunks = []
  let start = 0
  let end = limit

  while (start < content.length) {
    end = start + limit

    if (end >= content.length) {
      chunks.push(content.slice(start))
      break
    }

    const last_newline = content.lastIndexOf('\n', end)
    if (last_newline !== -1 && last_newline > start) {
      end = last_newline
    }

    chunks.push(content.slice(start, end))

    start = end + 1
  }

  return chunks
}
