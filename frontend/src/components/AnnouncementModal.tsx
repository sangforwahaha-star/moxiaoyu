import { Modal, Button, Space, Typography, theme } from 'antd';

interface AnnouncementModalProps {
  visible: boolean;
  onClose: () => void;
  onDoNotShowToday: () => void;
  onNeverShow: () => void;
}

export default function AnnouncementModal({ visible, onClose, onDoNotShowToday, onNeverShow }: AnnouncementModalProps) {
  const { token } = theme.useToken();
  const alphaColor = (color: string, alpha: number) => `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(0)}%, transparent)`;

  return (
    <Modal
      title={
        <div style={{
          fontSize: '20px',
          fontWeight: 600,
          color: token.colorPrimary,
          textAlign: 'center',
        }}>
          🎉 欢迎使用 墨小语
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            onClick={onDoNotShowToday}
            size="large"
            style={{
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
            }}
          >
            今日内不再展示
          </Button>
          <Button
            type="primary"
            onClick={onNeverShow}
            size="large"
            style={{
              borderRadius: '8px',
              height: '40px',
              fontSize: '14px',
              background: token.colorPrimary,
              borderColor: token.colorPrimary,
              boxShadow: `0 8px 20px ${alphaColor(token.colorPrimary, 0.32)}`,
            }}
          >
            永不再展示
          </Button>
        </Space>
      }
      width={600}
      centered
      styles={{
        body: {
          padding: '20px',
          background: token.colorBgContainer,
        },
        header: {
          background: `linear-gradient(135deg, ${alphaColor(token.colorPrimary, 0.1)} 0%, ${alphaColor(token.colorBgContainer, 0.98)} 100%)`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '16px 24px',
        },
        footer: {
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '16px 24px',
        },
      }}
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <Typography.Title level={4} style={{ marginBottom: 12 }}>
          感谢使用墨小语 AI 创作平台
        </Typography.Title>
        <Typography.Paragraph style={{ fontSize: 15, color: token.colorTextSecondary, lineHeight: 1.8 }}>
          墨小语是新一代 AI 驱动的专业网文创作平台，
          <br />
          帮助作者从灵感到成稿，轻松完成长篇创作。
        </Typography.Paragraph>
        <div style={{
          marginTop: 20,
          padding: 16,
          background: token.colorBgLayout,
          borderRadius: 8,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            💡 快速开始
          </Typography.Text>
          <ul style={{ textAlign: 'left', margin: 0, paddingLeft: 24, color: token.colorTextSecondary }}>
            <li>创建你的第一个小说项目</li>
            <li>设置 AI 模型并开始创作</li>
            <li>管理角色、关系和剧情大纲</li>
            <li>享受 AI 带来的高效创作体验</li>
          </ul>
        </div>
        <div style={{
          marginTop: 16,
          padding: '10px',
          background: token.colorWarningBg,
          borderRadius: 8,
          border: `1px solid ${token.colorWarningBorder}`,
          fontSize: 13,
          color: token.colorWarning,
        }}>
          💡 提示：选择"今日内不再展示"当天不再显示，选择"永不再展示"将永久隐藏此公告
        </div>
      </div>
    </Modal>
  );
}