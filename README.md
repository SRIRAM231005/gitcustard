# GitCustard

**GitCustard** is a lightweight, customizable version control CLI inspired by Git. It allows users to `clone`, `commit`, and eventually `push/pull` code using a zip-based commit system — perfect for syncing with custom IDEs like CodeSphere.

---

## ✅ Features Implemented

### 1. `init`
**Command:** `gitcustard init`

Initializes a new custard repository in your project by creating a hidden `.custard` folder. This folder contains all the necessary metadata and blob storage required to track changes.

What it does:
- Creates `.custard/` directory
- Creates:
  - `logs.json` → stores metadata of each commit
  - `blobs/` → contains file contents stored as blobs

---

### 2. `clone`
**Command:** `gitcustard clone <source_path> <target_path>`

Clones an existing `gitcustard` repo from one location to another by copying all files and the `.custard` directory.

What it does:
- Copies the full project directory structure
- Ensures `.custard` history and blobs are carried over

---

### 3. `commit`
**Command:** `gitcustard commit "Your commit message"`

Creates a new snapshot of the current project state by comparing current file contents with the last commit. If a file is added or modified, it creates or reuses a blob and maps it in the new commit metadata.

What it does:
- Reads all files in the working directory
- For each file:
  - Computes a hash of the content (used as the blob name)
  - Checks if blob already exists; if not, stores the file content as a new blob
  - if blob already exists and file is modified then makes a new blob with modified content
- Updates:
  - `logs.json` → appends a new commit entry with file-to-blob mapping
  - structure of `logs.json` ->
    {
      "commitId": 2,
      "timestamp": "2025-08-03T18:40:00Z",
      "message": "Added login page",
      "files": {
        "index.html": "a1b2c3...",
        "src/utils.js": "e4f5g6..."
      }
    }

---

## 📁 Project Structure

```
.custard/
├── config.json             # remote link & project name
├── logs.json               # commit metadata
└── blobs/                  # files stored as blobs
    └── <hash>.txt
```

---

## 💻 Example Usage

```bash
# Install globally (after publishing)
npm install -g gitcustard

# Initialize workspace
gitcustard init

# Clone a repo (from GitHub zip link)
gitcustard clone https://github.com/user/repo/archive/refs/heads/main.zip

# Commit changes
gitcustard commit "added login feature"
```

---

## 🚧 Roadmap

- [ ] blobs.json - A file storing the metadata which maps filess to blobs
- [ ] trees - A file which stores the tree structure of the whole project
- [ ] `gitcustard push` – Upload latest commit to cloud IDE / backend
- [ ] `gitcustard pull` – Pull latest commit from remote
- [ ] Token-auth for private repo access
- [ ] Integration with CodeSphere live IDE

---

## 🧠 Why GitCustard?

- Inspired by Git, but **simplified**
- Easier onboarding for students and hobbyists
- Useful for syncing with **cloud IDEs**, especially where git may not be ideal
- Transparent ZIP-based system to mimic commits and track changes

---

## ✨ Author

**Sriram Bangam**  
> Building simple tools for real-world collaboration 🚀
