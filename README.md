# Droosy: Your Learning Hub

Create a modern, sleek, and responsive full-stack web application named "Droosy" (an educational marketplace app designed to solve high school and student stress by connecting students with private teachers, centers, and online platforms in one place).

### 🛠️ Core Purpose & Features

1. **Teacher & Center Discovery:**

   - Filter by Subject (Math, Physics, Chemistry, Arabic, English, Biology, etc.).

   - Filter by Area/Location (Region, neighborhood, and physical center address).

   - Mode Selection: In-Person Center, Private Home Tutoring, or Online Platform ("Manasa").

2. **Ratings & Reviews System:**

   - Display overall 1-5 star ratings, total student count, and verified student feedback/reviews.

   - Modal or section to submit a star rating and written review.

3. **Manasa & External Links:**

   - Direct integration links to each teacher’s online platform ("Manasa"), YouTube channel, or stream links.

   - Physical center location details with embedded map integration / directions.

4. **Student-Teacher Package Bundles (Key Feature):**

   - Interactive "All-in-One Package" feature allowing students to pick a bundle of teachers across multiple subjects (e.g., Math + Physics + Chemistry) and book them all in a single click with a bundle discount.

5. **Booking & Calendar Schedule:**

   - Visual timetable selector for session slots.

   - "My Schedule" dashboard showing student's upcoming classes across all chosen subjects to prevent timing conflicts.

### 📱 UI/UX & Structure Requirements

- **Top Navigation Bar:** Droosy logo, Location selector dropdown, Search bar, "My Schedule", "Packages", and Profile avatar.

- **Hero Section:** Friendly, stress-relieving greeting ("Find all your teachers in one place and save your time"), quick search bar, and subject quick-filter tags.

- **Main Feed:**

  - **Featured Packages Banner:** Highlight multi-teacher discount bundles.

  - **Teacher Grid:** Cards displaying photo, name, subject tag, area, rating star summary, Manasa badge, and "Book / View Profile" buttons.

- **Teacher Profile View:** Detailed profile showing teaching bio, center address/map, review list, Manasa direct links, and available time slots.

- **Team Credits Footer:** Subtle credit tag in the footer: "Idea by Rokaya, Sama, Haneen, and Sajda."

### 🎨 Design System & Styling

- **Vibe:** Clean, vibrant, youthful, and organized.

- **Color Palette:** Soft pastel blue `#E0F2FE`, primary blue `#0284C7`, vibrant teal/cyan accents `#06B6D4`, and dark slate text `#0F172A`.

- **Components:** Interactive stateful components using Tailwind CSS and Lucide React icons (star, map-pin, calendar, book-open, external-link, filter).

Please build the complete web application with dummy data for teachers, subjects, locations, reviews, and package bundles so the entire flow can be fully previewed and tested.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://droosy-study-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/20d97560-2ebc-4c88-a16c-a4ceb17de489).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
