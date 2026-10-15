# Parking form keys hint, 15 October 2026

Branch `fix/parking-keys-hint`. Owner, in chat on 15 October 2026: "customers keep their keys".

- [x] The notes field on the parking booking form suggested "Leaving keys with reception", which contradicts the rule that you keep your keys. It now suggests "Anything we should know about your arrival".
- [x] `tests/unit/parking-keys-hint.test.ts` fails if the form suggests leaving keys again.
