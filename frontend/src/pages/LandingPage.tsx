import { Button, Typography, Card, Row, Col, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ThunderboltOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  RocketOutlined,
  EditOutlined,
  GlobalOutlined,
  StarFilled,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <EditOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: 'AI智能创作',
    description: '基于大纲、人设、前文语境，AI按章节流式生成内容，风格一致、伏笔连贯。',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: '角色与关系管理',
    description: '多角色档案、人物关系网、职业体系，让每个角色都有血有肉。',
  },
  {
    icon: <BookOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: '大纲与世界观',
    description: '支持1对1和1对N大纲模式，构建完整世界观设定，让故事逻辑严密。',
  },
  {
    icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: '伏笔与记忆系统',
    description: '自动追踪伏笔埋入与回收，章节记忆持久化，确保长篇连载不崩。',
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: '敏感词检测',
    description: '内置网文敏感词库，创作时实时检测，避免踩坑被屏蔽。',
  },
  {
    icon: <RocketOutlined style={{ fontSize: 32, color: '#6366f1' }} />,
    title: '后台批量生成',
    description: '关闭浏览器也不影响生成，多章节批量顺序创作，效率翻倍。',
  },
];

const pricingTiers = [
  {
    name: '免费版',
    price: '0',
    period: '永久',
    features: ['每日3次AI生成', '每月1万字', '最多2个项目', '基础模型', '社区支持'],
    recommended: false,
    buttonText: '免费开始',
  },
  {
    name: '基础版',
    price: '29',
    period: '/月',
    features: ['每日30次AI生成', '每月10万字', '无限项目数', '全部功能模块', '邮件支持'],
    recommended: false,
    buttonText: '立即订阅',
  },
  {
    name: '专业版',
    price: '59',
    period: '/月',
    features: ['无限AI生成', '每月50万字', '高级模型（GPT-4o等）', '批量生成、剧情分析', '优先客服支持'],
    recommended: true,
    buttonText: '立即订阅',
  },
  {
    name: '企业版',
    price: '199',
    period: '/月',
    features: ['5个团队席位', '无限AI生成字数', '团队协作与权限', 'API接口', '专属客服'],
    recommended: false,
    buttonText: '联系我们',
  },
];

