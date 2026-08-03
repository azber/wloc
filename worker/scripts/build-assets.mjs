// 把仓库根目录的模块 / 脚本 / 图标嵌进 worker，生成 src/assets.js。
// 这样订阅地址可以完全走自己的域名，不依赖 raw.githubusercontent.com。
// 改完 modules/ 或 dist/ 后跑 `npm run build:assets`(deploy 会自动跑)。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const TEXT = "text/plain; charset=utf-8";
const FILES = [
  ["/modules/wloc.sgmodule", "modules/wloc.sgmodule", TEXT],
  ["/modules/wloc.conf", "modules/wloc.conf", TEXT],
  ["/modules/wloc.lpx", "modules/wloc.lpx", TEXT],
  ["/modules/wloc.stoverride", "modules/wloc.stoverride", TEXT],
  ["/modules/wloc.module", "modules/wloc.module", TEXT],
  ["/dist/wloc.js", "dist/wloc.js", "application/javascript; charset=utf-8"],
  ["/dist/wloc-settings.js", "dist/wloc-settings.js", "application/javascript; charset=utf-8"],
  ["/wloc.jpg", "wloc.jpg", "image/jpeg"],
];

const entries = FILES.map(([route, rel, type]) => {
  const buf = readFileSync(join(root, rel));
  const binary = type.startsWith("image/");
  const body = binary ? buf.toString("base64") : buf.toString("utf8");
  return `  ${JSON.stringify(route)}: { type: ${JSON.stringify(type)}, binary: ${binary}, body: ${JSON.stringify(body)} },`;
});

const out = `// 由 scripts/build-assets.mjs 生成，请勿手改。
// 源文件: ${FILES.map(([, rel]) => rel).join(", ")}
export const ASSETS = {
${entries.join("\n")}
};
`;

mkdirSync(join(root, "worker", "src"), { recursive: true });
writeFileSync(join(root, "worker", "src", "assets.js"), out);
console.log(`assets.js: ${FILES.length} 个文件, ${(out.length / 1024).toFixed(1)} KiB`);
