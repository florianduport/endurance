# Endurance Framework

## Overview

The Endurance Framework is a highly modular and scalable Node.js project template built on Express.js. It is designed to dynamically load and manage independent modules, making it extremely easy to develop, extend, and maintain web applications. The goal is to create a library of ready-made modules (e.g., login, user management, etc.) that can be easily integrated into any project.

## Features

- **Dynamic Module Loading**: Easily add new modules with their own models and routes, and they will be automatically loaded and exposed by the application.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **Modular Structure**: Each module is independent, promoting separation of concerns and better maintainability.
- **Session Management**: Uses MongoDB for session storage in production and in-memory sessions for development.
- **Environment Configuration**: Easily switch between development and production environments.
- **Robust Testing**: Includes setup for testing with Mocha, Supertest, and Chai.
- **PM2 Integration**: Manage and keep your application alive in production.
- **Nodemon for Development**: Automatically restart your server on code changes during development.

## Getting Started

### Prerequisites

- Node.js (v20.x)
- MongoDB (optional for session management and data management)

### Installation

1. Install our CLI:

    ```sh
    npm install -g endurance
    ```

2. Create a project folder and create a new project:

    ```sh
    mkdir newproject
    cd newproject

    endurance new
    ```

### Usage

1. **Start the application**:

    For development:

    ```sh
    npm start
    ```

    For production:

    ```sh
    npm run prod
    ```

2. **Add a new module**:

    To add a new module, create a new folder under the `modules` directory. Each module should contain its own models and routes.

    Example structure for a new module:

    ```
    modules/
      your-module/
        models/
          YourModel.js
        routes/
          yourModule.router.js
    ```

3. **Dynamic Module Loading**:

    The application will automatically load and expose the routes and models from any new module added to the `modules` directory. There is no need for additional configuration.

### Example

Here is an example of how to add a simple "login" module:

1. **Create the module structure**:

    ```
    modules/
      login/
        models/
          User.js
        routes/
          login.router.js
    ```

2. **Define the model (`User.js`)**:

    ```javascript
    const mongoose = require('mongoose');

    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true }
    });

    module.exports = mongoose.model('User', UserSchema);
    ```

3. **Define the route (`login.router.js`)**:

    ```javascript
    const router = require('endurance-core/lib/router')();

    router.post('/login', (req, res) => {
      // Your login logic here
      res.send('Login route');
    });

    module.exports = router;
    ```

### Testing

Run tests using Mocha and Supertest:

    ```sh
    npm test
    ```

### Roadmap

- **Library of Modules**: Develop a library of ready-made modules (e.g., login, user management) for easy integration.
- **Enhanced Documentation**: Provide detailed documentation and examples for each module.
- **Community Contributions**: Encourage community contributions to expand the module library.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.