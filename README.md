# Task Manager App

A Task Management application built with **Vue 3**, **TypeScript**, and **Tailwind CSS**.
This project connects to a Supabase backend using direct HTTP requests (Axios) without using the Supabase SDK, as per the assessment requirements.

## Tech Stack

- **Framework:** Vue 3 (Composition API + Script Setup)
- **State Management:** Pinia
- **Styling:** Tailwind CSS + DaisyUI
- **HTTP Client:** Axios
- **Build Tool:** Vite / pnpm

## Features Implemented

- **CRUD Operations:** Create, Read, Update, and Delete tasks.
- **Server-Side Pagination:** Implemented `limit` and `offset` for better performance.
- **Advanced Filtering:** Filter by Status (Pending/Done), Priority, and Category directly from the server.
- **UI & UX:**
  - Used **DaisyUI** components for Modals (Add/Edit/Delete) and Toast notifications.
- **Form Handling:** Validation for required fields and dates.
- **Loading States:** Proper loading spinners for buttons and data fetching.

## How to Run

1. **Clone the repo**

   ```bash
   git clone <https://github.com/amr-ibrahim7/task_managerV.git>
   cd task-manager
   ```

2. **Install dependencies**
   (This project uses `pnpm`)

   ```bash
   pnpm install
   ```

3. **Setup Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   VITE_API_URL=https://kbkzrznkv.supabase.co/rest/v1
   VITE_API_KEY=your_api_key_here
   ```

4. **Start the server**
   ```bash
   pnpm dev
   ```

## 📂 Project Structure

- `src/stores`: Pinia store handles all API logic and state (Tasks, Categories, Pagination).
- `src/services`: Axios instance configuration with headers.
- `src/components`: Reusable components like `TaskFormModal`.
- `src/views`: Main page logic (`HomeView`).
- `src/types`: TypeScript interfaces for Type Safety.
