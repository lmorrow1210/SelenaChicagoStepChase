/**
 * The one demo flag, kept in its own tiny module so code that only needs to
 * know "is this the static demo?" does not pull the fixture bundle
 * (lib/demo.ts and the whole Season One config) into the page.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
