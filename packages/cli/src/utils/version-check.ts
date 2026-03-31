import semver from "semver";
import type { RegistryIndex } from "./registry.js";

export interface VersionCheckResult {
  compatible: boolean;
  message?: string;
}

export function checkCliRegistryCompatibility(
  cliVersion: string,
  registry: RegistryIndex
): VersionCheckResult {
  const { minCliVersion, maxCliVersion } = registry;

  if (semver.lt(cliVersion, minCliVersion)) {
    return {
      compatible: false,
      message: `CLI version ${cliVersion} is too old for this registry (requires >= ${minCliVersion}). Please update: npm install -g win7ui@latest`,
    };
  }

  if (!semver.satisfies(cliVersion, maxCliVersion)) {
    return {
      compatible: false,
      message: `CLI version ${cliVersion} may not be compatible with this registry (supports up to ${maxCliVersion}). Consider updating: npm install -g win7ui@latest`,
    };
  }

  return { compatible: true };
}
