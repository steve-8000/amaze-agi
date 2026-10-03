import { verifySources } from "../src/sources/index.ts";

const result = await verifySources();
if (result.errors.length) {
  console.error(`Source verification failed (${result.errors.length} errors):`);
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Verified ${result.skills} skills, ${result.files} files, ${result.licenseFiles} license files, and ${result.skills} exports.`,
  );
}