const testimonials = [
  {
    name: '风清扬',
    role: '玄幻作者 · 连载300万字',
    content: '用了墨小语后，日更从3000字提升到8000字，AI帮我保持角色一致性，伏笔再也不会 forgotten。',
    avatar: 'F',
  },
  {
    name: '月下独酌',
    role: '都市作者 · 连载150万字',
    content: '敏感词检测功能太实用了，以前总被屏蔽，现在创作更安心。后台生成让我可以同时写两本书。',
    avatar: 'Y',
  },
  {
    name: '青山如黛',
    role: '古言作者 · 连载200万字',
    content: '角色关系网帮我理清了复杂的人物关系，世界观设定让故事更有深度。强烈推荐给所有长篇作者！',
    avatar: 'Q',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '16px 0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={12}>
            <BookOutlined style={{ fontSize: 24, color: '#6366f1' }} />
            <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>墨小语</Title>
          </Space>
          <Space size={16}>
            <Button type="text" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>功能</Button>
            <Button type="text" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>定价</Button>
            <Button type="primary" onClick={() => navigate('/login')} style={{ background: '#6366f1' }}>
              开始使用
            </Button>
          </Space>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '100px 24px 80px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Tag color="rgba(255,255,255,0.2)" style={{ border: 'none', color: '#fff', marginBottom: 24, fontSize: 14, padding: '4px 16px' }}>
            专为网文作者打造的AI创作工具
          </Tag>
          <Title style={{ color: '#fff', fontSize: 48, marginBottom: 24, fontWeight: 700 }}>
            让AI成为你的写作搭档
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, marginBottom: 40, lineHeight: 1.6 }}>
            从大纲到完稿，从角色到伏笔，墨小语帮你搞定一切。<br />
            专注创作本身，让AI处理繁琐的细节。
          </Paragraph>
          <Space size={16}>
            <Button size="large" type="primary" onClick={() => navigate('/login')} style={{ background: '#fff', color: '#6366f1', border: 'none', height: 48, padding: '0 32px', fontSize: 16, fontWeight: 600 }}>
              免费开始创作
            </Button>
            <Button size="large" ghost onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ height: 48, padding: '0 32px', fontSize: 16, borderColor: '#fff', color: '#fff' }}>
              了解更多
            </Button>
          </Space>
          <div style={{ marginTop: 40, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            无需信用卡 · 免费版永久可用 · 30秒注册
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <Row gutter={[24, 24]}>
          {[
            { value: '10,000+', label: '活跃作者' },
            { value: '500万+', label: 'AI生成字数' },
            { value: '98%', label: '好评率' },
            { value: '24/7', label: '在线服务' },
          ].map((stat, i) => (
            <Col xs={12} md={6} key={i}>
              <Card style={{ textAlign: 'center', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#6366f1' }}>{stat.value}</div>
                <Text type="secondary">{stat.label}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={2}>强大功能，为网文而生</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            每一个功能都经过精心设计，解决网文作者的真实痛点
          </Paragraph>
        </div>
        <Row gutter={[32, 32]}>
          {features.map((feature, i) => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }} hoverable>
                <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                <Title level={5} style={{ marginBottom: 8 }}>{feature.title}</Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Testimonials */}
      <div style={{ background: '#f9fafb', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2}>作者们怎么说</Title>
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              来自真实用户的使用体验
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            {testimonials.map((t, i) => (
              <Col xs={24} md={8} key={i}>
                <Card style={{ height: '100%', borderRadius: 12 }}>
                  <div style={{ marginBottom: 16 }}>
                    {[...Array(5)].map((_, j) => (
                      <StarFilled key={j} style={{ color: '#faad14', fontSize: 16 }} />
                    ))}
                  </div>
                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
                    "{t.content}"
                  </Paragraph>
                  <Space>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{t.role}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={2}>简单透明的定价</Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            选择适合你的方案，随时升级或降级
          </Paragraph>
        </div>
        <Row gutter={[24, 24]} justify="center">
          {pricingTiers.map((tier, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card
                style={{
                  height: '100%',
                  borderRadius: 16,
                  border: tier.recommended ? '2px solid #6366f1' : '1px solid #f0f0f0',
                  position: 'relative',
                  boxShadow: tier.recommended ? '0 8px 24px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {tier.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#6366f1',
                    color: '#fff',
                    padding: '4px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    最受欢迎
                  </div>
                )}
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Title level={4} style={{ marginBottom: 8 }}>{tier.name}</Title>
                  <div style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 14 }}>¥</Text>
                    <Text style={{ fontSize: 48, fontWeight: 700, color: '#1a1a1a' }}>{tier.price}</Text>
                    <Text type="secondary" style={{ fontSize: 14 }}>{tier.period}</Text>
                  </div>
                  <Button
                    type={tier.recommended ? 'primary' : 'default'}
                    size="large"
                    block
                    onClick={() => navigate('/login')}
                    style={tier.recommended ? { background: '#6366f1', height: 44 } : { height: 44 }}
                  >
                    {tier.buttonText}
                  </Button>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
                  {tier.features.map((feature, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <GlobalOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      <Text>{feature}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button
            type="link"
            size="large"
            onClick={() => navigate('/pricing')}
            style={{ fontSize: 15, color: '#6366f1' }}
          >
            查看完整功能对比与常见问题 →
          </Button>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Title style={{ color: '#fff', fontSize: 36, marginBottom: 16 }}>
            开始你的创作之旅
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 32 }}>
            加入数千名网文作者的行列，让AI成为你最可靠的写作伙伴
          </Paragraph>
          <Button size="large" type="primary" onClick={() => navigate('/login')} style={{ background: '#fff', color: '#6366f1', border: 'none', height: 48, padding: '0 40px', fontSize: 16, fontWeight: 600 }}>
            <CrownOutlined style={{ marginRight: 8 }} />
            免费注册
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a1a1a', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Space size={24} style={{ marginBottom: 24 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>关于我们</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>使用条款</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>隐私政策</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>联系我们</Text>
          </Space>
          <Paragraph style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            © 2026 墨小语 · All Rights Reserved
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
