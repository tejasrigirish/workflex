# WorkFlex — Flexible Part-Time & Short-Term Work Platform

WorkFlex is a platform where college students and job seekers can discover, apply for, and work flexible, verified part-time and short-term shifts at local businesses.

---

## ✨ Features

- **Interactive Leaflet Map**: Real-time geolocation and neighborhood job pins with OpenStreetMap tiles across major cities (Bengaluru, Mysuru, Mangaluru, etc.).
- **Magnetic Fluid & Frosted Glassmorphism UI**: Dynamic pastel liquid environment with spring physics and frosted glass cards.
- **Dual Authentication**: Seamless, tailored experiences for **Job Seekers / Students** and **Employers**.
- **Real-Time Job Lifecycle & Strict Visibility**:
  - Shifts posted by employers immediately appear in public discovery.
  - When an employer accepts an applicant, the job is marked as filled and immediately hidden from everyone else.
  - Remaining pending applicants are notified automatically.
  - Shifts marked completed and paid are archived and cleared from active listings.
- **Student Dashboard & Earnings**: Track applications, scheduled shifts, and payout records.
- **Employer Workspace**: Post new shifts, review applicants, call/contact candidates, and manage listings with one-click clearing.
- **Built-in SQLite Backend**: Zero-dependency, file-based persistence using Node.js built-in `node:sqlite`.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet.js
- **Backend**: Node.js HTTP server + Vite middleware
- **Database**: SQLite (`node:sqlite` DatabaseSync) with WAL mode
- **Build Tool**: Vite 6

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ (or Node.js 24 with native `node:sqlite` support)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tejasrigirish/workflex.git
   cd workflex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📄 License

MIT License. Designed and built for flexible campus student work.
