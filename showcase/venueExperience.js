import { demoVibe } from "./data.js";
import { addDemoComment, addDemoPost, createDemoPosts, DEMO_MEDIA, visibleDemoPosts } from "./experienceData.js";
const text = (tag, value, className = "") => {
    const node = document.createElement(tag);
    node.textContent = value;
    node.className = className;
    return node;
};
const action = (label, handler, className = "text-button") => {
    const node = text("button", label, className);
    node.type = "button";
    node.addEventListener("click", handler);
    return node;
};
const image = (src, alt) => {
    const node = document.createElement("img");
    node.src = src;
    node.alt = alt;
    node.loading = "lazy";
    return node;
};
export const createVenueExperience = () => {
    const dialog = document.createElement("dialog");
    dialog.className = "experience-dialog";
    dialog.setAttribute("aria-label", "Demo venue experience");
    document.body.append(dialog);
    let posts = [];
    let venue;
    let inVenue = true;
    let timer;
    let opener = null;
    const stopVideos = () => dialog.querySelectorAll("video").forEach((video) => video.pause());
    dialog.addEventListener("close", () => {
        stopVideos();
        if (timer)
            clearInterval(timer);
        document.body.classList.remove("experience-open");
        opener?.focus({ preventScroll: true });
    });
    const render = () => {
        if (!venue)
            return;
        const currentVenue = venue;
        stopVideos();
        dialog.replaceChildren();
        const toolbar = text("div", "", "experience-toolbar");
        toolbar.append(text("span", "LIT / VENUE DEMO", "eyebrow"), action("← Back to map", () => dialog.close()));
        const hero = text("div", "", "experience-hero");
        const cover = currentVenue.type === "Nightclub" ? DEMO_MEDIA.club : currentVenue.type === "Bar" ? DEMO_MEDIA.bar : DEMO_MEDIA.cover;
        hero.append(image(cover, "AI-generated scene for this fictional demo venue"), text("span", "AI-GENERATED DEMO CONTENT", "media-badge"));
        const heading = text("div", "", "experience-heading");
        const status = demoVibe(currentVenue);
        const vibe = text("span", `${status.text} · SIMULATED`, "status");
        vibe.style.color = status.color;
        heading.append(vibe, text("h2", currentVenue.name), text("p", `${currentVenue.type} · ${currentVenue.neighborhood} · ${currentVenue.music}`), text("p", `${currentVenue.currentCount} demo guests · ${Math.floor(currentVenue.currentCount / currentVenue.capacity * 100)}% estimated occupancy`));
        const controls = text("section", "", "presence-demo");
        controls.setAttribute("aria-label", "Simulate venue location");
        const modes = text("div", "", "presence-modes");
        [true, false].forEach((inside) => {
            const node = action(inside ? "📍 In venue (demo)" : "Outside (demo)", () => { inVenue = inside; render(); }, "mode-button");
            node.setAttribute("aria-pressed", String(inVenue === inside));
            modes.append(node);
        });
        const explanation = text("p", inVenue ? "You’re previewing the in-venue experience. Try posting a demo photo or video." : "Posting is disabled outside the venue. Switch to In venue (demo) to try it.");
        const rule = text("p", "Real LIT requires you to be within 100 meters to post. This preview uses no location and uploads nothing.", "demo-rule");
        controls.append(modes, explanation, rule);
        const composer = text("form", "", "demo-composer");
        composer.hidden = true;
        const postButton = action("＋ Add an experience", () => { composer.hidden = !composer.hidden; if (!composer.hidden)
            composer.querySelector("textarea")?.focus(); }, "primary");
        postButton.disabled = !inVenue;
        controls.append(postButton);
        let kind = "photo";
        let media = DEMO_MEDIA.selfie;
        const choices = text("div", "", "media-choices");
        const options = [
            { label: "📸 Selfie", kind: "photo", media: DEMO_MEDIA.selfie },
            { label: "🔥 Dance floor", kind: "photo", media: DEMO_MEDIA.dance },
            { label: "🎬 Video · 10 sec", kind: "video", media: DEMO_MEDIA.video },
        ];
        const preview = text("div", "", "composer-preview");
        const showPreview = () => {
            preview.querySelectorAll("video").forEach((video) => video.pause());
            preview.replaceChildren();
            if (kind === "video") {
                const video = document.createElement("video");
                video.src = media;
                video.controls = true;
                video.playsInline = true;
                video.preload = "metadata";
                video.poster = DEMO_MEDIA.club;
                video.setAttribute("aria-label", "Ten-second demo photo montage");
                preview.append(video);
            }
            else
                preview.append(image(media, "Selected AI-generated demo photo"));
            choices.querySelectorAll("button").forEach((node, i) => node.setAttribute("aria-pressed", String(options[i].media === media)));
        };
        options.forEach((option) => choices.append(action(option.label, () => { kind = option.kind; media = option.media; showPreview(); }, "mode-button")));
        const captionLabel = text("label", "Caption");
        captionLabel.htmlFor = "demo-caption";
        const caption = document.createElement("textarea");
        caption.id = "demo-caption";
        caption.maxLength = 240;
        caption.required = true;
        caption.placeholder = "What’s the vibe?";
        caption.rows = 3;
        const formMessage = text("p", "Choose sample media. Demo posts last one hour and disappear when this page reloads.", "composer-message");
        formMessage.setAttribute("role", "status");
        const submit = text("button", "Post demo experience", "primary");
        submit.type = "submit";
        composer.append(text("h3", "Share the energy"), choices, preview, captionLabel, caption, formMessage, submit);
        showPreview();
        composer.addEventListener("submit", (event) => {
            event.preventDefault();
            const now = Date.now();
            try {
                posts = addDemoPost(posts, { id: crypto.randomUUID(), venueId: currentVenue.id, author: "You · demo visitor", kind, media, caption: caption.value.trim(), createdAt: now, expiresAt: now + 3600000, comments: [] }, inVenue);
                render();
                dialog.querySelector(".experience-feed")?.focus();
            }
            catch (error) {
                formMessage.textContent = error instanceof Error ? error.message : "Try choosing demo media and adding a caption again.";
            }
        });
        const feed = text("section", "", "experience-feed");
        feed.tabIndex = -1;
        const feedTitle = text("h3", "Happening here · demo experiences");
        const cards = text("div", "", "experience-cards");
        const updateExpiry = () => {
            const now = Date.now();
            cards.querySelectorAll("[data-expires]").forEach((card) => {
                if (Number(card.dataset.expires) <= now) {
                    card.querySelectorAll("video").forEach((video) => video.pause());
                    card.remove();
                }
                else {
                    const label = card.querySelector(".expiry");
                    if (label)
                        label.textContent = `Expires in ${Math.ceil((Number(card.dataset.expires) - now) / 60000)} min`;
                }
            });
            const empty = feed.querySelector(".feed-empty");
            if (cards.childElementCount === 0 && !empty)
                feed.append(text("p", "All demo experiences have expired. Add an experience or reset the demo to explore again.", "feed-empty"));
        };
        visibleDemoPosts(posts, currentVenue.id, Date.now()).forEach((post) => {
            const card = text("article", "", "experience-card");
            card.dataset.expires = String(post.expiresAt);
            const metadata = text("div", "", "post-meta");
            metadata.append(text("strong", post.author), text("span", "", "expiry"));
            if (post.kind === "video") {
                const video = document.createElement("video");
                video.src = post.media;
                video.poster = DEMO_MEDIA.club;
                video.controls = true;
                video.preload = "metadata";
                video.playsInline = true;
                video.setAttribute("aria-label", "Ten-second nightlife photo montage, demo content");
                card.append(video);
            }
            else
                card.append(image(post.media, "AI-generated demo experience: " + post.caption));
            card.append(metadata, text("p", post.caption, "post-caption"), text("small", post.kind === "video" ? "DEMO CONTENT · 10-SECOND PHOTO MONTAGE" : "DEMO CONTENT · AI-GENERATED PHOTO", "media-note"));
            const comments = text("div", "", "demo-comments");
            post.comments.forEach((comment) => comments.append(text("p", `Demo comment: ${comment}`)));
            const commentForm = text("form", "", "comment-form");
            const commentInput = document.createElement("input");
            commentInput.type = "text";
            commentInput.maxLength = 240;
            commentInput.required = true;
            commentInput.placeholder = "Add a demo comment…";
            commentInput.setAttribute("aria-label", `Comment on ${post.author}'s experience`);
            const commentSubmit = text("button", "Send", "text-button");
            commentSubmit.type = "submit";
            const errorMessage = text("p", "", "comment-error");
            errorMessage.setAttribute("role", "status");
            commentForm.append(commentInput, commentSubmit);
            commentForm.addEventListener("submit", (event) => {
                event.preventDefault();
                try {
                    posts = addDemoComment(posts, post.id, commentInput.value, Date.now());
                    comments.append(text("p", `You · demo: ${commentInput.value.trim()}`));
                    commentInput.value = "";
                    errorMessage.textContent = "";
                }
                catch (error) {
                    errorMessage.textContent = error instanceof Error ? error.message : "Try commenting on an unexpired experience.";
                }
            });
            card.append(comments, commentForm, errorMessage);
            cards.append(card);
        });
        feed.append(feedTitle, cards);
        dialog.append(toolbar, hero, heading, controls, composer, feed);
        updateExpiry();
        if (timer)
            clearInterval(timer);
        timer = setInterval(updateExpiry, 1000);
    };
    return {
        open: (nextVenue) => {
            venue = nextVenue;
            if (!posts.some((post) => post.venueId === nextVenue.id))
                posts.push(...createDemoPosts(nextVenue.id, Date.now()));
            inVenue = true;
            opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            render();
            dialog.showModal();
            dialog.scrollTop = 0;
            document.body.classList.add("experience-open");
        },
        reset: () => { posts = []; if (dialog.open)
            dialog.close(); },
    };
};
