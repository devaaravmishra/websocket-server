# WebSocket Server

This repository contains the code for a WebSocket server built using Fastify and Socket.IO, with Redis as the pub/sub mechanism. The server enables real-time communication between clients and supports various features such as messaging, call management, and user status updates.

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
-   [Health Check](#health-check)
-   [Socket Handler](#socket-handler)
-   [Dependencies](#dependencies)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/aaravmisshra/websocket-server.git
    cd websocket-server
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Start the server:**

    ```bash
    npm start
    ```

## Deployment

1. **Build the Docker image:**

    ```bash
    docker build -t websocket-server .
    ```

2. **Run the Docker container:**

    ```bash
    docker run -p 3000:3000 -d websocket-server
    ```

## Configuration

The server can be configured using environment variables. The following variables are supported:

| Variable                 | Description                                                        | Default Value                                          |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------ |
| `PORT`                   | The port on which the server will listen for incoming connections. | `3000`                                                 |
| `UPSTASH_REDIS_REST_URL` | The URL of the Redis instance.                                     | `redis://default:jslfjowje9323942084.upstash.redis.io` |
| `CORS_ORIGIN`            | The origin from which requests will be accepted.                   | `http://localhost:3000`                                |

## Usage

The server exposes the following endpoints:

| Endpoint      | Description                       |
| ------------- | --------------------------------- |
| `GET /health` | Returns the health of the server. |

## Health Check

The health of the server can be checked by sending a `GET` request to the `/health` endpoint. The response will be a JSON object with the following structure:

```json
{
	"status": "ok",
	"port": 3000,
	"uptime": 123456789
}
```

## Socket Handler

The server uses Socket.IO to handle WebSocket connections. The `socketHandler` function is responsible for handling the connection and disconnection of clients, as well as the various events that can be emitted by the clients. The function accepts a `socket` object as an argument, which is an instance of the `Socket` class. The `socket` object is used to send and receive messages from the client.

Also, the `socketHandler` function is responsible for maintaining a count of connected clients.

## Dependencies

The server uses the following dependencies:

| Dependency                 | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `fastify`                  | A web framework for Node.js.                      |
| `socket.io`                | A JavaScript library for real-time communication. |
| `@socket.io/redis-adapter` | A Redis adapter for Socket.IO.                    |
| `ioredis`                  | A Redis client for Node.js.                       |
| `fastify-cors`             | A CORS plugin for Fastify.                        |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
