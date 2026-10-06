# 📖 Dev Diary: Enabling Software Self-Learning and Evolution

> Date: 2026-01-16
> Author: Maohuhu

## Skill 1: Enabling Software to Learn and Organize Global and Local Skills

Google Antigravity's Skills System is indeed its core highlight. It allows developers to encapsulate specific development workflows (such as "Code Review", "Security Audit", "Database Migration") into reusable `.md` rules or scripts.

Currently, Skills sharing is mainly concentrated in the open-source community (GitHub) and specific developer forums. Below are the most noteworthy public resources and skill-sharing channels that you can directly borrow from:

### 1. Core Skills Repositories (GitHub)

This is the most direct place to get ready-made Skills. The community usually compiles "Awesome" lists, and you can directly download the `SKILL.md` files from these repositories and reference them in your Antigravity project.

* **Antigravity Awesome Skills (Collection)**
    * **Content:** A community-driven collection of dozens of common Skills, covering full-stack development, test writing, documentation generation, etc.
    * **Why Recommended:** Similar to "Awesome Python" lists, it is suitable for beginners to quickly find gold. You can find practical skills like `git-commit-formatter` (automatically standardizes commit messages) or `test-case-generator` (automatically generates test cases).
    * **Search Keywords:** `github antigravity-awesome-skills` or `sickn33/antigravity-awesome-skills`

* **Google Cloud / Antigravity Official Examples**
    * **Content:** Standard Skills examples provided by Google, usually containing best practices, such as how to write standardized Prompt rules and how to safely call the Terminal.
    * **Why Recommended:** The best textbook for learning the standard syntax of Skills, especially regarding the structure of `SKILL.md` (Goal, Instructions, Constraints).
    * **Resource Address:** Usually referenced in `antigravity.google/docs/skills` documentation, or search for `rominirani/antigravity-skills` on GitHub.

### 2. Developer Communities & Forums

A gathering place for tricks and "dark magic" gameplay.

* **Reddit (r/google_antigravity)**
    * **Content:** An extremely active community. Developers share their custom-written Skills here, or discuss Prompt techniques to "bypass" certain restrictions.
    * **Finding Tips:** Search for posts with "Skills" or "Showcase" flairs.

* **Dev.to & Medium Tech Blogs**
    * **Content:** Many senior developers (such as GDE - Google Developer Experts) write in-depth tutorials, breaking down how to integrate Antigravity into specific workflows like Unity or React.
    * **Recommended Article Types:** Search for "Antigravity workflow for [your tech stack]" (e.g., "Antigravity workflow for React").

### 3. Skills Development Cheat Sheet (How to "Borrow")

When you download someone else's Skills, it is recommended to "borrow" them into your project in the following way:

1.  **Understand the Structure (SKILL.md)**:
    *   Check **Brain (Rules)**: Look at the `Instructions` section in `SKILL.md`. This is the core Prompt that tells the Agent "how to think".
    *   Check **Hands (Tools)**: See which MCP (Model Context Protocol) tools it calls, such as whether it calls the local Shell or the browser.

2.  **Local Reuse (Workspace vs Global)**:
    *   If you want a skill to be universal across all projects (like code style checking), put it in the global directory (usually `~/.gemini/antigravity/skills/`).
    *   If you just want to borrow it for the current project, put it under `.agent/skills/` in the project root directory.

### Summary & Suggestions

I suggest you start with **`antigravity-awesome-skills` on GitHub**. Clone it first, observe how others write `SKILL.md`, and then try to copy the general ones (like `Auto-Documentation`) to your `.agent/skills` folder and run it once. This is the fastest way to get started.

[Google Antigravity: From Beginner to Expert in 16 Minutes!](https://www.youtube.com/watch?v=LB_cFL_nQbc)
This video is very suitable for a quick start. Around the 12th minute, it details how to actually import and use Skills, allowing you to intuitively see the effect of borrowing public skills. Based on the above principles, help me set up some general skills under global skills to improve the self-learning process of the entire skill flow. That is to say, every time I mention improving a skill, I can search for relevant skills on this external website, and then add them to a local global skill. Then local skills will also have some very good linkages. That is to say, there are also some linkages between this local skill and this global skill. There are also some linkages between global skills and this external skill, network skill. Iterate layer by layer in the process of optimizing the project, thinking step by step. The setting of a skill framework is decided by you.

## Global Skill Self-Learning Framework Design

Design a hierarchical skill management system to achieve a three-tier progressive learning and application of External Network Skills → Global Skills → Project Skills.

![alt text](image.png)

### 🧠 Intelligent Router

Now AI will automatically select the appropriate skill based on your task type:

| You Say | AI Automatically Applies |
| :--- | :--- |
| "Modify button style" | `ui_standardization` |
| "Add multi-language" | `react_i18n` |
| "Package and Release" | `security_check` → `build_*` |
| "Search Skills" | `skill_discovery` |

No need to manually specify skills; the router will automatically match them in the background!

Through automated skill discovery, both development speed and accuracy are improved.
