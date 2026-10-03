import { useNavigate } from 'react-router-dom';
import { Modal, Button, Space, Typography, Progress } from 'antd';
import { CrownOutlined, ThunderboltOutlined, LockOutlined } from '@ant-design/icons';
import type { SubscriptionInfo } from '../services/subscriptionService';

const { Text, Title } = Typography;

interface UsageLimitModalProps {
  visible: boolean;
  subscriptionInfo: SubscriptionInfo | null;
  onClose: () => void;
  onUpgrade: (level: string) => void;
}

export default function UsageLimitModal({
  visible,
  subscriptionInfo,
  onClose,
}: UsageLimitModalProps) {
  const navigate = useNavigate();
  if (!subscriptionInfo) return null;

  const goToPricing = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <Modal
      title={
        <Space>
          <LockOutlined style={{ color: '#faad14' }} />
          <span>今日生成次数已用完</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            您当前使用的是 <Text strong>{subscriptionInfo.subscription_name}</Text>
          </Text>
          <div style={{ marginTop: 12 }}>
            <Progress 
              percent={100} 
              strokeColor="#ff4d4f"
              format={() => `${subscriptionInfo.daily_generation_used} / ${subscriptionInfo.daily_generation_limit}`}
              style={{ maxWidth: 300, margin: '0 auto' }}
            />
          </div>
        </div>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div
            style={{
              padding: 16,
              border: '2px solid #1890ff',
              borderRadius: 8,
              background: '#e6f7ff',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={goToPricing}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  <ThunderboltOutlined style={{ color: '#1890ff' }} /> 基础版
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  每日 30 次生成 · 每月 10 万字
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                  ¥29
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>/月</Text>
                </div>
                <Button type="primary" size="small" style={{ marginTop: 8 }}>
                  查看套餐
                </Button>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 16,
              border: '2px solid #faad14',
              borderRadius: 8,
              background: '#fffbe6',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={goToPricing}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 173, 20, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  <CrownOutlined style={{ color: '#faad14' }} /> 专业版
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  无限次生成 · 每月 50 万字
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                  ¥59
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>/月</Text>
                </div>
                <Button type="primary" size="small" style={{ marginTop: 8, background: '#faad14', borderColor: '#faad14' }}>
                  查看套餐
                </Button>
              </div>
            </div>
          </div>
        </Space>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            点击套餐查看详情，支持月付和年付
          </Text>
        </div>
      </div>
    </Modal>
  );
}
