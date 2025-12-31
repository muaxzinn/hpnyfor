// HNY Data
// Dates set to 2026 to ensure they are "future" relative to Dec 31 2025.

const hiddenPosts = [
    {
        date: '2026-01-01',
        title: 'Whatever happens, pass it.',
        links: ['https://www.instagram.com/reel/DSz9NXvkQPg/'],
        music: 'audio/1.mp3', // Added local music file
        message: 'The beginning of the year is always the hardest. But you have passed it properly. You are very talented.'
    },
    {
        date: "2026-01-02",
        title: "Day 2: A Little Question",
        links: [],
        message: "I have something to ask you...",
        customAction: "chat", // Trigger chat mode
        chatData: [
            { text: "Hello! Happy 2nd day of 2026! 🎉", sender: "site" },
            { text: "I have a secret to tell you...", sender: "site" },
            { text: "Do you want to know?", sender: "site", options: ["Yes! Tell me!", "Maybe later"] },
            { text: "The secret is... You are the best thing that happened to him. ❤️", sender: "site" },
            { text: "Make sure to smile today! 😊", sender: "site" }
        ]
    },
    { date: "2026-01-03", title: "Day 3", links: [], message: "" },
    { date: "2026-01-04", title: "Day 4", links: [], message: "" },
    { date: "2026-01-05", title: "Day 5", links: [], message: "" },
    { date: "2026-01-06", title: "Day 6", links: [], message: "" },
    { date: "2026-01-07", title: "Day 7", links: [], message: "" },
    { date: "2026-01-08", title: "Day 8", links: [], message: "" },
    { date: "2026-01-09", title: "Day 9", links: [], message: "" },
    { date: "2026-01-10", title: "Day 10", links: [], message: "" },
    { date: "2026-01-11", title: "Day 11", links: [], message: "" },
    { date: "2026-01-12", title: "Day 12", links: [], message: "" },
    { date: "2026-01-13", title: "Day 13", links: [], message: "" },
    { date: "2026-01-14", title: "Day 14", links: [], message: "" },
    { date: "2026-01-15", title: "Day 15", links: [], message: "" },
    { date: "2026-01-16", title: "Day 16", links: [], message: "" },
    { date: "2026-01-17", title: "Day 17: Final Surprise", links: [], message: "You made it!" }
];

// Export to global scope
window.hnyData = hiddenPosts;
