# GitCustard

**GitCustard** is a lightweight, customizable version control CLI inspired by Git. It allows users to `clone`, `commit`, and eventually `push/pull` code using a zip-based commit system — perfect for syncing with custom IDEs like CodeSphere.

---

## ✅ Features Implemented

### ⚙️ `gitcustard init`
- Sets up a `.custard/` folder in the current working directory
- Creates:
  - `config.json`: stores project metadata (remote URL, project name)
  - `logs.json`: tracks commit history
  - `commits/`: folder to store zipped commit snapshots

### 🐣 `gitcustard clone <url>`
- Downloads a ZIP archive from a GitHub `.zip` link
- Unzips it in the current directory
- Extracts project name
- Sets `remoteLink` and `projectName` in `.custard/config.json`

> ✅ Works with **public GitHub repos**  
> ❌ Private repos not yet supported

### 💾 `gitcustard commit "message"`
- Zips the project folder (excluding `node_modules` and files from `.custardignore`)
- Saves the zipped snapshot inside `.custard/commits/`
- Appends metadata (commitId, message, timestamp) to `.custard/logs.json`

### 🗂️ `.custardignore`
- Like `.gitignore`
- Allows users to ignore custom files/folders during commits
- Default: `node_modules/**` is always ignored

---

## 📁 Project Structure

```
mainfolder/
├── codesphere/                 # cloned project
├── .custard/
│   ├── config.json             # remote link & project name
│   ├── logs.json               # commit metadata
│   └── commits/
│       └── commit-1-codesphere.zip
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

## 📦 Tech Stack

- Node.js
- `fs-extra` – file operations
- `archiver` – zip creation
- `unzipper` – extract archives

---

## 🚧 Roadmap

- [ ] `gitcustard push` – Upload latest commit to cloud IDE / backend
- [ ] `gitcustard pull` – Pull latest commit from remote
- [ ] `gitcustard log` – View commit history
- [ ] Limit local commits to last 20 for space optimization
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
