# EchoSocial

EchoSocial is a real-time social media platform that connects users within their local communities. It allows users to post messages, share images, and engage with content from others in their vicinity. The platform focuses on localized interactions, making it ideal for discovering events, discussions, and news relevant to nearby users.

## Features

- **Local Connectivity**: Users can interact with people nearby, fostering stronger community bonds.
- **Real-time Messaging**: Live updates and instant interactions with WebSockets.
- **User Authentication**: Secure registration and login system.
- **Media Sharing**: Post text messages and images for local audiences.
## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm

### Steps to Set Up

#### Clone the Repository:

```sh
git clone https://github.com/AhmAchJR/echo-social-socet.git
cd echo-social-socet
```

#### Install Dependencies:

```sh
npm install
```

#### Configure Environment Variables:

1. Create a `.env` file in the root directory.
2. Add required environment variables such as:

```env
PORT=3000
```

#### Run Migrations:

```sh
npm run migrate
```

#### Start the Server:

```sh
npm start
```

The application will be running on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
.
├── controller/       # Application logic and controllers
├── db/              # Database configuration
├── middlewares/     # Custom middleware functions
├── migrations/      # Database migration files
├── public/          # Static assets (CSS, images, JS)
├── routes/          # API and page routes
├── server/          # Server setup and WebSocket implementation
├── tests/           # Unit and integration tests
├── views/           # EJS templates for front-end rendering
└── .env.example     # Example environment variables file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML, CSS
- **Database**: SQLite (or another SQL database)
- **Real-time Communication**: WebSockets (ws library)
- **Authentication**: Sessions (using express-session)

## Contributing

We welcome contributions to improve EchoSocial! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch:

   ```sh
   git checkout -b feature/your-feature
   ```

3. Commit your changes:

   ```sh
   git commit -m 'Add your feature'
   ```

4. Push to the branch:

   ```sh
   git push origin feature/your-feature
   ```

5. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, feel free to contact **Ahmed Achraf** at [ahmedachraf0v@gmail.com](mailto:your.email@example.com).
