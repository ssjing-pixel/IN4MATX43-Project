import { haversineDistance } from '../../src/utils/distance';

// UCI coordinates
const UCI_LAT = 33.6405;
const UCI_LNG = -117.8443;

// Downtown Los Angeles
const LA_LAT = 34.0522;
const LA_LNG = -118.2437;

describe('haversineDistance unit tests', () => {
  test('distance between the same point is 0', () => {
    const dist = haversineDistance(UCI_LAT, UCI_LNG, UCI_LAT, UCI_LNG);
    expect(dist).toBeCloseTo(0, 5);
  });

  test('distance between UCI and a nearby point is small (< 1 mile)', () => {
    // Point roughly 0.1 degrees lat away ~0.7 miles
    const nearbyLat = UCI_LAT + 0.001;
    const nearbyLng = UCI_LNG + 0.001;
    const dist = haversineDistance(UCI_LAT, UCI_LNG, nearbyLat, nearbyLng);
    expect(dist).toBeLessThan(1);
    expect(dist).toBeGreaterThan(0);
  });

  test('distance between UCI and Los Angeles is roughly correct (20–40 miles)', () => {
    const dist = haversineDistance(UCI_LAT, UCI_LNG, LA_LAT, LA_LNG);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(40);
  });

  test('distance is symmetric (A→B equals B→A)', () => {
    const distAB = haversineDistance(UCI_LAT, UCI_LNG, LA_LAT, LA_LNG);
    const distBA = haversineDistance(LA_LAT, LA_LNG, UCI_LAT, UCI_LNG);
    expect(distAB).toBeCloseTo(distBA, 8);
  });
});
