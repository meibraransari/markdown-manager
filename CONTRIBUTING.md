# Contributing to Markdown Manager

First off, thank you for considering contributing to Markdown Manager! It's people like you who make this tool better for everyone.

Here are some guidelines to help you get started.

## 🤝 Code of Conduct

Please be respectful, professional, and welcoming to all contributors.

## 💡 How Can I Contribute?

### Reporting Bugs
If you find a bug, please open an issue and include:
* A clear description of the problem.
* Steps to reproduce the issue.
* Expected vs actual behavior.
* Screenshots (if applicable).
* Details about your environment (OS, browser, Docker version).

### Suggesting Enhancements
We welcome feature requests! Open an issue detailing:
* What feature you would like added.
* Why this feature is useful.
* Any mockups or design ideas.

### Pull Requests
Ready to submit code? Follow these steps:
1. **Fork the repository** and clone it locally.
2. **Create a branch** for your work: `git checkout -b feature/amazing-feature` or `git checkout -b bugfix/fix-issue`.
3. **Make your changes**. Ensure your code is clean and follows the project's structure:
   * Frontend changes should be in the `frontend` folder.
   * Backend changes should be in the `backend` folder.
4. **Test your changes** locally.
5. **Commit your changes** with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add support for custom CSS files"
   ```
6. **Push to your fork** and open a **Pull Request** against the `main` branch.

---

## 🛠️ Development Setup

To run Markdown Manager locally for development:

### Backend Development (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Development (React + Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

Thank you for contributing!
