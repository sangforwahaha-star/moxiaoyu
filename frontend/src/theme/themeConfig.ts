import type { ThemeConfig } from 'antd';
import { theme } from 'antd';
import type { ThemeMode } from './themeStorage';

export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

const sharedToken: ThemeConfig['token'] = {
  colorPrimary: '#165DFF',
  colorLink: '#FF7D00',
  borderRadius: 8,
  wireframe: false,
  fontFamily: "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Heiti SC', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSizeHeading1: 36,
  fontSizeHeading2: 28,
  fontSizeHeading3: 22,
  fontSizeHeading4: 18,
  fontSizeHeading5: 15,
};

const sharedComponents: ThemeConfig['components'] = {
  Button: {
    borderRadius: 8,
    controlHeight: 40,
  },
  Input: {
    controlHeight: 40,
    borderRadius: 8,
  },
  Card: {
    borderRadiusLG: 12,
  },
  Tooltip: {
    colorBgSpotlight: '#165DFF',
    borderRadius: 8,
  },
  Menu: {
    borderRadius: 8,
  },
  Tabs: {
    borderRadius: 8,
  },
};

const lightThemeConfig: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedToken,
    colorBgBase: '#F7F8FA',
    colorTextBase: '#1A1D26',
    colorBgLayout: '#F7F8FA',
    colorBgContainer: '#FFFFFF',
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
  },
  components: {
    ...sharedComponents,
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      primaryShadow: '0 4px 16px rgba(22, 93, 255, 0.24)',
    },
    Card: {
      borderRadiusLG: 12,
      colorBgContainer: '#FFFFFF',
    },
    Layout: {
      bodyBg: '#F7F8FA',
      headerBg: '#FFFFFF',
      siderBg: '#0F172A',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkSubMenuItemBg: '#0B1220',
      darkItemSelectedBg: '#165DFF',
      darkItemSelectedColor: '#FFFFFF',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemHoverColor: '#FFFFFF',
      darkItemHoverBg: 'rgba(255,255,255,0.08)',
    },
  },
};

const darkThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedToken,
    colorBgBase: '#0F172A',
    colorTextBase: '#F8FAFC',
    colorBgLayout: '#0F172A',
    colorBgContainer: '#1E293B',
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
  },
  components: {
    ...sharedComponents,
    Layout: {
      bodyBg: '#0F172A',
      headerBg: '#1E293B',
      siderBg: '#0F172A',
    },
    Menu: {
      darkItemBg: '#0F172A',
      darkSubMenuItemBg: '#0B1220',
      darkItemSelectedBg: '#165DFF',
      darkItemSelectedColor: '#FFFFFF',
      darkItemColor: 'rgba(255,255,255,0.6)',
      darkItemHoverColor: '#FFFFFF',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
    },
  },
};

export const getThemeConfig = (mode: ResolvedThemeMode): ThemeConfig => {
  return mode === 'dark' ? darkThemeConfig : lightThemeConfig;
};
