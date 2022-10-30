# dolce gusto qr code handler

This project aims to simplify the tedious task of entering qr codes found in dolce-gusto packages to their incredibly slow website.
At the moment, this projects is written for the Swiss version of the dolce-gusto site only.
_Do not expose the server to the internet, as it is not hardened_

## Prerequisites

- Docker-Compose installed

## Install

### 1. Set up the .env file

1. Rename the `.env.template` file to `.env`.

2. Exchange the dummy values with your personal dolce-gusto credentials (`DG_USERNAME` and `DG_PASSWORD`) to the `.env` file. You can also change

## Launch

Run `./up prod` to launch the server

## Usage

You can now visit the site on `http://localhost:80` or on the port you specified in the `.env` file

It is recommended to access the site with an external smartphone, as it is easier to scan the qr codes.

Scan some codes. The server will every full hour enter the codes to the dolce-gusto website (if there are new codes).

## Roadmap

- Add a high score system when scanning the codes.
- Make the scanning even more pleasing in general (e.g. add some funny graphics, improve the UI)
