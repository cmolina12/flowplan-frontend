# Senéhorario Frontend

This is the frontend for **Senéhorario**, a web application designed to help students at Uniandes build optimal class schedules.

The frontend is built with Angular and TypeScript. It provides a user-friendly interface for selecting courses, viewing available schedules, and interacting with the backend API.

## Try It Online

You can use Senéhorario directly in your browser, no installation required:

- **Live site:** [https://cmolina12.github.io/senehorario/](https://cmolina.xyz/senehorario/)

A backend server is already running to support the live site, so students can use the tool immediately without needing to set up their own backend or frontend.

## Planned Features

The following features are currently in development for the first release:

- Search and select courses from the Uniandes catalog
- Display all possible schedules based on selected courses and sections
- Responsive UI built with Angular
- Integration with the Senéhorario backend API

## Requirements (for local development)

- Node.js 18+
- npm 9+
- Senéhorario Backend (running locally or remotely)

## Building and Running Locally

To install dependencies and run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:4200/` by default.

## Backend Options

You can use the frontend with either:

1. **The Provided Hosted Backend (default for the live site):**
   - No setup required, just use the published site.

2. **Your Own Backend Instance:**
   - Clone and start the [Senéhorario Backend](https://github.com/cmolina12/senehorario-backend) by following its README instructions. By default, the backend runs on `http://localhost:8080/`.
   - To connect your local frontend to your own backend, update the relevant environment configuration file in `src/environments/`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
