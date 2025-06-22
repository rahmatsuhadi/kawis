// initialName.js
export default function getInitialName(fullName:string | null) {
  if (!fullName || typeof fullName !== 'string') return '';

  return fullName
    .trim()
    .split(/\s+/) // pisah berdasarkan spasi
    .map(name => name[0]?.toUpperCase())
    .join('');
}

