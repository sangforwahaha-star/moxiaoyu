import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { subscriptionApi, type SubscriptionInfo, type SubscriptionTier } from '../services/subscriptionService';
import { authApi } from '../services/api';
import './Pricing.css';

const { Title, Text } = Typography;

interface TierDisplay {
  level: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  recommended: boolean;
  dailyLimit: string;
  monthlyWordLimit: string;
  projectLimit: string;
}

const FAQ_DATA = [
  {
    q: '可以随时更换订阅计划吗？',
    a: '可以。升级立即生效，差价按剩余天数折算；降级将在当前周期结束后生效。',
  },
  {
    q: '支持哪些支付方式？',
    a: '目前支持支付宝和微信支付。企业版用户还可选择对公转账和开具发票。',
  },
  {
    q: '月付和年付有什么区别？',
    a: '年付享受约17%的折扣，相当于每年免费使用2个月。其他功能权益完全相同。',
  },
  {
    q: '"AI生成字数"是什么意思？',
    a: '指AI为你生成的小说文本总字数，包括章节内容、大纲、角色描述等所有AI输出。输入（你的提示词）不计入。',
  },
  {
    q: '免费版有使用期限吗？',
    a: '没有。免费版永久可用，适合轻度体验。如果创作频率较高，建议升级到基础版或专业版以获得更好的体验。',
  },
  {
    q: '企业版如何购买额外席位？',
    a: '企业版默认包含5个席位。如需更多，请联系客服获取定制方案：support@moxiaoyu.pro',
  },
];

function formatLimit(val: number): string {
  if (val >= 999999) return '无限';
  if (val >= 10000) return `${(val / 10000).toFixed(0)}万字`;
  return `${val.toLocaleString()}字`;
}

function formatProjectLimit(val: number): string {
  if (val >= 999999) return '无限';
  return `${val}个`;
}

function formatDailyLimit(val: number): string {
  if (val >= 999999) return '无限';
  return `${val}次/日`;
}

function AnimatedPrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevValue = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (prevValue.current === value) return;

    setAnimating(true);
    const from = prevValue.current;
    const to = value;
    const duration = 400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
        setAnimating(false);
        prevValue.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className={`pricing-card-price-amount ${animating ? 'price-animating' : ''}`}>
      {displayValue}
    </span>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);
  const [currentSub, setCurrentSub] = useState<SubscriptionInfo | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.getCurrentUser();
        setIsLoggedIn(true);

        const info = await subscriptionApi.getSubscriptionInfo();
        setCurrentSub(info);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    subscriptionApi.getSubscriptionTiers()
      .then(setTiers)
      .catch(() => {
        setTiers([
          { level: 'free', name: '免费版', daily_limit: 3, monthly_word_limit: 10000, project_limit: 2, price_monthly: 0, price_yearly: 0, recommended: false, features: [] },
          { level: 'basic', name: '基础版', daily_limit: 30, monthly_word_limit: 100000, project_limit: 999999, price_monthly: 29, price_yearly: 299, recommended: false, features: [] },
          { level: 'pro', name: '专业版', daily_limit: 999999, monthly_word_limit: 500000, project_limit: 999999, price_monthly: 59, price_yearly: 599, recommended: true, features: [] },
          { level: 'enterprise', name: '企业版', daily_limit: 999999, monthly_word_limit: 999999999, project_limit: 999999, price_monthly: 199, price_yearly: 1999, recommended: false, features: [] },
        ]);
      });
  }, []);

  const tierDisplayMap: Record<string, Omit<TierDisplay, 'priceMonthly' | 'priceYearly' | 'features' | 'recommended'>> = {
    free: {
      level: 'free',
      name: '免费版',
      icon: <ThunderboltOutlined />,
      description: '适合初次体验，感受AI创作的魅力',
      dailyLimit: '3次/日',
      monthlyWordLimit: '1万字',
      projectLimit: '2个',
    },
    basic: {
      level: 'basic',
      name: '基础版',
      icon: <RocketOutlined />,
      description: '个人创作者的理想选择',
      dailyLimit: '30次/日',
      monthlyWordLimit: '10万字',
      projectLimit: '无限',
    },
    pro: {
      level: 'pro',
      name: '专业版',
      icon: <CrownOutlined />,
      description: '全职作者与重度创作者首选',
      dailyLimit: '无限',
      monthlyWordLimit: '50万字',
      projectLimit: '无限',
    },
    enterprise: {
      level: 'enterprise',
      name: '企业版',
      icon: <TeamOutlined />,
      description: '工作室与团队协作方案',
      dailyLimit: '无限',
      monthlyWordLimit: '无限',
      projectLimit: '无限',
    },
  };

  const buildTierDisplay = useCallback((tier: SubscriptionTier): TierDisplay => {
    const base = tierDisplayMap[tier.level] || tierDisplayMap.free;
    return {
      ...base,
      priceMonthly: tier.price_monthly,
      priceYearly: tier.price_yearly,
      recommended: tier.recommended,
      features: tier.features,
    };
  }, []);

  const displayTiers = tiers.length > 0 ? tiers.map(buildTierDisplay) : [];

  const TIER_ORDER = ['free', 'basic', 'pro', 'enterprise'];

  const handleSubscribe = async (tier: TierDisplay) => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/pricing');
      return;
    }

    if (tier.level === 'free') {
      if (currentSub?.subscription_level === 'free') {
        message.info('你当前已是免费版');
      } else {
        message.info('免费版不支持主动切换，请联系客服');
      }
      return;
    }

    if (currentSub?.subscription_level === tier.level) {
      message.info(`你当前已是${tier.name}`);
      return;
    }

    navigate(`/payment?level=${tier.level}&period=${isYearly ? 'yearly' : 'monthly'}`);
  };

  const getButtonText = (tier: TierDisplay): string => {
    if (!isLoggedIn) return '登录后订阅';
    if (currentSub?.subscription_level === tier.level) return '当前套餐';
    if (tier.level === 'free') return '免费开始';

    const currentLevel = currentSub?.subscription_level || 'free';
    const currentIdx = TIER_ORDER.indexOf(currentLevel);
    const targetIdx = TIER_ORDER.indexOf(tier.level);

    if (currentLevel === 'free') {
      return '立即升级';
    }

    return targetIdx > currentIdx ? '升级套餐' : '切换套餐';
  };

  const getButtonClass = (tier: TierDisplay): string => {
    const base = 'pricing-card-btn';
    if (tier.recommended) return `${base} ${base}-primary`;

    if (isLoggedIn && currentSub?.subscription_level !== 'free') {
      const currentIdx = TIER_ORDER.indexOf(currentSub?.subscription_level || 'free');
      const targetIdx = TIER_ORDER.indexOf(tier.level);
      if (targetIdx > currentIdx) return `${base} ${base}-upgrade`;
    }

    if (isLoggedIn && currentSub?.subscription_level === 'free' && tier.level !== 'free') {
      return `${base} ${base}-upgrade`;
    }

    return base;
  };

  const isButtonDisabled = (tier: TierDisplay): boolean => {
    if (!isLoggedIn) return false;
    return currentSub?.subscription_level === tier.level;
  };

  const comparisonFeatures = [
    { name: '每日AI生成次数', key: 'daily', format: formatDailyLimit },
    { name: '每月AI生成字数', key: 'monthly', format: formatLimit },
    { name: '项目数量', key: 'project', format: formatProjectLimit },
    { name: '世界设定与角色管理', key: 'world', values: [true, true, true, true] },
    { name: '大纲生成', key: 'outline', values: ['基础', '全部', '全部', '全部'] },
    { name: '导出功能', key: 'export', values: [false, 'TXT/Word', 'TXT/Word/PDF', '全部格式'] },
    { name: '批量生成章节', key: 'batch', values: [false, false, true, true] },
    { name: '角色关系图谱', key: 'graph', values: [false, false, true, true] },
    { name: '剧情分析', key: 'analysis', values: [false, false, true, true] },
    { name: '自定义提示词模板', key: 'prompt', values: [false, false, true, true] },
    { name: '高级模型（GPT-4o等）', key: 'model', values: [false, false, true, true] },
    { name: '团队协作', key: 'team', values: [false, false, false, true] },
    { name: '权限管理', key: 'perm', values: [false, false, false, true] },
    { name: 'API接口', key: 'api', values: [false, false, false, true] },
    { name: '客服支持', key: 'support', values: ['社区', '邮件', '优先', '专属'] },
  ];

  return (
    <div className="pricing-page">
      {/* Nav */}
      <nav className="pricing-nav">
        <div className="pricing-nav-inner">
          <div className="pricing-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 100 100" className="pricing-nav-logo">
              <defs>
                <linearGradient id="pg-nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#165DFF" />
                  <stop offset="100%" stopColor="#4080FF" />
                </linearGradient>
              </defs>
              <rect rx="20" ry="20" width="100" height="100" fill="url(#pg-nav-grad)" />
              <text x="50" y="68" textAnchor="middle" fill="white" fontSize="52" fontWeight="700" fontFamily="serif">墨</text>
            </svg>
            <span className="pricing-nav-name">墨小语</span>
          </div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isLoggedIn ? '/' : '/login')}
            className="pricing-nav-back"
          >
            返回
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pricing-hero">
        <Title className="pricing-hero-title mxy-display">
          选择适合你的<span className="mxy-gradient-text">创作计划</span>
        </Title>
        <Text className="pricing-hero-subtitle">
          从灵感到完稿，墨小语为每一位创作者提供恰到好处的AI助力
        </Text>

        {/* Billing toggle */}
        <div className="pricing-toggle-wrap">
          <span className={`pricing-toggle-label ${!isYearly ? 'active' : ''}`}>月付</span>
          <button
            className={`pricing-toggle-switch ${isYearly ? 'yearly' : ''}`}
            onClick={() => setIsYearly(!isYearly)}
          >
            <span className="pricing-toggle-knob" />
          </button>
          <span className={`pricing-toggle-label ${isYearly ? 'active' : ''}`}>
            年付
            <span className="pricing-toggle-badge">省17%</span>
          </span>
        </div>
      </section>

      {/* Cards */}
      <section className="pricing-cards-section">
        <div className="pricing-cards-grid">
          {displayTiers.map((tier) => {
            const price = isYearly ? tier.priceYearly : tier.priceMonthly;
            const period = isYearly ? '/年' : '/月';
            const isCurrent = currentSub?.subscription_level === tier.level;
            const isRecommended = tier.recommended;
            const monthlyEquiv = isYearly && price > 0 ? Math.round(price / 12) : 0;

            return (
              <div
                key={tier.level}
                className={`pricing-card ${isRecommended ? 'pricing-card-recommended' : ''} ${isCurrent ? 'pricing-card-current' : ''}`}
              >
                {isRecommended && (
                  <div className="pricing-card-badge">
                    <CrownOutlined /> 最受欢迎
                  </div>
                )}
                {isCurrent && (
                  <div className="pricing-card-current-badge">当前套餐</div>
                )}

                <div className="pricing-card-header">
                  <div className="pricing-card-icon">{tier.icon}</div>
                  <h3 className="pricing-card-name">{tier.name}</h3>
                  <p className="pricing-card-desc">{tier.description}</p>
                </div>

                <div className="pricing-card-price">
                  {price === 0 ? (
                    <span className="pricing-card-price-free">免费</span>
                  ) : (
                    <>
                      <span className="pricing-card-price-symbol">¥</span>
                      <AnimatedPrice value={price} />
                      <span className="pricing-card-price-period">{period}</span>
                    </>
                  )}
                  {isYearly && price > 0 && (
                    <div className="pricing-card-price-save">
                      相当于 ¥{monthlyEquiv}/月
                    </div>
                  )}
                  {!isYearly && price > 0 && (
                    <div className="pricing-card-price-annual">
                      年付仅 ¥{tier.priceYearly}，省 ¥{tier.priceMonthly * 12 - tier.priceYearly}
                    </div>
                  )}
                </div>

                <Button
                  block
                  size="large"
                  className={getButtonClass(tier)}
                  disabled={isButtonDisabled(tier)}
                  onClick={() => handleSubscribe(tier)}
                >
                  {getButtonText(tier)}
                </Button>

                <ul className="pricing-card-features">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="pricing-card-feature-item">
                      <CheckOutlined className="pricing-card-feature-check" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="pricing-compare-section">
        <Title className="pricing-section-title mxy-display">功能对比</Title>
        <div className="pricing-compare-table-wrap">
          <table className="pricing-compare-table">
            <thead>
              <tr>
                <th className="pricing-compare-th-feature">功能</th>
                {displayTiers.map((t) => (
                  <th key={t.level} className={`pricing-compare-th ${t.recommended ? 'pricing-compare-th-highlight' : ''}`}>
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feat) => (
                <tr key={feat.key} className="pricing-compare-row">
                  <td className="pricing-compare-td-name">{feat.name}</td>
                  {displayTiers.map((tier, tierIdx) => {
                    let val: boolean | string | number = false;
                    if (feat.format) {
                      if (feat.key === 'daily') val = tier.dailyLimit;
                      else if (feat.key === 'monthly') val = tier.monthlyWordLimit;
                      else if (feat.key === 'project') val = tier.projectLimit;
                    } else if (feat.values) {
                      val = feat.values[tierIdx];
                    }
                    return (
                      <td
                        key={tier.level}
                        className={`pricing-compare-td ${tier.recommended ? 'pricing-compare-td-highlight' : ''}`}
                      >
                        {feat.format ? (
                          <Text className="pricing-table-cell-text">{val}</Text>
                        ) : val === true ? (
                          <CheckOutlined className="pricing-table-check" />
                        ) : val === false ? (
                          <CloseOutlined className="pricing-table-cross" />
                        ) : (
                          <Text className="pricing-table-cell-text">{String(val)}</Text>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="pricing-faq-section">
        <Title className="pricing-section-title mxy-display">常见问题</Title>
        <div className="pricing-faq-grid">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className="pricing-faq-card">
              <div className="pricing-faq-q">
                <QuestionCircleOutlined className="pricing-faq-icon" />
                {item.q}
              </div>
              <div className="pricing-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pricing-cta-section">
        <div className="pricing-cta-inner">
          <Title className="pricing-cta-title mxy-display">准备好开始创作了吗？</Title>
          <Text className="pricing-cta-subtitle">
            加入数千名网文作者，让AI成为你最得力的创作伙伴
          </Text>
          <Button
            type="primary"
            size="large"
            className="pricing-cta-btn"
            onClick={() => navigate(isLoggedIn ? '/' : '/login')}
          >
            {isLoggedIn ? '开始创作' : '免费注册'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pricing-footer">
        <Text className="pricing-footer-text">
          © 2024 墨小语 · 让创作更简单
        </Text>
      </footer>
    </div>
  );
}
