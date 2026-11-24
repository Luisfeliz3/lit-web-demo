export const DEMO_MEDIA = {
    cover: "./showcase/assets/lounge-cover.jpg",
    selfie: "./showcase/assets/lounge-selfie.jpg",
    dance: "./showcase/assets/dance-floor.jpg",
    club: "./showcase/assets/club-crowd.jpg",
    bar: "./showcase/assets/bar-selfie.jpg",
    video: "./showcase/assets/nightlife-teaser.mp4",
};
export const createDemoPosts = (venueId, now) => [
    { id: `${venueId}-selfie`, venueId, author: "Demo guest · Maya", kind: "photo", media: DEMO_MEDIA.selfie, caption: "Good company. Great night. 🔥", createdAt: now - 5 * 60000, expiresAt: now + 55 * 60000, comments: ["This is the energy! 🔥"] },
    { id: `${venueId}-dance`, venueId, author: "Demo guest · Alex", kind: "photo", media: DEMO_MEDIA.dance, caption: "The dance floor understood the assignment.", createdAt: now - 12 * 60000, expiresAt: now + 48 * 60000, comments: [] },
    { id: `${venueId}-video`, venueId, author: "LIT demo", kind: "video", media: DEMO_MEDIA.video, caption: "A ten-second nightlife mood. Photo montage, not live footage.", createdAt: now - 2 * 60000, expiresAt: now + 58 * 60000, comments: [] },
];
export const visibleDemoPosts = (posts, venueId, now) => posts.filter((post) => post.venueId === venueId && post.expiresAt > now).sort((a, b) => b.createdAt - a.createdAt);
export const addDemoPost = (posts, post, inVenue) => {
    if (!inVenue)
        throw new Error("Switch to In venue (demo) to try posting. Real LIT requires you to be within 100 meters.");
    if (!post.caption.trim() || post.caption.length > 240)
        throw new Error("Add a caption between 1 and 240 characters.");
    if (post.expiresAt !== post.createdAt + 3600000)
        throw new Error("Demo experiences must expire after one hour.");
    return [post, ...posts];
};
export const addDemoComment = (posts, postId, text, now) => {
    const comment = text.trim();
    if (!comment || comment.length > 240)
        throw new Error("Write a comment between 1 and 240 characters.");
    const post = posts.find((item) => item.id === postId && item.expiresAt > now);
    if (!post)
        throw new Error("This demo experience has expired. Pick a current post or reset the demo.");
    return posts.map((item) => item.id === postId ? { ...item, comments: [...item.comments, comment] } : item);
};
