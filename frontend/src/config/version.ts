/**
 * 应用版本信息配置
 */

export const VERSION_INFO = {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString().split('T')[0],
  projectName: '墨小语',
  projectFullName: '墨小语 - AI网文创作平台',
  githubUrl: '',
  linuxDoUrl: '',
  license: '',
  licenseUrl: '',
  author: '',
};

export const getVersionString = () => {
  return `v${VERSION_INFO.version}`;
};

export const getFullVersionInfo = () => {
  return `${VERSION_INFO.projectName} ${getVersionString()} - Build ${VERSION_INFO.buildTime}`;
};
