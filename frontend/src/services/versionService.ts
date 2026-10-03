import { VERSION_INFO } from '../config/version';

interface VersionCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  releaseUrl: string;
}

export async function checkLatestVersion(): Promise<VersionCheckResult> {
  return {
    hasUpdate: false,
    latestVersion: VERSION_INFO.version,
    releaseUrl: '',
  };
}

export function shouldCheckVersion(): boolean {
  return false;
}

export function markVersionChecked(): void {}

export function getCachedVersionInfo(): VersionCheckResult | null {
  return null;
}

export function cacheVersionInfo(_info: VersionCheckResult): void {}

export function markUpdateViewed(_version: string): void {}

export function hasViewedUpdate(_version: string): boolean {
  return true;
}
