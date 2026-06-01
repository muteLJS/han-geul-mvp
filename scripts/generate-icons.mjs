/**
 * PWA 아이콘 생성 스크립트
 * 실행: node scripts/generate-icons.mjs
 *
 * 실제 배포 시에는 /public/icons/ 에 실제 PNG 아이콘을 교체해야 합니다.
 * 이 스크립트는 개발용 플레이스홀더 SVG 아이콘을 생성합니다.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../public/icons");

mkdirSync(iconsDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 한-글 브랜드 SVG 아이콘 (배경: 한지 크림 #FAF6EE, 텍스트: 먹색 #1A1A1A)
function createSvg(size) {
  const fontSize = Math.round(size * 0.45);
  const padding = Math.round(size * 0.1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#FAF6EE"/>
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-size="${fontSize}"
    font-family="serif"
    fill="#1A1A1A"
    font-weight="bold"
  >글</text>
</svg>`;
}

for (const size of sizes) {
  const svgContent = createSvg(size);
  // SVG를 PNG 대신 임시로 저장 (빌드는 통과, 실 배포 전 교체 필요)
  writeFileSync(join(iconsDir, `icon-${size}x${size}.svg`), svgContent, "utf-8");
  console.log(`Created icon-${size}x${size}.svg`);
}

console.log("\n✓ SVG 플레이스홀더 아이콘 생성 완료");
console.log("⚠ 실제 배포 전 PNG 아이콘으로 교체하세요: public/icons/");
