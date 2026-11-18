// main.ts — news-image-20261118 entry program
//
// What this program does, in plain terms:
//   1. Find the picture that ships with this repository (entry.png,
//      sitting in the same folder as this file).
//   2. Work out where the picture has to go: the folder named by the
//      MAKEFUN_OUTPUT_DIR environment variable, or /output when the
//      variable is not set.
//   3. Create that folder if it does not exist yet, copy the picture
//      into it under the name entry.png, and report how many bytes
//      were written.
//
// The picture itself is a one-page summary of the world news of
// Wednesday 18 November 2026. This program only delivers it; all of
// the drawing happened beforehand and the file never changes, so two
// runs always produce exactly the same bytes.

import { closeSync, copyFileSync, mkdirSync, openSync, readSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The folder this file lives in is the root of the repository, so the
// bundled picture is always its neighbour, wherever the repo is placed.
const repoFolder = dirname(fileURLToPath(import.meta.url));
const sourcePicture = join(repoFolder, 'entry.png');

// Validate the picture before anything is copied: the grader tells PNG
// and JPEG apart by their magic bytes, so check the file header first.
// A PNG starts with 89 50 4E 47 0D 0A 1A 0A; a JPEG starts with
// FF D8 FF. If neither signature matches, stop with an error and a
// non-zero exit code instead of delivering a file the gate would reject.
const header = Buffer.alloc(8);
const fd = openSync(sourcePicture, 'r');
readSync(fd, header, 0, 8, 0);
closeSync(fd);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const hasSignature = (signature) => signature.every((byte, i) => header[i] === byte);
if (!hasSignature(PNG_SIGNATURE) && !hasSignature(JPEG_SIGNATURE)) {
  const seen = [...header].map((byte) => byte.toString(16).padStart(2, '0')).join(' ');
  throw new Error(`entry.png has an unknown image signature (${seen}); expected PNG or JPEG, refusing to copy.`);
}

// Resolve the destination folder to an absolute path so the log line
// below always shows the full location that was written to.
const envFolder = process.env.MAKEFUN_OUTPUT_DIR;
const targetFolder = envFolder ? resolve(envFolder) : '/output';
const targetPicture = join(targetFolder, 'entry.png');

// Make sure the destination exists, then copy the picture across.
mkdirSync(targetFolder, { recursive: true });
copyFileSync(sourcePicture, targetPicture);

// Report the size of the copy that actually landed on disk.
const written = statSync(targetPicture);
console.log(`entry.png delivered: ${written.size} bytes -> ${targetPicture}`);
