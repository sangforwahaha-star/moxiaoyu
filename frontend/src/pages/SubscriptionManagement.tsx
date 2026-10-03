import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Table, Empty, Spin, Progress, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CrownOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  TeamOutlined,
  CalendarOutlined,
  HistoryOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { subscriptionApi, type SubscriptionInfo } from '../services/subscriptionService';
import { paymentApi, type OrderStatus } from '../services/paymentService';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <ThunderboltOutlined />,
  basic: <RocketOutlined />,
  pro: <CrownOutlined />,
  enterprise: <TeamOutlined />,
};

const TIER_COLORS: Record<string, string> = {
  free: 'default',
  basic: 'blue',
  pro: 'gold',
  enterprise: 'purple',
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: '待支付' },
  paid: { color: 'green', label: '已支付' },
  failed: { color: 'red', label: '支付失败' },
  expired: { color: 'default', label: '已过期' },
};

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [info, ordersData] = await Promise.all([
        subscriptionApi.getSubscriptionInfo(),
        paymentApi.listOrders(50),
      ]);
      setSubInfo(info);
      setOrders(ordersData.orders);
    } catch {
      message.error('加载订阅信息失败');
    } finally {
      setLoading(false);
      setOrdersLoading(false);
    }
  };

  const getExpireStatus = () => {
    if (!subInfo?.subscription_expire_at) return null;
    const expireDate = new Date(subInfo.subscription_expire_at);
    const now = new Date();
    const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) return { text: '已过期', color: '#ff4d4f', days: 0 };
    if (daysLeft <= 7) return { text: `${daysLeft}天后到期`, color: '#faad14', days: daysLeft };
    return { text: `${daysLeft}天后到期`, color: '#52c41a', days: daysLeft };
  };

  const orderColumns: ColumnsType<OrderStatus> = [
    {
      title: '订单号',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (id: string) => <Text copyable style={{ fontSize: 12 }}>{id}</Text>,
    },
    {
      title: '套餐',
      dataIndex: 'subscription_name',
      key: 'subscription_name',
    },
    {
      title: '周期',
      dataIndex: 'period',
      key: 'period',
      render: (p: string) => p === 'yearly' ? '年付' : '月付',
    },
    {
      title: '金额',
      dataIndex: 'amount_yuan',
      key: 'amount_yuan',
      render: (v: number) => `¥${v}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const info = STATUS_MAP[s] || { color: 'default', label: s };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => t ? new Date(t).toLocaleDateString('zh-CN') : '-',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!subInfo) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="无法加载订阅信息" />
      </div>
    );
  }

  const expireStatus = getExpireStatus();
  const usagePercent = subInfo.daily_generation_limit > 0
    ? Math.round((subInfo.daily_generation_used / subInfo.daily_generation_limit) * 100)
    : 0;

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <CrownOutlined style={{ marginRight: 8 }} />
        我的订阅
      </Title>

      {/* Current subscription card */}
      <Card
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: subInfo.subscription_level === 'pro' ? 'linear-gradient(135deg, #faad14, #fa8c16)' : 'var(--mxy-primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: subInfo.subscription_level === 'pro' ? '#fff' : 'var(--mxy-primary)',
              }}>
                {TIER_ICONS[subInfo.subscription_level] || <ThunderboltOutlined />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ fontSize: 18 }}>{subInfo.subscription_name}</Text>
                  <Tag color={TIER_COLORS[subInfo.subscription_level]}>
                    {subInfo.subscription_level}
                  </Tag>
                </div>
                {expireStatus && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    <span style={{ color: expireStatus.color }}>{expireStatus.text}</span>
                    <span style={{ marginLeft: 8 }}>
                      ({new Date(subInfo.subscription_expire_at!).toLocaleDateString('zh-CN')})
                    </span>
                  </Text>
                )}
              </div>
            </div>
          </div>

          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/pricing')}
          >
            {subInfo.subscription_level === 'free' ? '升级套餐' : '管理套餐'}
          </Button>
        </div>

        {/* Usage stats */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{
            padding: 16,
            background: 'var(--mxy-bg-base)',
            borderRadius: 8,
          }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              今日生成次数
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress
                type="circle"
                percent={usagePercent}
                size={48}
                strokeColor={usagePercent > 80 ? '#ff4d4f' : 'var(--mxy-primary)'}
                format={() => `${usagePercent}%`}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {subInfo.daily_generation_used} / {subInfo.daily_generation_limit}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  剩余 {subInfo.daily_generation_remaining} 次
                </Text>
              </div>
            </div>
          </div>

          <div style={{
            padding: 16,
            background: 'var(--mxy-bg-base)',
            borderRadius: 8,
          }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              每月字数限额
            </Text>
            <Text strong style={{ fontSize: 16 }}>
              {subInfo.monthly_word_limit >= 999999 ? '无限' : `${(subInfo.monthly_word_limit / 10000).toFixed(0)}万字`}
            </Text>
          </div>

          <div style={{
            padding: 16,
            background: 'var(--mxy-bg-base)',
            borderRadius: 8,
          }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              项目数量
            </Text>
            <Text strong style={{ fontSize: 16 }}>
              {subInfo.project_limit >= 999999 ? '无限' : `${subInfo.project_limit}个`}
            </Text>
          </div>
        </div>
      </Card>

      {/* Features */}
      {subInfo.features.length > 0 && (
        <Card
          title="当前套餐权益"
          style={{ marginBottom: 24 }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {subInfo.features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: 'var(--mxy-primary)', fontSize: 14 }} />
                <Text>{feat}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Payment history */}
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8 }} />
            支付记录
          </span>
        }
      >
        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey="order_id"
          loading={ordersLoading}
          pagination={orders.length > 10 ? { pageSize: 10 } : false}
          locale={{ emptyText: <Empty description="暂无支付记录" /> }}
          size="small"
        />
      </Card>
    </div>
  );
}
