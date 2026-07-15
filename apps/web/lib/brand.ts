// The ONE sanctioned place for raw hex in app code. Web manifests and
// <meta name="theme-color"> cannot resolve CSS custom properties, so the
// values needed there live here as literals. Keep in sync with
// packages/design-system/tokens/colors.css (--screen-base). The CI
// design-token gate excludes exactly this file.
export const SCREEN_BASE = "#08120A";
