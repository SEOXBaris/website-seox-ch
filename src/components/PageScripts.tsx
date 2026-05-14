import Script from "next/script";
import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

function readScript(): string {
  let js = cache.get("page");
  if (!js) {
    js = fs.readFileSync(
      path.join(process.cwd(), "src/components/sections", "PageScript.html"),
      "utf-8"
    );
    cache.set("page", js);
  }
  return js;
}

export function PageScripts() {
  return (
    <Script id="seox-page-logic" strategy="afterInteractive">
      {readScript()}
    </Script>
  );
}
