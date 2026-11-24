// Shared, side-effect-free occupancy rules for the app and public demo.
export const calculateBusyStatus = (currentCount, capacity) => {
    if (currentCount <= 0)
        return "quiet";
    if (capacity === null || !Number.isFinite(capacity) || capacity <= 0)
        return "unknown";
    const occupancy = currentCount / capacity;
    if (occupancy >= 0.5)
        return "lit";
    if (occupancy >= 0.4)
        return "busy";
    return "mellow";
};
export const getBusyStatusDisplay = (status) => {
    switch (status) {
        case "closed":
            return { text: "Closed", color: "#888888", emoji: "⚪", fireEmoji: "" };
        case "quiet":
            return { text: "Quiet", color: "#888888", emoji: "⚪", fireEmoji: "" };
        case "unknown":
            return { text: "Capacity unknown", color: "#888888", emoji: "⚪", fireEmoji: "" };
        case "lit":
            return { text: "LIT 🔥", color: "#FF3B30", emoji: "🔴", fireEmoji: "🔥" };
        case "busy":
            return { text: "Busy", color: "#00FF88", emoji: "🟢", fireEmoji: "" };
        case "mellow":
            return { text: "Mellow", color: "#FFCC00", emoji: "🟡", fireEmoji: "" };
    }
};
