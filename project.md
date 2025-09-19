
# Pulse Note Project Documentation

Welcome to the Pulse Note project! This document provides a comprehensive overview of the project's architecture, conventions, and development philosophy. It is intended to help new developers get up to speed quickly and contribute effectively.

## 1. Project Philosophy

The primary goal of this project is to create a maintainable, scalable, and testable application by adhering to the principles of **Clean Architecture**. This means that the core business logic of the application is independent of any framework, UI, or database.

Our philosophy is centered around these key ideas:

*   **Separation of Concerns:** The codebase is divided into distinct layers, each with a specific responsibility. This makes the code easier to understand, modify, and test.
*   **Dependency Inversion:** The core business logic does not depend on the details of the UI or the database. Instead, it depends on abstractions (interfaces or "ports"), and the outer layers (UI, database) provide the implementations.
*   **Testability:** By keeping the core logic pure and independent, we can test it easily without needing to render UI components or connect to a database.

## 2. Architecture: Clean Architecture

The project follows a classic Clean Architecture pattern, which is organized into three main layers:

### Layer 1: Core (Entities & Use Cases)

*   **Location:** `app/components/clean-architecture/core/`
*   **Description:** This is the heart of the application. It contains the pure business logic and data structures (entities) that are central to the application's functionality.
*   **Key Characteristics:**
    *   No dependencies on React, the DOM, or any other external framework.
    *   Written in plain JavaScript/TypeScript.
    *   Contains `entities.js` (data structures) and `useCases.js` (business rules).

### Layer 2: Adapters (Repositories)

*   **Location:** `app/components/clean-architecture/adapters/`
*   **Description:** This layer acts as a bridge between the core business logic and the outside world (e.g., data sources, external APIs). It implements the "ports" (interfaces) that the use cases depend on.
*   **Key Characteristics:**
    *   In this project, the adapters connect the core to the browser's `localStorage`.
    *   The `repositories.js` file contains the implementation for storing and retrieving data.

### Layer 3: Components (UI)

*   **Location:** `app/components/` and `app/page.jsx`
*   **Description:** This is the presentation layer of the application. It consists of React components that display the data and provide user interaction.
*   **Key Characteristics:**
    *   The UI components are responsible for rendering the data provided by the use cases.
    *   They call the use case functions to trigger business logic in response to user actions.
    *   This layer is built with Next.js and React.

## 3. File Structure

The project's file structure is organized to reflect the Clean Architecture principles:

```
/
├── app/
│   ├── components/
│   │   ├── clean-architecture/
│   │   │   ├── adapters/      # Layer 2: Adapters
│   │   │   ├── components/      # UI components that use the clean architecture
│   │   │   └── core/            # Layer 1: Core Business Logic
│   │   └── ui/                # General-purpose UI components
│   ├── globals.css
│   ├── layout.tsx
│   └── page.jsx             # Main application page (Layer 3: UI)
├── components/
│   └── ui/                    # Reusable UI components (ShadCN)
├── hooks/
│   └── ...
├── lib/
│   └── ...
├── public/
│   └── ...
├── package.json
└── ...
```

## 4. Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) (via [ShadCN/UI](https://ui.shadcn.com/))
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Linting:** [ESLint](https://eslint.org/)
*   **Data Persistence:** Browser `localStorage`

## 5. Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Development Workflow

When adding a new feature or fixing a bug, follow these steps:

1.  **Start with the Core:** If the change involves business logic, start by modifying the entities or use cases in the `core` layer.
2.  **Update the Adapters:** If the change requires interacting with a new data source or API, create or modify an adapter in the `adapters` layer.
3.  **Build the UI:** Create or modify the React components in the `components` or `app` directory to reflect the changes in the core logic.
4.  **Write Tests:** While not yet implemented, the goal is to add tests for the core business logic.

By following these guidelines, we can ensure that the Pulse Note project remains a high-quality, maintainable, and enjoyable codebase to work on.
