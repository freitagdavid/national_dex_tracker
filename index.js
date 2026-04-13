// Expo resolves `package.json` `main` relative to the project root (not via node_modules).
// `expo-router/entry` fails the preflight check; delegate to the package file.
import "expo-router/entry";
