# dolce gusto qr code handler

This project aims to simplify the tedious task of entering qr codes found in dolce-gusto packages to their incredibly slow website.
At the moment, this projects is written for the Swiss version of the dolce-gusto site only.

## Prerequisites

- Node.js and npm installed
- Chrome Browser installed
- Selenium installed

## Install

_Make sure to execute all this steps carefully to install the application._

### 0. Navigate to the backend dir

1. All configuration has to be done in the backend folder, so navigate into in `cd backend`

### 1. Set up the .env file

1. Rename the `.env.template` file to `.env`.

2. Enter your dolce-gusto `USERNAME` and `PASSWORD` to the `.env` file.

### 2. Generate public/private key for ssl

1. Generate a server.crt and a server.key and add them to the `certs` directory.

2. Enter the `PASSPHRASE` of the certificates to the `.env` file

NOTE: SSL is needed in order to access the camera on the browser.

### 3. Install dependencies

1. Install the project dependencies with `npm i`

## Launch

To launch the app, simply run `npm start` in the `backend` folder.

## Usage

You can now visit the site on `https://localhost:8443`.

It is recommended to access the site with an external smartphone, as it is easier to scan the qr codes.

Scan some codes and hit the button on the bottom right on the browser.
The server will now enter the codes to the dolce-gusto website.
Scanned codes are saved to the backend. Once you hit the button, all saved codes will be sent to the site.
If you wait for the action to finish on the browser, you will get an update on how many points you have earned.

## Roadmap

- Add a build script / dockerize the application.
- Make the selenium implementation more resilient.
- On load of the website, show the current amount of codes stored in the backend.
- Add a cron job to upload the codes
- Save the total amount of gained points and display it to the user
- Add a high score system when scanning the codes.
- Make the scanning even more pleasing in general (e.g. add some funny graphics, improve the UI)
