## MEAN-OnlyQuiz: Your Interactive Quiz Playground

MEAN-OnlyQuiz is a dynamic web application built with the MEAN stack (MongoDB, Express.js, Angular, and Node.js) that allows users to create and participate in engaging multiplayer quizzes.  Test your knowledge, challenge your friends, and create personalized quiz experiences!

**Key Features:**

* **Create Custom Quizzes:** Design your own quizzes with multiple-choice questions, define difficulty levels, and personalize the learning experience.
* **Multiplayer Gameplay:** Challenge friends or compete with online players in real-time quiz battles.
* **Leaderboard Tracking:** Track your progress and climb the leaderboards to see how you stack up against the competition.
* **User Management:** Create an account to manage your quizzes, track your performance, and connect with other players.

**Tech Stack:**

* **Frontend:** Angular - A powerful framework for building interactive and responsive web applications.
* **Backend:** Express.js (Node.js) - A flexible and scalable framework for crafting robust APIs.
* **Database:** MongoDB - A NoSQL database for efficient data storage and retrieval of quiz data and user information.

**Getting Started:**

Before setting up MEAN-OnlyQuiz, ensure you have the following:

* **Node.js and npm (or yarn):** Download and install Node.js from [https://nodejs.org/en](https://nodejs.org/en) (includes npm). Alternatively, use a package manager like yarn ([https://classic.yarnpkg.com/lang/en/docs/install/](https://classic.yarnpkg.com/lang/en/docs/install/)).
* **MongoDB:** Install a local MongoDB instance or set up a cloud-based database following the official documentation ([https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)).

**Project Setup:**

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/<your-username>/mean-onlyquiz.git
   ```

2. **Install Dependencies:**

   ```bash
   cd mean-onlyquiz
   npm install  # or yarn install
   ```

3. **Add .env in server folder to configure Database Connection and set password:**

    ```env
    DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority"
    DATABASE_NAME="your-db-name"
    DATABASE_COLLECTION_QUIZZES="quizze-collection-name"
    DATABASE_COLLECTION_GAMES="games-collection-name"
    PASSWORD="your-password"
    ```

4. **Run the Backend Server:**

   ```bash
   cd backend
   npm start  # or yarn start
   ```

   This starts the Express.js server, typically listening on port `3000` by default (you can check the code for the exact port).

5. **Run the Angular App:**

   ```bash
   cd frontend
   npm start  # This starts the development server
   ```

   This starts the Angular development server, usually accessible at `http://localhost:4200/` in your browser.

**Additional Notes:**

* User accounts and authentication features might not be fully implemented yet. Feel free to explore adding these functionalities as you customize the application.
* Refer to the specific documentation for Angular, Express.js, MongoDB, and Node.js for in-depth guidance on each technology used in this project.

**Contribution**

We welcome contributions to improve MEAN-OnlyQuiz! Feel free to submit pull requests with new features, bug fixes, or improvements to the quiz functionalities and user experience.

**License**

This repository is licensed under the MIT License (see LICENSE file for details).

Have fun creating and playing quizzes with MEAN-OnlyQuiz!