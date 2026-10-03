import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Typography, message, Spin, Result } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlipayCircleOutlined,
  WechatOutlined,
  SafetyCertificateOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { paymentApi, type OrderInfo } from '../services/paymentService';
import { authApi } from '../services/api';
import './Payment.css';

const { Title, Text } = Typography;

type PaymentMethod = 'alipay' | 'wechat';
type PageState = 'loading' | 'confirm' | 'paying' | 'success' | 'error' | 'expired';

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || '';
  const period = searchParams.get('period') || 'monthly';

  const [pageState, setPageState] = useState<PageState>('loading');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay');
  const [countdown, setCountdown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const init = async () => {
      try {
        await authApi.getCurrentUser();
      } catch {
        navigate('/login?redirect=/pricing');
        return;
      }

      if (!level || !['basic', 'pro', 'enterprise'].includes(level)) {
        navigate('/pricing');
        return;
      }

      try {
        const orderInfo = await paymentApi.createOrder(level, period);
        setOrder(orderInfo);
        const expireTime = new Date(orderInfo.expire_at).getTime();
        setCountdown(Math.max(0, Math.floor((expireTime - Date.now()) / 1000)));
        setPageState('confirm');
      } catch {
        message.error('创建订单失败');
        setPageState('error');
      }
    };
    init();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [level, period, navigate]);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setPageState('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePay = async () => {
    if (!order) return;
    setPageState('paying');
    startCountdown();

    try {
      const result = await paymentApi.simulatePayment(order.order_id, paymentMethod);
      if (result.success) {
        setPageState('success');
        if (countdownRef.current) clearInterval(countdownRef.current);
      } else {
        setPageState('error');
      }
    } catch {
      setPageState('error');
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (pageState === 'loading') {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <Spin size="large" />
          <Text type="secondary">正在创建订单...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <nav className="payment-nav">
        <div className="payment-nav-inner">
          <div className="payment-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="pay-nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#165DFF" />
                  <stop offset="100%" stopColor="#4080FF" />
                </linearGradient>
              </defs>
              <rect rx="20" ry="20" width="100" height="100" fill="url(#pay-nav-grad)" />
              <text x="50" y="68" textAnchor="middle" fill="white" fontSize="52" fontWeight="700" fontFamily="serif">墨</text>
            </svg>
            <span className="payment-nav-name">墨小语</span>
          </div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/pricing')}
            className="payment-nav-back"
          >
            返回定价页
          </Button>
        </div>
      </nav>

      <div className="payment-content">
        {pageState === 'confirm' && order && (
          <div className="payment-card">
            <div className="payment-card-header">
              <SafetyCertificateOutlined className="payment-secure-icon" />
              <Title level={4} className="payment-card-title">确认订单</Title>
            </div>

            <div className="payment-order-summary">
              <div className="payment-summary-row">
                <span className="payment-summary-label">订阅套餐</span>
                <span className="payment-summary-value">{order.subscription_name}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-summary-label">计费周期</span>
                <span className="payment-summary-value">{order.period_label}（{order.months}个月）</span>
              </div>
              <div className="payment-summary-row payment-summary-total">
                <span className="payment-summary-label">应付金额</span>
                <span className="payment-summary-price">
                  <span className="payment-price-symbol">¥</span>
                  <span className="payment-price-amount">{order.amount_yuan}</span>
                </span>
              </div>
            </div>

            <div className="payment-methods">
              <Text className="payment-methods-title">选择支付方式</Text>
              <div className="payment-method-options">
                <div
                  className={`payment-method-option ${paymentMethod === 'alipay' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('alipay')}
                >
                  <AlipayCircleOutlined className="payment-method-icon alipay" />
                  <span>支付宝</span>
                  {paymentMethod === 'alipay' && <CheckCircleOutlined className="payment-method-check" />}
                </div>
                <div
                  className={`payment-method-option ${paymentMethod === 'wechat' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('wechat')}
                >
                  <WechatOutlined className="payment-method-icon wechat" />
                  <span>微信支付</span>
                  {paymentMethod === 'wechat' && <CheckCircleOutlined className="payment-method-check" />}
                </div>
              </div>
            </div>

            <Button
              type="primary"
              block
              size="large"
              className="payment-pay-btn"
              onClick={handlePay}
            >
              确认支付 ¥{order.amount_yuan}
            </Button>

            <Text type="secondary" className="payment-disclaimer">
              支付即表示同意《墨小语服务协议》· 支持7天无理由退款
            </Text>
          </div>
        )}

        {pageState === 'paying' && order && (
          <div className="payment-card">
            <div className="payment-card-header">
              <ClockCircleOutlined className="payment-paying-icon" />
              <Title level={4} className="payment-card-title">等待支付</Title>
            </div>

            <div className="payment-qr-area">
              <div className={`payment-qr-placeholder ${paymentMethod}`}>
                {paymentMethod === 'alipay' ? (
                  <AlipayCircleOutlined className="payment-qr-icon" />
                ) : (
                  <WechatOutlined className="payment-qr-icon" />
                )}
                <Text className="payment-qr-text">
                  {paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
                </Text>
              </div>
              <div className="payment-qr-info">
                <Text type="secondary" style={{ fontSize: 13 }}>
                  订单号：{order.order_id}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  支付金额：<Text strong style={{ color: 'var(--mxy-text-primary)' }}>¥{order.amount_yuan}</Text>
                </Text>
                <Text type={countdown < 60 ? 'danger' : 'secondary'} style={{ fontSize: 13 }}>
                  剩余时间：{formatCountdown(countdown)}
                </Text>
              </div>
            </div>

            <div className="payment-paying-actions">
              <Button
                type="primary"
                block
                size="large"
                className="payment-simulate-btn"
                onClick={async () => {
                  try {
                    const result = await paymentApi.simulatePayment(order.order_id, paymentMethod);
                    if (result.success) {
                      setPageState('success');
                      if (countdownRef.current) clearInterval(countdownRef.current);
                    }
                  } catch {
                    message.error('支付模拟失败');
                  }
                }}
              >
                模拟支付成功（测试用）
              </Button>
              <Button
                block
                size="large"
                onClick={() => {
                  if (countdownRef.current) clearInterval(countdownRef.current);
                  setPageState('confirm');
                }}
              >
                取消支付
              </Button>
            </div>
          </div>
        )}

        {pageState === 'success' && order && (
          <div className="payment-card payment-card-success">
            <Result
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="支付成功"
              subTitle={`已成功激活${order.subscription_name}（${order.period_label}）`}
              extra={[
                <Button
                  type="primary"
                  key="start"
                  onClick={() => navigate('/')}
                >
                  开始创作
                </Button>,
                <Button key="pricing" onClick={() => navigate('/pricing')}>
                  返回定价页
                </Button>,
              ]}
            />
            <div className="payment-success-details">
              <div className="payment-summary-row">
                <span className="payment-summary-label">订单号</span>
                <span className="payment-summary-value">{order.order_id}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-summary-label">支付金额</span>
                <span className="payment-summary-value">¥{order.amount_yuan}</span>
              </div>
              <div className="payment-summary-row">
                <span className="payment-summary-label">支付方式</span>
                <span className="payment-summary-value">{paymentMethod === 'alipay' ? '支付宝' : '微信支付'}</span>
              </div>
            </div>
          </div>
        )}

        {pageState === 'error' && (
          <div className="payment-card">
            <Result
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              title="支付失败"
              subTitle="支付过程中出现错误，请重试"
              extra={[
                <Button type="primary" key="retry" onClick={() => window.location.reload()}>
                  重新支付
                </Button>,
                <Button key="back" onClick={() => navigate('/pricing')}>
                  返回定价页
                </Button>,
              ]}
            />
          </div>
        )}

        {pageState === 'expired' && (
          <div className="payment-card">
            <Result
              icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              title="订单已过期"
              subTitle="订单已超过30分钟有效期，请重新创建"
              extra={[
                <Button type="primary" key="retry" onClick={() => window.location.reload()}>
                  重新下单
                </Button>,
                <Button key="back" onClick={() => navigate('/pricing')}>
                  返回定价页
                </Button>,
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
