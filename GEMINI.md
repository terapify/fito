# GEMINI.md

## Project Overview

This is a Next.js web application designed as a mental well-being companion named "Fito". The application uses a gamified approach to encourage users to complete missions and cultivate a virtual garden. The frontend is built with React, and it leverages several libraries for rich user experience:

*   **Next.js**: React framework for server-rendered applications.
*   **React Three Fiber**: For creating 3D scenes with Three.js in React.
*   **Zustand**: For state management.
*   **Framer Motion**: For animations.
*   **Tailwind CSS**: For styling.

The application is structured as follows:

*   `src/pages`: Contains the main pages of the application.
*   `src/components`: Contains reusable React components.
*   `src/lib`: Contains the core logic of the application, including the game state management.
*   `src/hooks`: Contains custom React hooks.
*   `public`: Contains static assets like images and icons.

## Building and Running

To build and run this project locally, you need to have Node.js and yarn installed.

1.  **Install dependencies:**

    ```bash
    yarn install
    ```

2.  **Run the development server:**

    ```bash
    yarn dev
    ```

    This will start the development server on `http://localhost:3000`.

3.  **Build for production:**

    ```bash
    yarn build
    ```

4.  **Run in production mode:**

    ```bash
    yarn start
    ```

5.  **Lint the code:**

    ```bash
    yarn lint
    ```

## Development Conventions

*   **State Management**: The application uses Zustand for state management. The main store is defined in `src/lib/gameStore.js`.
*   **Styling**: The application uses Tailwind CSS for styling. The main stylesheet is located in `src/styles/globals.css`.
*   **Components**: Components are organized by feature in the `src/components` directory.
*   **3D Graphics**: The application uses React Three Fiber for 3D graphics. The 3D scenes are located in the `src/components/Garden` directory.
*   **Animations**: The application uses Framer Motion for animations.
