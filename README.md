# Project Fitness

Local-first Expo Go workout prototype for iPhone, pinned to Expo SDK 54. Use Node.js 24 LTS for development and the real SQLite verification script.

## Run from a laptop

```sh
git clone https://github.com/rendookks/project-fitness.git
cd project-fitness
npm ci
npx expo start --go --lan
```

If already downloaded, run the last two commands from the repository root. Use an Expo Go version compatible with SDK 54. Connect the laptop and iPhone to the same Wi-Fi and scan the terminal's QR code with the iPhone Camera, then open in Expo Go. Network connectivity depends on the local network. If LAN is blocked, Expo tunnel mode is an alternative: install the optional `@expo/ngrok` tool when prompted (or `npm install --global @expo/ngrok` on your laptop), then use `npx expo start --go --tunnel`. Tunnel availability depends on that external service.

## Verification

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
npm run doctor
npm run export:check
```

SDK compatibility and bundling do not prove native runtime behavior. Physical iPhone launch, keyboard, persistence after app termination, accessibility, and visual review remain required. See ROADMAP.md for completed checkpoints and limitations. No personal fitness records leave the device; SQLite data is not encrypted. Development tools may access the network to serve the bundle.
