import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Integration suites share one TEST_DATABASE_URL and reset the schema in
    // beforeAll — they must not run concurrently with each other.
    fileParallelism: false,
  },
});
