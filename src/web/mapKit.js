let mapKitPromise;
export const loadMapKit = (token) => {
    mapKitPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const fail = () => {
            window.clearTimeout(scriptTimeout);
            script.remove();
            reject(new Error("MapKit JS did not initialize."));
        };
        const scriptTimeout = window.setTimeout(fail, 15000);
        script.src = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";
        script.async = true;
        script.onerror = fail;
        script.onload = () => {
            window.clearTimeout(scriptTimeout);
            const { mapkit } = window;
            if (!mapkit) {
                fail();
                return;
            }
            const cleanup = () => {
                window.clearTimeout(timeout);
                mapkit.removeEventListener("configuration-change", ready);
                mapkit.removeEventListener("error", failed);
            };
            const ready = () => {
                cleanup();
                resolve(mapkit);
            };
            const failed = () => {
                cleanup();
                fail();
            };
            const timeout = window.setTimeout(failed, 15000);
            mapkit.addEventListener("configuration-change", ready);
            mapkit.addEventListener("error", failed);
            try {
                mapkit.init({ authorizationCallback: (done) => done(token) });
            }
            catch {
                failed();
            }
        };
        document.head.appendChild(script);
    });
    return mapKitPromise;
};
export const isExpiredMapKitToken = (token) => {
    const payload = token.split(".")[1];
    if (!payload)
        return false;
    try {
        const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return typeof claims.exp === "number" && claims.exp * 1000 <= Date.now();
    }
    catch {
        return false;
    }
};
