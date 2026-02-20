# Ahjoor Frontend 

**Ahjoor** is a trustless community savings platform built with transparency in mind. This repository contains the frontend application, which provides real-time dashboards for savings groups to manage their circles, track contributions, and monitor payout status. It offers a user-friendly interface to interact with the Ahjoor platform, visualize round milestones, and keep every participant informed.

---

## 💰 Overview of Frontend Functionalities

The Ahjoor Frontend provides the following key features:

* 📊 Real-time dashboards for group organizers and participants to track savings circle status.
* 👁️ Visualization of immutable records of contributions, round history, and payout events stored on-chain.
* 📈 Display of automated payout status triggered when all participants have contributed and the round duration has elapsed.
* 📱 Responsive interface designed for optimal viewing and usability on all devices (mobile, tablet, desktop).

---

## ⚙️ Key Frontend Components

**Frontend Dashboard**
React/Next.js interface for organizers and participants to track savings circle status in real time.

**User Authentication Module**
Handles wallet connection, session management, and participant verification.

**Savings Circle View**
Displays all active groups with their current round, contribution status, and next payout.

**Detailed Circle View**
Shows a comprehensive overview of a single group, including round history, participant contributions, and payout schedule.

**Notification System**
Provides real-time alerts for round completions, missed contributions, or upcoming payouts.

**Payout History / Status**
Displays a record of past payouts and their on-chain transaction details.

**Organizer Dashboard**
Specific views and functionalities for group organizers to manage circles and participants.

**Participant Dashboard**
Specific views for members to track their individual circle progress and contribution history.

---

## 🛠️ Frontend Setup and Initialization

### ✅ Prerequisites

* NodeJS (v16+)
* npm

### 🔧 Installation

```
# Clone the frontend repo
git clone https://github.com/Ahjoor/ahjoor-frontend.git
cd ahjoor-frontend

# Install dependencies
npm install # or npm install --legacy-peer-deps

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and you'll see the app running.

Note: If this frontend is part of a monorepo, adjust the `git clone` and `cd` commands accordingly to navigate to the frontend directory after cloning the main repository.

---

## 🤝 Contributing

We welcome contributors of all experience levels!

### 🧰 Getting Started

* Look for __good first issues__
* Fork the repository
* Create a feature branch
* Open a pull request
* - [Figma Design](https://www.figma.com/design/NlDFuleGHbh26rRp1ZfyvE/Ahjoor-Design?node-id=0-1&t=3E08H8am5RpUngRF-1)
### 🌳 Branching Strategy

* `main` → stable release branch
* `dev` → active development
* `feature/*` → for individual features or fixes

### 📂 Code Guidelines

* Keep PRs small and focused
* Write clear commit messages
* Update docs when necessary

### ✍️ Commit Convention

We use __Conventional Commits__ to standardize commit messages.

* `feat`: new feature
* `fix`: bug fix
* `docs`: documentation only
* `refactor`: code changes without feature/fix
* `chore`: maintenance tasks

## 🔗 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/developer-tools)
- [Next.js App Router](https://nextjs.org/docs/app)



## 🛡️ License

This project is licensed under the **MIT License**.

---

##  Contact Us

Have questions or feedback?

*  [Telegram: __Ahjoor Telegram Group__](https://t.me/ahjoor)


---
