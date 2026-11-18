// Entry program for the news-image-20261118 bounty.
// The finished picture of Wednesday 18 November 2026 lives next to this
// file as entry.png. This program reads that file into memory and writes
// the same bytes into the output directory, creating the directory first
// when it is missing. The destination folder comes from
// MAKEFUN_OUTPUT_DIR when that variable is set; otherwise it falls back
// to /output, as the grader expects.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptFolder = path.dirname(fileURLToPath(import.meta.url));
const picturePath = path.resolve(scriptFolder, 'entry.png');

const requestedDir = process.env.MAKEFUN_OUTPUT_DIR;
const outputFolder = requestedDir ? path.resolve(requestedDir) : '/output';
const destinationPath = path.resolve(outputFolder, 'entry.png');

const pictureBytes = fs.readFileSync(picturePath);

// Guard against a corrupted or swapped source file: the grader tells PNG
// and JPEG apart by their leading bytes, so refuse to ship anything whose
// header matches neither format instead of copying it blindly.
const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_HEADER = [0xff, 0xd8, 0xff];
const startsWith = (bytes, header) => header.every((value, index) => bytes[index] === value);
const looksLikeImage = startsWith(pictureBytes, PNG_HEADER) || startsWith(pictureBytes, JPEG_HEADER);
if (!looksLikeImage) {
  const firstBytes = [...pictureBytes.subarray(0, 8)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join(' ');
  console.error(`Refusing to copy ${picturePath}: it is neither a PNG nor a JPEG image (first bytes: ${firstBytes}).`);
  process.exit(1);
}

fs.mkdirSync(outputFolder, { recursive: true });
fs.writeFileSync(destinationPath, pictureBytes);

console.log(`Wrote ${pictureBytes.byteLength} bytes to ${destinationPath}`);
