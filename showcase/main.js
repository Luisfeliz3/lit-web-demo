import { createDemoVenues, demoVibe, filterVenues, simulateCheckIn } from "./data.js";
import { loadMapKit, isExpiredMapKitToken } from "../src/web/mapKit.js";
import { mapToken } from "./config.js";
const element = (id) => {
    const node = document.getElementById(id);
    if (!node)
        throw new Error(`Missing showcase element: ${id}`);
    return node;
};
let venues = createDemoVenues();
let filter = "All";
let selectedId = venues[0].id;
let map;
let kit;
let fallback = false;
let pins = new Map();
const simulations = new Map();
const visible = () => filterVenues(venues, filter);
const select = (id) => {
    selectedId = id;
    render();
    if (window.matchMedia("(max-width: 760px)").matches) {
        element("detail").scrollIntoView({ block: "nearest" });
    }
};
const button = (text, onClick) => {
    const node = document.createElement("button");
    node.type = "button";
    node.textContent = text;
    node.addEventListener("click", onClick);
    return node;
};
const filters = ["All", "Nightclub", "Lounge", "Bar", "Restaurant"];
const filterLabels = ["All", "Nightclubs", "Lounges", "Bars", "Restaurants"];
filters.forEach((type, i) => {
    const node = button(filterLabels[i], () => {
        filter = type;
        const matches = visible();
        if (!matches.some((venue) => venue.id === selectedId))
            selectedId = matches[0]?.id ?? "";
        render();
    });
    node.dataset.type = type;
    element("filters").append(node);
});
const renderPins = () => {
    const matches = visible();
    if (map && kit) {
        const currentMap = map;
        const currentKit = kit;
        pins = new Map();
        currentMap.annotations = matches.map((venue) => {
            const pin = new currentKit.MarkerAnnotation(new currentKit.Coordinate(venue.latitude, venue.longitude), { title: `${venue.name} · ${demoVibe(venue).text}`, glyphText: String(venue.currentCount), color: demoVibe(venue).color });
            pin.addEventListener("select", () => {
                // Programmatic selection must not cause a render/selection loop.
                if (selectedId !== venue.id)
                    select(venue.id);
            });
            pins.set(venue.id, pin);
            return pin;
        });
        currentMap.selectedAnnotation = pins.get(selectedId) ?? null;
        const selected = matches.find((venue) => venue.id === selectedId);
        if (selected)
            currentMap.center = new currentKit.Coordinate(selected.latitude, selected.longitude);
    }
    if (fallback) {
        const container = element("fallback-pins");
        container.replaceChildren();
        matches.forEach((venue) => {
            const pin = button(`${demoVibe(venue).text} · ${venue.name}`, () => select(venue.id));
            pin.style.color = demoVibe(venue).color;
            pin.setAttribute("aria-pressed", String(venue.id === selectedId));
            container.append(pin);
        });
    }
};
const renderDetail = () => {
    const venue = visible().find((item) => item.id === selectedId);
    const panel = element("detail");
    panel.replaceChildren();
    if (!venue) {
        panel.textContent = "Pick a venue to see its demo activity.";
        return;
    }
    const status = demoVibe(venue);
    const summary = document.createElement("div");
    const label = document.createElement("span");
    label.className = "status";
    label.style.color = status.color;
    label.textContent = `${status.text} / SIMULATED`;
    const title = document.createElement("h2");
    title.textContent = venue.name;
    const metadata = document.createElement("p");
    metadata.textContent = `${venue.type} · ${venue.neighborhood} · ${venue.music}`;
    const counts = document.createElement("p");
    counts.textContent = `${venue.currentCount} demo guests / ${venue.capacity} capacity · ${Math.floor(venue.currentCount / venue.capacity * 100)}% occupancy`;
    const meter = document.createElement("div");
    meter.className = "meter";
    const progress = document.createElement("span");
    progress.style.width = `${venue.currentCount / venue.capacity * 100}%`;
    progress.style.background = status.color;
    meter.append(progress);
    summary.append(label, title, metadata, counts, meter);
    const activity = document.createElement("div");
    const activityTitle = document.createElement("strong");
    activityTitle.textContent = "Demo activity";
    const activityText = document.createElement("p");
    activityText.textContent = simulations.has(venue.id) ? `${simulations.get(venue.id)} simulated check-in(s) in this session. ${venue.activity}` : venue.activity;
    activity.append(activityTitle, activityText);
    const actions = document.createElement("div");
    actions.className = "simulation";
    const simulate = button(venue.currentCount >= venue.capacity ? "Demo capacity reached" : "Simulate a check-in +1", () => {
        const updated = simulateCheckIn(venue);
        venues = venues.map((item) => item.id === venue.id ? updated : item);
        simulations.set(venue.id, (simulations.get(venue.id) ?? 0) + 1);
        element("announcement").textContent = `${venue.name}: ${venue.currentCount} → ${updated.currentCount} demo guests. ${status.text} → ${demoVibe(updated).text}.`;
        render();
        // Rendering replaces the button; retain keyboard focus for repeated trials.
        panel.querySelector("button")?.focus({ preventScroll: true });
    });
    simulate.className = "primary";
    simulate.disabled = venue.currentCount >= venue.capacity;
    const caption = document.createElement("small");
    caption.textContent = "Just a simulation. Reset anytime.";
    actions.append(simulate, caption);
    panel.append(summary, activity, actions);
};
const render = () => {
    element("filters").querySelectorAll("button").forEach((node) => node.setAttribute("aria-pressed", String(node.dataset.type === filter)));
    const list = element("venues");
    list.replaceChildren();
    const matches = visible();
    element("result-count").textContent = `${matches.length} spots`;
    matches.forEach((venue) => {
        const status = demoVibe(venue);
        const row = button("", () => select(venue.id));
        row.className = "venue";
        row.setAttribute("aria-pressed", String(venue.id === selectedId));
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.background = status.color;
        const info = document.createElement("span");
        info.className = "info";
        const name = document.createElement("strong");
        name.textContent = venue.name;
        const description = document.createElement("small");
        description.textContent = `${venue.type} · ${venue.neighborhood}`;
        info.append(name, description);
        const badge = document.createElement("span");
        badge.className = "status";
        badge.style.color = status.color;
        badge.textContent = `${status.text} · ${venue.currentCount}`;
        row.append(dot, info, badge);
        list.append(row);
    });
    renderDetail();
    renderPins();
};
element("reset").addEventListener("click", () => {
    venues = createDemoVenues();
    filter = "All";
    selectedId = venues[0].id;
    simulations.clear();
    element("announcement").textContent = "Demo reset. Afterglow Social is one simulated check-in away from LIT.";
    render();
});
const showFallback = () => {
    fallback = true;
    element("map").parentElement?.classList.add("fallback");
    const message = element("map-message");
    message.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = "Your night is still on.";
    const description = document.createElement("p");
    description.textContent = "Apple Maps tiles are unavailable. Pick a demo venue here or in the list to explore and simulate a check-in.";
    const container = document.createElement("div");
    container.id = "fallback-pins";
    container.className = "schematic-pins";
    const retry = button("Retry map", () => window.location.reload());
    retry.className = "text-button";
    message.append(title, description, container, retry);
    renderPins();
};
render();
if (!mapToken || isExpiredMapKitToken(mapToken)) {
    showFallback();
}
else {
    loadMapKit(mapToken).then((loadedKit) => {
        kit = loadedKit;
        map = new kit.Map(element("map"), {
            region: new kit.CoordinateRegion(new kit.Coordinate(40.724, -73.982), new kit.CoordinateSpan(0.052, 0.065)),
            colorScheme: "dark",
        });
        element("map-message").hidden = true;
        renderPins();
    }).catch(showFallback);
}
window.addEventListener("pagehide", (event) => {
    if (!event.persisted)
        map?.destroy();
});
