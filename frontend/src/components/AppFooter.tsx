import { Typography, theme } from 'antd';

const { Text } = Typography;

interface AppFooterProps {
  sidebarWidth?: number;
}

export default function AppFooter({ sidebarWidth = 0 }: AppFooterProps) {
  const { token } = theme.useToken();
  const alphaColor = (color: string, alpha: number) => `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(0)}%, transparent)`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: sidebarWidth,
        right: 0,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid ${token.colorBorder}`,
        padding: '8px 16px',
        zIndex: 100,
        boxShadow: `0 -2px 16px ${alphaColor(token.colorText, 0.08)}`,
        backgroundColor: alphaColor(token.colorBgContainer, 0.82),
        transition: 'left 0.3s ease',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
        <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
          墨小语 v1.0.0 — AI驱动的专业网文创作平台
        </Text>
      </div>
    </div>
  );
}
