# Requirements
- Twinkle Tray
- Node.js
- Being technically inclined

# How to run
1. Download this repository
2. Rename `config.js.example` to `config.js` and change the values within according to your environment and preference
3. Open a terminal in the code directory
4. Install packages: `npm i`
5. Run the script: `npm start`

# FAQ

## Can _you_ add [feature]?
No, but feel free to fork and/or provide a pull request.

This app is a bandaid that I will deprecate the moment official support exist, so I will personally not spend time adding more than a bare minimum of functionality

## I don't want a terminal open, how do I run this in the background?
1. Install forever: `npm install forever -g`
2. Open a terminal in the code directory and run: `forever start index.js`

## How do I stop it when it runs in the background?
If you don't use forever for something else just `forever stopall`

If you do use it for something else look for the correct id in `forever list` and stop it with `forever stop IDHERE`
