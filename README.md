# Health & Appointment Management System - Frontend

**Developer:** İsmail Onur Ayyıldız  
**Type:** Graduation Project (MERN Stack)

## 📖 Project Description

This repository contains the **Client-side (Frontend)** of the Health and Appointment Management System. Built with **React** and **Vite**, it provides a modern, fast, and responsive user interface.

The application features specialized dashboards for **Patients**, **Doctors**, and **Admins**. It communicates with a robust Backend API to handle appointments, doctor approvals, profile management, and review systems.

🔗 **Backend Repository:** [Link to your Backend Repo Here]

---

## 🛠 Tech Stack

* **Core:** React.js, Vite
* **State Management:** Redux Toolkit
* **UI Library:** Ant Design (Antd)
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Date/Time:** Day.js
* **Icons:** Ant Design Icons

---

## ✨ Key Features

### 🏥 Patient Panel
* **Appointment Management:** Search for doctors, book appointments, view upcoming schedules, and cancel if necessary.
* **Doctor Filtering:** Filter doctors by branch (specialty), name, or minimum rating score.
* **Favorites:** Add/remove doctors to a personal favorites list.
* **Reviews:** Rate and review doctors after completed appointments.
* **Profile:** Update personal health data and account settings.

### 👨‍⚕️ Doctor Panel
* **Dashboard:** View daily appointment summaries, total patient count, and rating status.
* **Schedule Management:** Set working hours and available days.
* **Appointment Tracking:** View and manage incoming appointment requests.
* **Profile Management:** Edit biography, hospital details, and specialization info.

### 🛡️ Admin Panel
* **User Management:** List and manage all users (doctors/patients) in the system.
* **Doctor Approval System:** Review credentials of newly registered doctors and approve/reject their accounts.
* **System Monitoring:** View general platform statistics.

### 🔐 General Features
* **Authentication:** Secure Login/Register via JWT (JSON Web Token).
* **Responsive Design:** Fully compatible with mobile and desktop devices.
* **Notifications:** User-friendly toast messages for actions (Success/Error).

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

1.  **Clone the Repository**
    ```bash
    git clone <repo-url>
    cd health-app-client
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

4.  **Start the App**
    ```bash
    npm run dev
    ```
