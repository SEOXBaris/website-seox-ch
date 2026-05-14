import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

function readSection(name: string): string {
  let html = cache.get(name);
  if (!html) {
    html = fs.readFileSync(
      path.join(process.cwd(), "src/components/sections", `${name}.html`),
      "utf-8"
    );
    cache.set(name, html);
  }
  return html;
}

export function Section({ name }: { name: string }) {
  return (
    <div
      data-section={name}
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: readSection(name) }}
    />
  );
}
