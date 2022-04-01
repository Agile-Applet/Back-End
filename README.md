
![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)


# Casino Platform

Back-End side of the Casino Platform.



## License

[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)


## Directory Layout

```bash
  Back-End
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
├──.github
|   └──workflows
|          └──node.js.yml
|           
├──infrastructure
|       conn.js
|       redis.js
|
├──routes
|     └──money.js
|       
├──scripts
|      └──application_start.sh
|      └──application_stop.sh
|      └──before_install.sh
|       
├──test
|   └──index.test.js
|       
├──txholdem
|   |  └──Player.js
|   |  └──Room.js
|   |  └──RoomPlayer.js
|   |   
|   └──utils
|        └──helpers.js
|        └──validation.js
|           
└──user
    └──auth.js
    └──session.js
    └──users.js

```

## Authors

- [@S1nd5](https://www.github.com/s1nd5)
- [@otsojm](https://www.github.com/otsojm)
- [@PutkisDude](https://www.github.com/PutkisDude)
- [@Danquu](https://www.github.com/Danquu)


## Demo

- [Main page](https://casinohaaga.awsproject.link)
- [API](https://json.awsproject.link)

## Features

- under construction ...


## Roadmap

- under construction ...


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

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

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Related

Here are some related projects:

[Placeholder](https://github.com/user/repo)

