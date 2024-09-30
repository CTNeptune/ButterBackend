# ButterBackend

ButterBackend is the Node.js server for the [Butter](https://github.com/CTNeptune/ButterApp/) app. This allows users to store their movie collections in the cloud, making it accessible from multiple devices.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
2. **npm**: Node.js package manager, which comes bundled with Node.js installation.
3. **SQLite**: The server uses SQLite as its database. Make sure you have SQLite installed.

## Getting Started

Follow the steps below to clone the repository and start the server.

### 1. Clone the Repository

Open your terminal and run the following command to clone the ButterBackend repository:

```bash
git clone https://github.com/CTNeptune/ButterBackend.git
```

### 2. Navigate to the Project Directory

Change your directory to the cloned project folder:

```bash
cd ButterBackend
```

### 3. Install Dependencies

Run the following command to install the required Node.js packages:

```bash
npm install
```

### 4. Configure secret
In auth.js, change JWT_SECRET to something other than 'not a real secret'.

### 5. Start the Server

To start the server, run the following command:

```bash
npm start
```

The server will start running on the specified port (default is `3000`)

## Contributions
Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
