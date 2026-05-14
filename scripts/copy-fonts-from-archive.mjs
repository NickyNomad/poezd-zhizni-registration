import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const archive = process.argv[2] || "../Москва — город мастеров.zip";
const outDir = path.resolve("public/fonts");

if (!fs.existsSync(archive)) {
  console.error(`Архив не найден: ${archive}`);
  console.error("Передайте путь к архиву: npm run copy-fonts -- \"/путь/Москва — город мастеров.zip\"");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const files = [
  "Москва — город мастеров/шрифт/oldtimer/Oldtimer.ttf",
  "Москва — город мастеров/шрифт/Golos (наборный)/GolosText-Regular.ttf",
  "Москва — город мастеров/шрифт/Golos (наборный)/GolosText-Medium.ttf",
  "Москва — город мастеров/шрифт/Golos (наборный)/GolosText-SemiBold.ttf",
  "Москва — город мастеров/шрифт/Golos (наборный)/GolosText-Bold.ttf",
  "Москва — город мастеров/шрифт/Golos (наборный)/GolosText-Black.ttf",
];

for (const file of files) {
  execFileSync("unzip", ["-p", archive, file], { stdio: ["ignore", fs.openSync(path.join(outDir, path.basename(file)), "w"), "inherit"] });
  console.log(`Скопирован: ${path.basename(file)}`);
}

console.log("Готово: шрифты скопированы в public/fonts");
