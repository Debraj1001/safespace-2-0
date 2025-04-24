# SafeSpace

**SafeSpace** is a modern, safety-first web application designed to help users stay protected in real-world environments by creating geo-fenced safe zones, sending emergency alerts, and storing trusted emergency contact information.

---

## 🚀 Features

- **Safe Zones**  
  Define personal safe areas with location and radius settings.

- **Emergency Alerts**  
  Instantly send alerts with real-time location to emergency contacts or guardians.

- **User Profiles with Emergency Contacts**  
  Maintain emergency contact details for quick reach-out in distress situations.

- **Responsive & Accessible UI**  
  Clean, fast, and accessible UI with theme support and animations.

---

## 💻 Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Radix UI, Framer Motion
- **Backend & Auth:** Supabase (PostgreSQL, Auth, Realtime)
- **Forms & Validation:** React Hook Form, Zod
- **UI/UX Enhancements:** Lucide React, CMDK, Sonner, Vaul
- **Data Visualization:** Recharts
- **Package Manager:** PNPM

---

## 📂 Project Structure

- `schema.sql` – SQL schema for users, safe zones, and alerts
- `components/` – Reusable UI components
- `pages/` – Next.js routes
- `middleware.ts` – Middleware logic (e.g., auth handling)
- `tailwind.config.ts` – Tailwind CSS setup
- `package.json` – Project dependencies and scripts

---

## 🌍 Real-Life Use Cases

- Students walking alone at night
- Travelers in unfamiliar cities
- Workers in remote or hazardous areas
- Anyone needing a personal emergency support system

---

## 🛠️ Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
