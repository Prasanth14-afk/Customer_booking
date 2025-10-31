// Route code to friendly name mapping
export const ROUTE_NAMES: Record<string, string> = {
  'AKLDEL': 'Auckland → Delhi',
  'AKLHGH': 'Auckland → Hangzhou',
  'AKLHND': 'Auckland → Tokyo (Haneda)',
  'AKLICN': 'Auckland → Seoul (Incheon)',
  'AKLKIX': 'Auckland → Osaka (Kansai)',
  'AKLKTM': 'Auckland → Kathmandu',
  'AKLKUL': 'Auckland → Kuala Lumpur',
  'AKLNRT': 'Auckland → Tokyo (Narita)',
  'AKLPVG': 'Auckland → Shanghai',
  'AKLSIN': 'Auckland → Singapore',
  'AKLTPE': 'Auckland → Taipei',
  'MELBKK': 'Melbourne → Bangkok',
  'MELDEL': 'Melbourne → Delhi',
  'MELHKG': 'Melbourne → Hong Kong',
  'MELSIN': 'Melbourne → Singapore',
  'SYDBKK': 'Sydney → Bangkok',
  'SYDDEL': 'Sydney → Delhi',
  'SYDHKG': 'Sydney → Hong Kong',
  'SYDSIN': 'Sydney → Singapore',
}

/**
 * Get friendly name for a route code
 * Falls back to original code if no mapping exists
 */
export function getRouteName(routeCode: string): string {
  return ROUTE_NAMES[routeCode] || routeCode
}

/**
 * Get all route codes from the mapping
 */
export function getAllRouteCodes(): string[] {
  return Object.keys(ROUTE_NAMES)
}
