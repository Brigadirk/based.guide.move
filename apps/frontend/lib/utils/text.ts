const REPLACEMENTS: Array<[RegExp, string]> = [
  [/^(?:[Aa]re)\s+you\b/, "I am"],
  [/^(?:[Dd]o)\s+you\s+have\b/, "I have"],
  [/^(?:[Dd]o)\s+you\b/, "I"],
  [/^(?:[Ww]ill)\s+you\b/, "I will"],
  [/^(?:[Hh]ave)\s+you\b/, "I have"],
  [/^(?:[Yy]our)\b/, "My"],
  [/^(?:[Yy]ou)\b/, "I"],
]

/**
 * Converts a prompt written in second-person (“Do you have…”) to first-person (“I have…”).
 * Only modifies phrases at the beginning of the string, mirroring Streamlit behaviour.
 */
export function toFirstPerson(text: string): string {
  let converted = text
  for (const [pat, repl] of REPLACEMENTS) {
    converted = converted.replace(pat, repl)
  }
  // strip trailing question mark if present and add period
  if (converted.trim().endsWith("?")) {
    converted = converted.replace(/\?\s*$/, ".")
  }
  return converted
} 