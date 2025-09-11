# Simple Customer Management App

A simple web application built with Node.js, Express, and a SQLite database for managing customer information. The frontend is a single HTML page that allows adding, viewing, and managing customers through a RESTful API.

## Features

-   **Backend**: Node.js with Express for the server.
-   **Database**: `sqlite3` for lightweight, file-based data storage.
-   **API**: RESTful endpoints to get and create customers.
-   **Frontend**: A vanilla JavaScript, HTML, and CSS single-page interface.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js installed on your machine (which includes npm).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GITHUB_REPOSITORY_URL>
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd Projects
    ```

3.  **Install dependencies:**
    This command reads your `package.json` and installs all required libraries (like Express, CORS, and SQLite3) into a `node_modules` folder.
    ```sh
    npm install
    ```

4.  **Run the server:**
    ```sh
    node app.js
    ```

5.  Open your web browser and go to `http://localhost:3000`. The application should be running!