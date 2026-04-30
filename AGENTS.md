# Repository Guidelines

## Project Structure & Module Organization

This repository contains the MicroBlocks VM and desktop IDE code. `vm/` holds Arduino/PlatformIO firmware sources, runtime code, primitives, and board-specific C/C++ files. `ide/` contains GP Blocks IDE modules, while `gp/` contains the GP runtime, launchers, and packaging helpers. `boards/` stores PlatformIO board metadata and variants. `img/`, `misc/`, and `translations/` contain UI assets, docs, and `.po` locale files. Platform-specific or generated assets live in `precompiled/`, `esp32/`, `linux+pi/`, `boardie/`, and `extraVMs/`. Small tests are under `misc/tests/`.

## Build, Test, and Development Commands

- `pio run`: compile firmware for all PlatformIO environments in `platformio.ini`.
- `pio run -e microbit -t upload`: build and upload one board target; replace `microbit` as needed.
- `./build.sh --dev`: build the desktop IDE for this host and launch it with a GP REPL.
- `./build.sh --system=linux64bit`: build the IDE for a specific desktop target.
- `./build.sh --vm`: refresh precompiled VM assets through `precompiled/updatePrecompiled.sh`.
- `./build.sh --locale=zh-chs`: update one locale; use `--locale=all` only for broad translation work.
- `gcc -Ivm misc/tests/tinyJSONTests.c vm/tinyJSON.c -o /tmp/tinyJSONTests && /tmp/tinyJSONTests`: compile and run the standalone tinyJSON test.

## Coding Style & Naming Conventions

Match nearby code style instead of reformatting broad areas. C/C++ files use compact functions, tabs in many blocks, `camelCase` function names, and descriptive primitive filenames such as `outputPrims.cpp`. GP files use `to`, `method`, and `defineClass` declarations matching existing IDE modules. Keep comments concise and preserve the MPL 2.0 header on new source files.

## Testing Guidelines

There is no single full test runner in the repository. For firmware work, run the narrowest relevant `pio run -e <env>` first, then broader `pio run` if the change affects shared VM code. For parser/runtime utilities, add or update small tests under `misc/tests/` and document the exact compile command used.

## Commit & Pull Request Guidelines

Recent history uses short messages such as `fix tft spi cs pin`, `fix style`, and `feat: ...`. Prefer concise imperative subjects, optionally prefixed with `feat:` or `fix:`. Keep commits scoped by area, especially when translations or generated assets change. Pull requests should include a summary, affected boards/platforms, commands run, linked issues when relevant, and screenshots for visible IDE/UI changes.

## Security & Configuration Tips

Do not commit local PlatformIO caches, credentials, or machine-specific editor settings. Review generated binaries and translation churn before committing, and avoid unrelated changes to `apps/`, `precompiled/`, or locale files unless the task explicitly requires them.
