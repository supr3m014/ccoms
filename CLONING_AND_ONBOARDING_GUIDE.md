# How to Clone & Onboard a Repo for Antigravity

This guide covers the detailed steps to bring an existing GitHub project into your local environment and properly "onboard" it so that **Antigravity** (your AI agent) can work on it effectively.

---

## 1. Local Environment Preparation

Before cloning, ensure your local machine has the necessary tools:
*   **Git**: Installed and configured with your GitHub identity.
*   **Node.js & npm**: Required for running and building the app.
*   **VS Code (or your IDE)**: The environment where Antigravity is active.

---

## 2. Cloning the Repository

1.  **Open your Terminal** (or VS Code Terminal).
2.  **Navigate** to the folder where you want the project to live (e.g., `cd ~/Desktop`).
3.  **Clone the Repo**:
    ```bash
    git clone https://github.com/supr3m014/qrseal-app.git
    ```
4.  **Enter the Directory**:
    ```bash
    cd qrseal-app
    ```

---

## 3. Initial Setup (The "Agent-Ready" State)

Once the code is on your machine, you need to prepare it for development.

### A. Install Dependencies
```bash
npm install
```

### B. Configure Environment Variables
1.  Check for a `.env.example` file.
2.  Create your own `.env` file:
    ```bash
    cp .env.example .env
    ```
3.  **Fill in your keys**: Open `.env` and add your `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.

---

## 4. Onboarding Antigravity (Stage 00)

When you first open a repo with Antigravity, the "Onboarding Ritual" is mandatory. This allows the AI to understand your code instead of guessing.

### Step 1: Request "Repo Orientation"
Your first message to the AI should be:
> *"I've just cloned this repo. Please perform **Stage 00: Repo Orientation**. Create a `docs/REPO_MAP.md` before making any code changes."*

### Step 2: Agent Tooling Check
Antigravity will then automatically:
1.  **Map the files**: Read the folder structure.
2.  **Analyze dependencies**: Check `package.json`.
3.  **Establish the "Brain"**: Create the internal tracking artifacts (like `task.md` and `implementation_plan.md`) in its local memory.

---

## 5. Working with Branches

Always ensure you are on the right branch before asking the AI to start work.

### To work on the Source Code:
```bash
git checkout main
```

### To verify the Production Build:
```bash
git checkout production
```

---

## 6. How Antigravity Maintains Context

Antigravity stores its "memory" of your project in a specific directory called the **Brain**. 
*   **`task.md`**: The source of truth for current progress.
*   **`implementation_plan.md`**: The technical blueprint for any major change.
*   **`walkthrough.md`**: The proof of work after a task is finished.

If you ever feel the AI has "lost the plot," you can ask:
> *"Please review `task.md` and tell me where we are in the Current Stage."*

---

## 7. Summary Checklist for New Projects
- [ ] `git clone ...`
- [ ] `npm install`
- [ ] Setup `.env`
- [ ] Open in VS Code
- [ ] Ask Antigravity for **"Stage 00: Repo Orientation"**
- [ ] Verify `docs/REPO_MAP.md` is created.

Now you are ready to build! 🚀
