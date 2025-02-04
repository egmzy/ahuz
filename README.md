# Ahuz – Israeli Guesspionage Game

Ahuz is a real‑time multiplayer game inspired by Jackbox’s Guesspionage. Players use their mobile devices to answer questions based on Israeli statistics while a main screen (or TV) shows the question. The player whose answer is closest to the correct percentage wins!

<img width="1512" alt="Screenshot 2025-02-04 at 14 29 27" src="https://github.com/user-attachments/assets/1bab9db1-3e7e-40bf-ad0d-18d4a52665a1" />

<img width="1511" alt="Screenshot 2025-02-04 at 14 31 00" src="https://github.com/user-attachments/assets/ea203a70-46fc-4f00-9145-409bd7f7fc16" />

<img width="1512" alt="Screenshot 2025-02-04 at 14 32 15" src="https://github.com/user-attachments/assets/9201142a-00ef-4696-b60d-51ed26aa2e8d" />


## Features

- **Real-time gameplay:** Uses Socket.io for live updates.
- **Room management:** Create or join rooms for a custom game.
- **Dynamic questions:** Questions about everyday Israeli statistics.
- **Score tracking:** Scores are calculated by the absolute difference between the player’s guess and the correct percentage.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the server with `npm start` (which runs `node server/index.js`).

## Usage

- Open the main screen (e.g. on a TV or desktop) by visiting `http://localhost:3000`.
- Players join the game from their mobile devices by entering their name and the room number.
- The host starts the game, questions are displayed, and players submit their answers.
- Scores are updated and shown in real‑time.

## Deployment

For local testing, run the server on your machine and share your network IP address. For production, consider using a host that supports persistent WebSocket connections.

## License

This project is licensed under the MIT License.
