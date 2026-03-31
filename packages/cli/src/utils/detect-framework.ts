import fs from "fs-extra";
import path from "path";

export type Framework = "react" | "svelte" | "vue";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function detectFramework(cwd: string): Promise<Framework | null> {
  const pkgPath = path.join(cwd, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    return null;
  }

  const pkg: PackageJson = await fs.readJson(pkgPath);
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const frameworks: { name: Framework; packages: string[] }[] = [
    { name: "react", packages: ["react", "react-dom", "next"] },
    { name: "svelte", packages: ["svelte", "@sveltejs/kit"] },
    { name: "vue", packages: ["vue", "nuxt"] },
  ];

  const detected: Framework[] = [];
  for (const fw of frameworks) {
    if (fw.packages.some((pkg) => pkg in allDeps)) {
      detected.push(fw.name);
    }
  }

  if (detected.length === 1) {
    return detected[0];
  }

  return null;
}
