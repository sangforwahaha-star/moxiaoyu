import { useEffect, useState } from 'react';
import { Tag, Tooltip, Modal, Button, Space, Typography, Progress } from 'antd';
import { CrownOutlined, ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { subscriptionApi } from '../services/subscriptionService';
import type { SubscriptionInfo, SubscriptionTier } from '../services/subscriptionService';

const { Text, Title } = Typography;

interface SubscriptionBadgeProps {
  showUsage?: boolean;
  compact?: boolean;
}

export default function SubscriptionBadge({ showUsage = true, compact = false }: SubscriptionBadgeProps) {
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      const info = await subscriptionApi.getSubscriptionInfo();
      setSubInfo(info);
      
      const tiersData = await subscriptionApi.getSubscriptionTiers();
      setTiers(tiersData);
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    }
  };

  const handleUpgrade = async (level: string) => {
    try {
      await subscriptionApi.upgradeSubscription(level, 1);
      await loadSubscriptionInfo();
      setUpgradeModalVisible(false);
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  };

  if (!subInfo) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'free': return 'default';
      case 'basic': return 'blue';
      case 'pro': return 'gold';
      default: return 'default';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'basic': return <ThunderboltOutlined />;
      case 'pro': return <CrownOutlined />;
      default: return null;
    }
  };

  const usagePercent = subInfo.daily_generation_limit > 0 
    ? (subInfo.daily_generation_used / subInfo.daily_generation_limit) * 100 
    : 0;

  const badgeContent = compact ? (
    <Tag 
      color={getLevelColor(subInfo.subscription_level)} 
      icon={getLevelIcon(subInfo.subscription_level)}
      style={{ cursor: 'pointer' }}
      onClick={() => setUpgradeModalVisible(true)}
    >
      {subInfo.subscription_name}
    </Tag>
  ) : (
    <Tooltip
      title={
        <div>
          <div>今日已用：{subInfo.daily_generation_used} / {subInfo.daily_generation_limit === 999999 ? '∞' : subInfo.daily_generation_limit}</div>
          {subInfo.subscription_expire_at && (
            <div>到期时间：{new Date(subInfo.subscription_expire_at).toLocaleDateString()}</div>
          )}
          <div style={{ marginTop: 8 }}>
            <Button type="link" size="small" onClick={() => setUpgradeModalVisible(true)}>
              查看订阅方案
            </Button>
          </div>
        </div>
      }
    >
      <Tag 
        color={getLevelColor(subInfo.subscription_level)} 
        icon={getLevelIcon(subInfo.subscription_level)}
        style={{ cursor: 'pointer' }}
        onClick={() => setUpgradeModalVisible(true)}
      >
        {subInfo.subscription_name}
        {showUsage && subInfo.daily_generation_limit < 999999 && (
          <span style={{ marginLeft: 4 }}>
            ({subInfo.daily_generation_remaining})
          </span>
        )}
      </Tag>
    </Tooltip>
  );

  return (
    <>
      {badgeContent}
      
      <Modal
        title="订阅方案"
        open={upgradeModalVisible}
        onCancel={() => setUpgradeModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">
            当前订阅：<Text strong>{subInfo.subscription_name}</Text>
            {subInfo.subscription_expire_at && (
              <span> · 到期时间：{new Date(subInfo.subscription_expire_at).toLocaleDateString()}</span>
            )}
          </Text>
          {showUsage && subInfo.daily_generation_limit < 999999 && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                今日使用情况
              </Text>
              <Progress 
                percent={Math.min(100, usagePercent)} 
                strokeColor={usagePercent > 80 ? '#ff4d4f' : '#1890ff'}
                format={() => `${subInfo.daily_generation_used} / ${subInfo.daily_generation_limit}`}
              />
            </div>
          )}
        </div>

        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {tiers.map((tier) => (
            <div
              key={tier.level}
              style={{
                padding: 16,
                border: `2px solid ${tier.level === subInfo.subscription_level ? '#1890ff' : '#f0f0f0'}`,
                borderRadius: 8,
                background: tier.level === subInfo.subscription_level ? '#e6f7ff' : '#fff',
                position: 'relative',
              }}
            >
              {tier.level === subInfo.subscription_level && (
                <div style={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  background: '#1890ff',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                }}>
                  当前方案
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {getLevelIcon(tier.level)} {tier.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    每日 {tier.daily_limit === 999999 ? '无限' : tier.daily_limit} 次生成
                  </Text>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                    ¥{tier.price_monthly}
                    <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>/月</Text>
                  </div>
                  
                  {tier.level !== subInfo.subscription_level && (
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => handleUpgrade(tier.level)}
                      style={{ marginTop: 8 }}
                    >
                      {tier.price_monthly > subInfo.price_monthly ? '升级' : '切换'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Space>

        <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            升级后立即生效，有效期从当前日期开始计算30天。
          </Text>
        </div>
      </Modal>
    </>
  );
}
