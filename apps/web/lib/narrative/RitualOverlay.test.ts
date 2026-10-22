import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { SelenaLine } from "./RitualOverlay";

function propsOf(node: ReactNode): Record<string, unknown> {
  if (!isValidElement(node)) throw new Error("Expected a React element.");
  return node.props as Record<string, unknown>;
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node) && node.type !== "style") {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function snapshotText(text: string): string {
  return text.replaceAll("\"", "[quote]");
}

describe("SelenaLine", () => {
  it("quotes Selena's line and renders the trailing sign-off", () => {
    const element = SelenaLine({ children: "You found the station." }) as ReactElement<{
      children: ReactNode;
    }>;
    const children = element.props.children as ReactNode[];
    const opener = propsOf(children[0]);
    const closer = propsOf(children[2]);
    const visibleText = textOf(children);
    const hiddenMarkers = [
      { text: textOf(opener.children as ReactNode), ariaHidden: opener["aria-hidden"] },
      { text: textOf(closer.children as ReactNode), ariaHidden: closer["aria-hidden"] },
    ];

    expect(visibleText).toBe("\"You found the station.\" — S.C.");
    expect(hiddenMarkers).toEqual([
      { text: "\"", ariaHidden: "true" },
      { text: "\" — ", ariaHidden: "true" },
    ]);

    expect({
      visibleText: snapshotText(visibleText),
      hiddenMarkers: hiddenMarkers.map((marker) => ({
        ...marker,
        text: snapshotText(marker.text),
      })),
    }).toMatchInlineSnapshot(`
      {
        "hiddenMarkers": [
          {
            "ariaHidden": "true",
            "text": "[quote]",
          },
          {
            "ariaHidden": "true",
            "text": "[quote] — ",
          },
        ],
        "visibleText": "[quote]You found the station.[quote] — S.C.",
      }
    `);
  });
});
