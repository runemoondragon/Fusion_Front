# ✅ Work Order 1: Fix Dead Ends & Core Documentation Pages

**Goal:**  
Fix 404 pages, ensure sidebar navigation is connected to real content, and complete high-impact core documentation sections like FAQ, Features, and Quickstart.  

**Max Tool Calls:** 25  

---

## 🔧 Tasks

### 📚 Features Section
1. Create `/docs/features/transforms` - Message transformation documentation
2. Create `/docs/features/multimedia` - Image & PDF input feature documentation
3. Create `/docs/features/web-search` - Web search integration documentation
4. Fix `/docs/features/index.tsx` - Add internal links to all feature subpages
5. Add title + description metadata for all pages in `/docs/features`
6. Add real-world examples to `/docs/features/streaming`

---

### ❓ FAQ Section
7. Create `/docs/faq/tokens` - Token usage explanations
8. Create `/docs/faq/neuroswitch` - FAQ on NeuroSwitch routing
9. Create `/docs/faq/troubleshooting` - Common issues and solutions

---

### ⚡ Quickstart Section
10. Create `/docs/quickstart/chat-setup` - Setting up stateful chat interactions
11. Fix sidebar navigation for `/docs/quickstart` - Add missing links
12. Add cURL + response example block in `/docs/quickstart/first-call`

---

### 🔐 API Reference
13. Refactor `/docs/api/index.tsx` - Add anchor links and description
14. Create `/docs/api/auth` - Authentication with API key and JWT
15. Create `/docs/api/parameters` - Full parameter reference with types
16. Create `/docs/api/errors` - Error handling and codes
17. Create `/docs/api/limits` - Rate limits and how to increase them

---

### 🔏 Privacy & Logging
18. Create `/docs/privacy/logging` - What gets logged (timestamps, providers)
19. Create `/docs/privacy/no-logging` - What is excluded from logs
20. Create `/docs/privacy/opt-out` - Opt-out configuration for users
21. Fix sidebar links under `/docs/privacy/*`

---

### 📈 Overview / Improvements
22. Add a visual routing diagram to `/docs/overview/data-flow`
23. Add internal cross-links between related docs (e.g., tools → streaming)
24. Fix mobile sidebar nav highlight issue (highlight active page on scroll)
25. Add copy-to-clipboard button to all code blocks (Quickstart + Features)

---

## 🧠 Notes for Agent

- Keep design and structure consistent with existing `/docs/` pages.
- Prioritize clarity, examples, and navigation integrity.
- Use Tailwind + Lucide for any UI components in code blocks.
- Keep all pages mobile-responsive.
- Use absolute paths in links (e.g., `/docs/features/tools`) to ensure stable navigation.

---

## 📦 Work Order Name: `w1_fix-deadends-core-faqs`
