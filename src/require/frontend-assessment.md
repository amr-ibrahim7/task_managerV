# Frontend Developer Technical Assessment
**Position**: Jr - Mid Level Developer  
**Challenge**: Task Manager Web Application

---

## AI Usage Prohibition
**This assessment must be completed without AI assistance.** Using ChatGPT, Claude, Copilot, or similar AI tools for code generation, problem-solving, or debugging is strictly prohibited. We want to evaluate your authentic frontend development skills and problem-solving approach.

**What we're looking for**: Your natural coding style, debugging process, architectural decisions, and how you handle challenges independently.

---

## Core Requirements

### **Essential Features**
Build a task management web application with these **required features**:

**Task List View**
- Display tasks in cards/list with title, description, category, completion status
- Show task images with proper loading and error states
- Category-based filtering (dropdown or tabs)
- Loading states during data fetching
- Add Task button/CTA

**Add/Edit Task Form**
- Required fields: Title, Category (dropdown from API)
- Optional fields: Description, Priority, Due Date
- Form validation with error messages
- Save/Cancel functionality
- Show loading state during submission

**Task Detail View**
- Display full task information
- Toggle completion status
- Edit and Delete actions
- Handle image display with fallback
- Navigate back to list

**Category Integration**
- Fetch and display categories from API
- Use category colors for visual distinction
- Display category icons where appropriate

### **Technical Stack**
- **Framework**: Vue.js
- **State Management**: Pinia
- **Styling**: CSS/SCSS, Tailwind, or CSS-in-JS (your choice)
- **Build Tool**: Vite

---

## Backend API

**Use the provided Supabase REST API** - Full documentation provided separately with:
- Base URL and authentication headers
- Complete CRUD endpoints for tasks
- Read-only endpoints for categories
- Filtering and pagination parameters
- Example requests and responses

**Important**: 
- You must use direct HTTP requests (axios/fetch)
- Do not use any Supabase SDK
- Handle all API errors gracefully
- Implement proper loading states

**API Credentials will be provided separately**

---

## Show Us Your Initiative

**We want to see how far you'll take this project.** The core requirements are just the starting point. What additional features, improvements, or creative solutions will you implement?

**This is your opportunity to demonstrate your frontend development skills, creativity, and attention to detail beyond the basic requirements.**

---

## Deliverables

### **1. Source Code**
- Complete Vue project with clear component structure
- Clean, readable, and well-organized code
- Proper component composition and reusability
- Consistent code style and naming conventions

### **2. README Documentation**
Include:
- Setup and run instructions (npm install, environment variables, etc.)
- State management approach explanation
- Component architecture overview
- Features implemented (core + extras)
- Any known limitations
- Screenshots of key screens

### **3. Demo**
Provide **one** of the following:
- Deployed version (Vercel, Netlify, etc.)
- 2-3 minute video walkthrough
- Local setup with clear instructions

---

## UI/UX Requirements

### **Responsive Design**
- Desktop: Full layout with sidebar/navigation
- Tablet: Adapted layout with collapsible elements
- Mobile: Single column, touch-friendly interface

### **Visual Elements**
- Use category colors from API for visual distinction
- Implement loading skeletons or spinners
- Error states with retry options
- Empty states with clear CTAs
- Success feedback for actions

### **Interactions**
- Smooth transitions between views
- Form validation feedback
- Confirmation dialogs for delete actions
- Hover states for interactive elements
- Keyboard navigation support

---

## Important Notes

- **No AI assistance**
- **Browser compatibility** - Ensure it works on modern browsers
- **Error boundaries** - Handle component errors gracefully
- **Network issues** - Handle offline/slow connections appropriately
- **Git usage** - Show meaningful commit history

---

## 🔍 Minimum Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

**Questions?** Contact Abduallah Salem 01014181551 for clarification on requirements only.
