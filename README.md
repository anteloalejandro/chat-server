# Overview

This repo hosts the code for the backend with which <https://aantelo.es> is built.

It's fully written en JavaScript using Express, and can be configured with a file called `settings.json`.

These are the default options that can be changed via `settings.json`:
```json
{
  "key": "./snake-oil.key",
  "cert": "./snake-oil.crt",
  "port": 3000,
  "httpPort": 8080,
  "root": "./demo"
}
```

# Installation

First, clone the project and install its dependencies:

```bash
git clone https://github.com/anteloalejandro/chat-server
cd chat-server
npm install
```

Then, create `settings.json` if you want to change some settings and run the server (you must have MongoDB installed and running for this to work). 

```bash
node index.js
```

The server comes with a small demo app that requires manual retouches to work. You can create your own or check this other, more complete implementation of a frontend [here](https://github.com/anteloalejandro/chat-app)

_To make it into a proper service, consider installing [pm2](https://www.npmjs.com/package/pm2)._
