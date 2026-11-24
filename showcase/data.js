import { calculateBusyStatus, getBusyStatusDisplay } from "../src/services/occupancy.js";
// Fictional venues at illustrative NYC coordinates. Never written to Firebase.
export const createDemoVenues = () => [
    { id: "afterglow", name: "Afterglow Social", type: "Lounge", neighborhood: "Lower East Side", latitude: 40.7205, longitude: -73.9874, capacity: 100, currentCount: 49, music: "R&B · Soul", activity: "The DJ just switched to the late-night set." },
    { id: "neon", name: "Neon Room", type: "Nightclub", neighborhood: "East Village", latitude: 40.7278, longitude: -73.9852, capacity: 200, currentCount: 136, music: "House · Electronic", activity: "Dance floor energy is picking up." },
    { id: "juniper", name: "Juniper & Vinyl", type: "Bar", neighborhood: "SoHo", latitude: 40.7244, longitude: -74.0013, capacity: 80, currentCount: 24, music: "Disco · Funk", activity: "Vinyl spinning, conversation flowing." },
    { id: "rooftop", name: "Moonline Terrace", type: "Lounge", neighborhood: "Williamsburg", latitude: 40.7168, longitude: -73.9615, capacity: 120, currentCount: 54, music: "Afrobeats", activity: "A few friends just arrived for the skyline." },
    { id: "supper", name: "Midnight Table", type: "Restaurant", neighborhood: "West Village", latitude: 40.7336, longitude: -74.0048, capacity: 60, currentCount: 0, music: "Jazz", activity: "A quiet moment before the evening crowd." },
];
export const demoVibe = (venue) => getBusyStatusDisplay(calculateBusyStatus(venue.currentCount, venue.capacity));
export const simulateCheckIn = (venue) => ({
    ...venue, currentCount: Math.min(venue.capacity, venue.currentCount + 1),
});
export const filterVenues = (venues, type) => type === "All" ? venues : venues.filter((venue) => venue.type === type);
