# Senéhorario Frontend

This is the frontend for **Senéhorario**, a web application designed to help students at Uniandes build optimal class schedules.

The frontend is built with Angular and TypeScript. It will provide a user-friendly interface for selecting courses, viewing available schedules, and interacting with the backend API.

## Planned Features

The following features are currently in development for the first release:

- Search and select courses from the Uniandes catalog
- Display all possible schedules based on selected courses and sections
- Responsive UI built with Angular
- Integration with the Senéhorario backend API

## Requirements

- Node.js 18+
- npm 9+
- Senéhorario Backend (running locally or remotely)

## Building and Running

To install dependencies and run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:4200/` by default.

## Running with the Backend

To use the frontend with the Senéhorario backend:

1. Clone and start the [Senéhorario Backend](https://github.com/cmolina12/senehorario-backend) by following its README instructions. By default, the backend runs on `http://localhost:8080/`.
2. Make sure the backend is running before starting the frontend.
3. The frontend is configured to connect to the backend's RESTful API endpoints. If you need to change the backend URL, update the relevant environment configuration file in `senehorario/src/environments/`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
