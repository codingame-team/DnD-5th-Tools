# Changelog

## Unreleased

- chore: removed temporary runtime placeholders for type-only exports (`CellState`, `Token`). These were causing accidental runtime imports and are not necessary under verbatim TypeScript imports. The change keeps types as type-only exports and removes empty runtime objects.
