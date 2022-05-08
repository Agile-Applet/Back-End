# Casino Platform [![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

Back-End side of the Casino Platform @ Haaga-Helia Project course 2.


## Directory Layout

```bash
  Back-End #Miscellaneous
|   .env
|   .eslintrc
|   .gitignore
|   .prettierrc
|   appspec.yml
|   index.js
|   LICENSE
|   package-lock.json
|   package.json
|   README.md
|   
+---.github #Run test suites
|   \---workflows
|           node.js.yml
|           
+---infrastructure #Connect to database and in-memory data
|       conn.js
|       redis.js
|                          
+---routes 
|       money.js #Endpoint to update players balance
|       
+---scripts #Autodeploy on EC2 instance at AWS
|       application_start.sh
|       application_stop.sh
|       before_install.sh
|       
+---test #Test suites
|       index.test.js
|       
+---txholdem #Different classes related to Texas Holdem and Controller to manage the game flow
|   |   Card.js
|   |   Controller.js
|   |   Deck.js
|   |   Player.js
|   |   Room.js
|   |   RoomPlayer.js
|   |   Round.js
|   |   Seat.js
|   |   
|   \---utils #Helper functions e.g, deal cards and validate player actions
|           depositGameFunds.js
|           roundhelpers.js
|           
\---user #Authenticate users at login/register and establish session
        auth.js
        session.js
        users.js
```


## Authors

- [@S1nd5](https://www.github.com/s1nd5)
- [@PutkisDude](https://www.github.com/PutkisDude)
- [@otsojm](https://www.github.com/otsojm)
- [@Danquu](https://www.github.com/Danquu)
- [@RiikonenMiro](https://www.github.com/RiikonenMiro)


## Demo

- [API](https://json.awsproject.link)


## Features

- Express server.
- API for login, register and deposit.
- MongoDB NoSQL Database and Redis in-memory data store.
- Express session.
- Handle Texas Holdem game flow with socket.io.


# Dependencies

```bash
"dependencies": {
    "bcryptjs": "^2.4.3",
    "connect-mongo": "^4.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.17.2",
    "express-session": "^1.17.2",
    "express-validator": "^6.14.0",
    "mongodb": "^4.3.1",
    "pokersolver": "^2.1.4",
    "redis": "^4.0.4",
    "socket.io": "^4.4.1"
  }
 ```

## Roadmap

- Handling chat messages and game notifications, which are delivered by socket.io.
- Handling "leave queue".
- Updating money transactions to the database, which are related to Texas Holdem (buy-in, leaving the table and buying more chips).


## Environment Variables

To run this project, you will need to at least add the following environment variables to your .env file:

`MONGODB_STRING`

`SESSION_SECRET`

`SALT`


## Run Locally

Clone the project

```bash
  git clone https://github.com/Agile-Applet/Back-End.git
```


Go to the project directory

```bash
  cd Back-End
```


Install dependencies

```bash
  npm install
```


Start the server

```bash
  node .
```


## Running Tests

To run tests, run the following command:

```bash
  npm test
```

## Screenshots

![Back-End](https://i.ibb.co/hMwTVMH/backend.png)
 

## Related

Here are some related projects:

- [Front-End side](https://github.com/Agile-Applet/Front-End)
