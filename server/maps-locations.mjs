export const maxMapsLocations = 5;
export const maxMapsLocationLength = 120;

export function parseMapsLocations(value) {
  if (typeof value !== 'string' || value.length > maxMapsLocationLength || /[\x00-\x1f]|#!#/.test(value)) return [];
  const locations = value.split(';').map(location => location.trim()).filter(Boolean);
  const unique = [...new Map(locations.map(location => [location.normalize('NFC').toLowerCase(), location])).values()];
  return unique.length <= maxMapsLocations ? unique : [];
}

export function mapsQueryFile(keywords, locations) {
  if (locations.length === 1) return `${keywords} in ${locations[0]}\n`;
  return locations.map((location, index) => `${keywords} in ${location} #!#clinahir-${index}`).join('\n') + '\n';
}

export function mapsResultCity(addressCity, inputId, locations) {
  const id = /^clinahir-(\d+)$/.exec(inputId ?? '');
  const location = id ? locations[Number(id[1])] : locations.length === 1 ? locations[0] : '';
  return (typeof addressCity === 'string' && addressCity.trim()) || location?.split(',')[0].trim() || '';
}
