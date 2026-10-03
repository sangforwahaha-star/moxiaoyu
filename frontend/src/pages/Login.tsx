import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Collapse,
  Form,
  Input,
  Space,
  Spin,
  Tabs,
  Typography,
  message,
  theme,
} from 'antd';
import {
  BookOutlined,
  LockOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { authApi } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThemeSwitch from '../components/ThemeSwitch';

const { Text } = Typography;

interface AuthConfig {
  local_auth_enabled: boolean;
  linuxdo_enabled: boolean;
  email_auth_enabled: boolean;
  email_register_enabled: boolean;
}

interface LocalLoginValues {
  username: string;
  password: string;
}

interface EmailLoginValues {
  email: string;
  code: string;
}

interface EmailRegisterValues {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
  display_name?: string;
}

interface ResetPasswordValues {
  email: string;
  code: string;
  new_password: string;
  confirmNewPassword: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    local_auth_enabled: false,
    linuxdo_enabled: false,
    email_auth_enabled: false,
    email_register_enabled: false,
  });
  const [localForm] = Form.useForm<LocalLoginValues>();
  const [emailLoginForm] = Form.useForm<EmailLoginValues>();
  const [emailRegisterForm] = Form.useForm<EmailRegisterValues>();
  const [resetPasswordForm] = Form.useForm<ResetPasswordValues>();
  const { token } = theme.useToken();
  const [loginCodeSending, setLoginCodeSending] = useState(false);
  const [registerCodeSending, setRegisterCodeSending] = useState(false);
  const [resetCodeSending, setResetCodeSending] = useState(false);
  const [loginCountdown, setLoginCountdown] = useState(0);
  const [registerCountdown, setRegisterCountdown] = useState(0);
  const [resetCountdown, setResetCountdown] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const localAuthEnabled = authConfig.local_auth_enabled;
  const linuxdoEnabled = authConfig.linuxdo_enabled;
  const emailAuthEnabled = authConfig.email_auth_enabled;
  const emailRegisterEnabled = authConfig.email_register_enabled;

  useEffect(() => {
    const timers = [
      { value: loginCountdown, setter: setLoginCountdown },
      { value: registerCountdown, setter: setRegisterCountdown },
      { value: resetCountdown, setter: setResetCountdown },
    ].map(({ value, setter }) => {
      if (value <= 0) return null;
      return window.setInterval(() => {
        setter((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    });
    return () => {
      timers.forEach((timer) => { if (timer) window.clearInterval(timer); });
    };
  }, [loginCountdown, registerCountdown, resetCountdown]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.getCurrentUser();
        const redirect = searchParams.get('redirect') || '/';
        navigate(redirect);
      } catch {
        try {
          const config = await authApi.getAuthConfig();
          setAuthConfig(config);
        } catch (error) {
          console.error('获取认证配置失败:', error);
          setAuthConfig({
            local_auth_enabled: false,
            linuxdo_enabled: true,
            email_auth_enabled: false,
            email_register_enabled: false,
          });
        }
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate, searchParams]);

  const handleLoginSuccess = () => {
    message.success('登录成功');
    const redirect = searchParams.get('redirect') || '/';
    navigate(redirect);
  };

  const handleLocalLogin = async (values: LocalLoginValues) => {
    try {
      setLoading(true);
      const response = await authApi.localLogin(values.username, values.password);
      if (response.success) handleLoginSuccess();
    } catch (error) {
      console.error('本地登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (values: EmailLoginValues) => {
    try {
      setLoading(true);
      const response = await authApi.emailLogin({ email: values.email, code: values.code });
      if (response.success) handleLoginSuccess();
    } catch (error) {
      console.error('邮箱验证码登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendLoginCode = async () => {
    try {
      const values = await emailLoginForm.validateFields(['email']);
      setLoginCodeSending(true);
      const result = await authApi.sendEmailCode({ email: values.email, scene: 'login' });
      message.success(result.message || '验证码已发送');
      setLoginCountdown(result.resend_interval_seconds || 60);
    } catch (error) {
      console.error('发送 login 验证码失败:', error);
    } finally {
      setLoginCodeSending(false);
    }
  };

  const sendRegisterCode = async () => {
    try {
      const values = await emailRegisterForm.validateFields(['email']);
      setRegisterCodeSending(true);
      const result = await authApi.sendEmailCode({ email: values.email, scene: 'register' });
      message.success(result.message || '验证码已发送');
      setRegisterCountdown(result.resend_interval_seconds || 60);
    } catch (error) {
      console.error('发送 register 验证码失败:', error);
    } finally {
      setRegisterCodeSending(false);
    }
  };

  const sendResetCode = async () => {
    try {
      const values = await resetPasswordForm.validateFields(['email']);
      setResetCodeSending(true);
      const result = await authApi.sendEmailCode({ email: values.email, scene: 'reset_password' });
      message.success(result.message || '验证码已发送');
      setResetCountdown(result.resend_interval_seconds || 60);
    } catch (error) {
      console.error('发送 reset_password 验证码失败:', error);
    } finally {
      setResetCodeSending(false);
    }
  };

  const handleEmailRegister = async (values: EmailRegisterValues) => {
    try {
      setLoading(true);
      const response = await authApi.emailRegister({
        email: values.email,
        code: values.code,
        password: values.password,
        display_name: values.display_name?.trim() || undefined,
      });
      if (response.success) {
        message.success('注册成功，已自动登录');
        emailRegisterForm.resetFields(['code', 'password', 'confirmPassword']);
        setRegisterCountdown(0);
        handleLoginSuccess();
      }
    } catch (error) {
      console.error('邮箱注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordValues) => {
    try {
      setLoading(true);
      const result = await authApi.resetEmailPassword({
        email: values.email,
        code: values.code,
        new_password: values.new_password,
      });
      message.success(result.message || '密码重置成功');
      resetPasswordForm.resetFields(['code', 'new_password', 'confirmNewPassword']);
      setResetCountdown(0);
      setShowResetPassword(false);
    } catch (error) {
      console.error('重置密码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinuxDOLogin = async () => {
    try {
      setLoading(true);
      const response = await authApi.getLinuxDOAuthUrl();
      const redirect = searchParams.get('redirect');
      if (redirect) sessionStorage.setItem('login_redirect', redirect);
      window.location.href = response.auth_url;
    } catch (error) {
      console.error('获取授权地址失败:', error);
      message.error('获取授权地址失败，请稍后重试');
      setLoading(false);
    }
  };

  const loginTips = useMemo(() => {
    const tips: string[] = [];
    if (localAuthEnabled) tips.push('本地登录默认账号：admin / admin123');
    tips.push('首次 LinuxDO 登录会自动创建账号');
    if (emailAuthEnabled) tips.push('邮箱注册用户支持通过验证码重置密码');
    return tips;
  }, [emailAuthEnabled, localAuthEnabled]);

  const featureItems = [
    { icon: <RobotOutlined />, title: '多模型协同', desc: 'OpenAI / Gemini / Claude 灵活切换' },
    { icon: <ThunderboltOutlined />, title: '智能大纲', desc: 'AI 驱动的故事骨架自动生成' },
    { icon: <TeamOutlined />, title: '角色管理', desc: '人物关系可视化，设定清晰掌控' },
    { icon: <BookOutlined />, title: '章节闭环', desc: '生成、精修、重写一站式完成' },
  ];

  const inputStyle = { height: 44, borderRadius: 8 };

  const renderLocalLogin = () => (
    <>
      <Form form={localForm} layout="vertical" onFinish={handleLocalLogin} size="large" style={{ marginTop: 8 }}>
        <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
          <Input
            prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="账号 / 邮箱"
            autoComplete="username"
            style={inputStyle}
          />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password
            prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="密码"
            autoComplete="current-password"
            style={inputStyle}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
          <Button type="primary" htmlType="submit" loading={loading} block className="login-primary-btn">
            登录
          </Button>
        </Form.Item>
      </Form>
      {linuxdoEnabled && (
        <>
          <div className="login-divider">或</div>
          {renderLinuxDOLogin()}
        </>
      )}
    </>
  );

  const renderEmailLogin = () => {
    if (showResetPassword) {
      return (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text strong style={{ fontSize: 15 }}>重置密码</Text>
            <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setShowResetPassword(false)}>
              返回登录
            </Button>
          </div>
          <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPassword}>
            <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
              <Input prefix={<MailOutlined />} placeholder="注册邮箱" style={inputStyle} />
            </Form.Item>
            <Form.Item label="验证码" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码' }, { len: 6, message: '验证码为 6 位' }]}>
                  <Input placeholder="6 位验证码" maxLength={6} style={{ ...inputStyle, borderRadius: '8px 0 0 8px' }} />
                </Form.Item>
                <Button onClick={sendResetCode} loading={resetCodeSending} disabled={resetCountdown > 0} style={{ height: 44 }}>
                  {resetCountdown > 0 ? `${resetCountdown}s` : '发送'}
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item name="new_password" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '至少 6 个字符' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="新密码" style={inputStyle} />
            </Form.Item>
            <Form.Item name="confirmNewPassword" dependencies={['new_password']} rules={[{ required: true, message: '请确认密码' }, { validator: function(_rule: unknown, value: string) { return !value || resetPasswordForm.getFieldValue('new_password') === value ? Promise.resolve() : Promise.reject(new Error('两次密码不一致')); } }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" style={inputStyle} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="login-primary-btn">
              重置密码
            </Button>
          </Form>
        </div>
      );
    }

    return (
      <Form form={emailLoginForm} layout="vertical" onFinish={handleEmailLogin} size="large" style={{ marginTop: 8 }}>
        <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
          <Input
            prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="邮箱地址"
            autoComplete="email"
            style={inputStyle}
          />
        </Form.Item>
        <Form.Item label="验证码" required style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码' }, { len: 6, message: '验证码为 6 位' }]}>
              <Input
                prefix={<SafetyCertificateOutlined style={{ color: token.colorTextQuaternary }} />}
                placeholder="6 位验证码"
                maxLength={6}
                style={{ ...inputStyle, borderRadius: '8px 0 0 8px' }}
              />
            </Form.Item>
            <Button onClick={sendLoginCode} loading={loginCodeSending} disabled={loginCountdown > 0} style={{ height: 44 }}>
              {loginCountdown > 0 ? `${loginCountdown}s` : '发送'}
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block className="login-primary-btn">
            验证码登录
          </Button>
        </Form.Item>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setShowResetPassword(true)}>
            忘记密码？
          </Button>
        </div>
      </Form>
    );
  };

  const renderEmailRegister = () => (
    <Form form={emailRegisterForm} layout="vertical" onFinish={handleEmailRegister} size="large" style={{ marginTop: 8 }}>
      <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
        <Input prefix={<MailOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="邮箱地址" autoComplete="email" style={inputStyle} />
      </Form.Item>
      <Form.Item label="验证码" required style={{ marginBottom: 12 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码' }, { len: 6, message: '验证码为 6 位' }]}>
            <Input prefix={<SafetyCertificateOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="6 位验证码" maxLength={6} style={{ ...inputStyle, borderRadius: '8px 0 0 8px' }} />
          </Form.Item>
          <Button onClick={sendRegisterCode} loading={registerCodeSending} disabled={registerCountdown > 0} style={{ height: 44 }}>
            {registerCountdown > 0 ? `${registerCountdown}s` : '发送'}
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item name="display_name" rules={[{ max: 50, message: '昵称不超过 50 个字符' }]}>
        <Input prefix={<UserOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="昵称（选填）" autoComplete="nickname" style={inputStyle} />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 个字符' }]}>
        <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="设置密码" autoComplete="new-password" style={inputStyle} />
      </Form.Item>
      <Form.Item name="confirmPassword" dependencies={['password']} rules={[{ required: true, message: '请确认密码' }, { validator: function(_rule: unknown, value: string) { return !value || emailRegisterForm.getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('两次密码不一致')); } }]}>
        <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="确认密码" autoComplete="new-password" style={inputStyle} />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block className="login-primary-btn">
          注册并登录
        </Button>
      </Form.Item>
    </Form>
  );

  const renderLinuxDOLogin = () => (
    <Button
      size="large"
      loading={loading}
      onClick={handleLinuxDOLogin}
      block
      className="login-oauth-btn"
      icon={
        <img src="/favicon.ico" alt="" style={{ width: 18, height: 18, verticalAlign: 'middle' }} />
      }
    >
      LinuxDO 登录
    </Button>
  );

  const authTabs = [
    ...(localAuthEnabled ? [{ key: 'local', label: '账号登录', children: renderLocalLogin() }] : []),
    ...(emailAuthEnabled ? [{ key: 'email', label: '邮箱登录', children: renderEmailLogin() }] : []),
    ...(emailAuthEnabled && emailRegisterEnabled ? [{ key: 'register', label: '注册', children: renderEmailRegister() }] : []),
  ];

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--mxy-bg-layout)' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Top bar */}
      <div className="login-topbar">
        <div className="login-topbar-brand">
          <img src="/logo.svg" alt="" className="login-topbar-logo" />
          <span className="login-topbar-name">墨小语</span>
        </div>
        <ThemeSwitch />
      </div>

      {/* Main two-panel layout */}
      <div className="login-main">
        {/* Left: Brand Panel */}
        <div className="login-brand-panel">
          <div className="login-brand-bg-dots" />
          <div className="login-brand-glow-1" />
          <div className="login-brand-glow-2" />

          <div className="login-brand-content">
            <div className="login-brand-logo">
              <img src="/logo.svg" alt="" className="login-brand-logo-icon" />
              <span className="login-brand-logo-text">墨小语</span>
            </div>

            <h1 className="login-brand-claim">
              从灵感到成稿，
              <br />
              <span className="login-brand-claim-accent">AI 与你并肩创作</span>
            </h1>

            <p className="login-brand-subtitle">
              多模型协同、智能大纲、角色管理、章节精修——为网文作者打造的一体化创作工作台。
            </p>

            <div className="login-features">
              {featureItems.map((item) => (
                <div key={item.title} className="login-feature-item">
                  <div className="login-feature-icon">{item.icon}</div>
                  <div className="login-feature-title">{item.title}</div>
                  <p className="login-feature-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="login-brand-decoration">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <path d="M120 20C100 40 60 80 40 120C35 130 30 140 40 140C50 140 60 135 70 125C90 105 110 65 130 40C135 33 127 13 120 20Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M40 120L25 155L45 135" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="25" cy="155" r="3" fill="white" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Right: Auth Panel */}
        <div className="login-auth-panel">
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* Mobile brand header */}
            <div className="login-mobile-brand">
              <Space align="center" size={10} style={{ marginBottom: 12 }}>
                <img src="/logo.svg" alt="" style={{ width: 32, height: 32 }} />
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--mxy-text-primary)' }}>墨小语</span>
              </Space>
            </div>

            <div className="login-card mxy-animate-in">
              <h2 className="login-card-title">欢迎回来</h2>
              <p className="login-card-subtitle">登录以继续你的创作</p>

              {authTabs.length > 0 ? (
                <Tabs
                  defaultActiveKey={authTabs[0].key}
                  items={authTabs}
                  size="large"
                  style={{ marginBottom: 0 }}
                />
              ) : null}

              {!localAuthEnabled && !linuxdoEnabled && !emailAuthEnabled ? (
                <Alert
                  type="warning" showIcon
                  message="未启用登录方式"
                  description="请联系管理员启用本地登录、邮箱认证或 OAuth 登录。"
                  style={{ marginTop: 16, borderRadius: 8 }}
                />
              ) : null}

              {emailAuthEnabled && !emailRegisterEnabled ? (
                <Alert
                  type="info" showIcon
                  message="邮箱注册暂未开放"
                  description="如需注册请联系管理员。"
                  style={{ marginTop: 16, borderRadius: 8 }}
                />
              ) : null}
            </div>

            {/* Collapsible tips */}
            <Collapse
              ghost
              style={{ marginTop: 16 }}
              items={[{
                key: 'tips',
                label: (
                  <Space size={6}>
                    <QuestionCircleOutlined style={{ color: 'var(--mxy-text-tertiary)', fontSize: 13 }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>登录说明</Text>
                  </Space>
                ),
                children: (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {loginTips.map((tip) => (
                      <li key={tip} style={{ marginBottom: 4, color: 'var(--mxy-text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                ),
              }]}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <span className="login-footer-text">&copy; 2026 墨小语 &middot; AI驱动的专业网文创作平台</span>
      </div>
    </div>
  );
}
