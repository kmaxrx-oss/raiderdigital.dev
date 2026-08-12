import { describe, expect, it } from "vitest";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("names the public product", () => {
    expect(siteConfig.name).toBe("Raider Digital");
    expect(siteConfig.intakePath).toBe("/project-intake");
  });
});
