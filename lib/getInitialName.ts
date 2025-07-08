
export default function getInitialName(fullName: string | null) {
  if (!fullName || typeof fullName !== 'string') return '';

  return fullName
    .trim()
    .split(/\s+/) // Split by whitespace
    .slice(0, 2) // Limit to the first 2 words
    .map(name => name[0]?.toUpperCase()) // Take the first letter and make it uppercase
    .join(''); // Join the initials together
}