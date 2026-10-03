import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Spin, Button, Drawer, Space, theme } from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  TeamOutlined,
  BookOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ApartmentOutlined,
  BankOutlined,
  EditOutlined,
  FundOutlined,
  TrophyOutlined,
  BulbOutlined,
  CloudOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useStore } from '../store';
import { useCharacterSync, useOutlineSync, useChapterSync } from '../store/hooks';
import { projectApi } from '../services/api';
import ThemeSwitch from '../components/ThemeSwitch';
import { useThemeMode } from '../theme/useThemeMode';
import { getStoredSidebarCollapsed, setStoredSidebarCollapsed } from '../utils/sidebarState';
import FloatingTaskPanel from '../components/FloatingTaskPanel';
import ProjectAgentPanel from '../components/project-agent/ProjectAgentPanel';
import { eventBus, EventNames } from '../store/eventBus';

const { Header, Sider, Content } = Layout;

const isMobile = () => window.innerWidth <= 768;

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => getStoredSidebarCollapsed());
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [agentDrawerVisible, setAgentDrawerVisible] = useState(false);
  const [agentLayout, setAgentLayout] = useState({ expanded: true, width: 410 });
  const handleAgentLayoutChange = useCallback((expanded: boolean, width: number) => {
    setAgentLayout(current => (
      current.expanded === expanded && current.width === width ? current : { expanded, width }
    ));
  }, []);
  const { token } = theme.useToken();
  const alphaColor = (color: string, alpha: number) => `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(0)}%, transparent)`;
  const { mode, resolvedMode, setMode } = useThemeMode();
  const cycleThemeMode = () => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  };
  const collapsedThemeIcon = mode === 'light' ? <BulbOutlined /> : mode === 'dark' ? <MoonOutlined /> : <CloudOutlined />;

  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
      if (!isMobile()) {
        setDrawerVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setStoredSidebarCollapsed(collapsed);
  }, [collapsed]);
  const {
    currentProject,
    setCurrentProject,
    clearProjectData,
    loading,
    setLoading,
  } = useStore();

  const { refreshCharacters } = useCharacterSync();
  const { refreshOutlines } = useOutlineSync();
  const { refreshChapters } = useChapterSync();

  useEffect(() => {
    const handleAgentDataChanged = (payload?: unknown) => {
      if (!projectId || !payload || typeof payload !== 'object') return;
      const resources = (payload as { resources?: string[] }).resources || [];
      const refreshes: Promise<unknown>[] = [];
      if (resources.includes('projects')) {
        refreshes.push(projectApi.getProject(projectId).then(setCurrentProject));
      }
      if (resources.includes('outlines')) refreshes.push(refreshOutlines(projectId));
      if (resources.includes('characters')) refreshes.push(refreshCharacters(projectId));
      if (resources.includes('chapters')) refreshes.push(refreshChapters(projectId));
      void Promise.all(refreshes);
    };
    eventBus.on(EventNames.AGENT_DATA_CHANGED, handleAgentDataChanged);
    const handleTaskSettled = (payload?: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const data = payload as { projectId?: string };
      if (data.projectId && data.projectId !== projectId) return;
      handleAgentDataChanged(payload);
    };
    eventBus.on(EventNames.BACKGROUND_TASK_SETTLED, handleTaskSettled);
    return () => {
      eventBus.off(EventNames.AGENT_DATA_CHANGED, handleAgentDataChanged);
      eventBus.off(EventNames.BACKGROUND_TASK_SETTLED, handleTaskSettled);
    };
  }, [projectId, refreshChapters, refreshCharacters, refreshOutlines, setCurrentProject]);

  useEffect(() => {
    const loadProjectData = async (id: string) => {
      try {
        setLoading(true);
        const project = await projectApi.getProject(id);
        setCurrentProject(project);

        await Promise.all([
          refreshOutlines(id),
          refreshCharacters(id),
          refreshChapters(id),
        ]);
      } catch (error) {
        console.error('加载项目数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData(projectId);
    }

    return () => {
      clearProjectData();
    };
  }, [projectId, clearProjectData, setLoading, setCurrentProject, refreshOutlines, refreshCharacters, refreshChapters]);

  const menuItems = [
    {
      type: 'group' as const,
      label: '创作管理',
      children: [
        {
          key: 'world-setting',
          icon: <GlobalOutlined />,
          label: <Link to={`/project/${projectId}/world-setting`}>世界设定</Link>,
        },
        {
          key: 'characters',
          icon: <TeamOutlined />,
          label: <Link to={`/project/${projectId}/characters`}>角色管理</Link>,
        },
        {
          key: 'organizations',
          icon: <BankOutlined />,
          label: <Link to={`/project/${projectId}/organizations`}>组织管理</Link>,
        },
        {
          key: 'careers',
          icon: <TrophyOutlined />,
          label: <Link to={`/project/${projectId}/careers`}>职业管理</Link>,
        },
        {
          key: 'relationships',
          icon: <ApartmentOutlined />,
          label: <Link to={`/project/${projectId}/relationships`}>关系管理</Link>,
        },
        {
          key: 'outline',
          icon: <FileTextOutlined />,
          label: <Link to={`/project/${projectId}/outline`}>大纲管理</Link>,
        },
        {
          key: 'chapters',
          icon: <BookOutlined />,
          label: <Link to={`/project/${projectId}/chapters`}>章节管理</Link>,
        },
        {
          key: 'chapter-analysis',
          icon: <FundOutlined />,
          label: <Link to={`/project/${projectId}/chapter-analysis`}>剧情分析</Link>,
        },
        {
          key: 'foreshadows',
          icon: <BulbOutlined />,
          label: <Link to={`/project/${projectId}/foreshadows`}>伏笔管理</Link>,
        },
      ],
    },
    {
      type: 'group' as const,
      label: '创作工具',
      children: [
        {
          key: 'writing-styles',
          icon: <EditOutlined />,
          label: <Link to={`/project/${projectId}/writing-styles`}>写作风格</Link>,
        },
        {
          key: 'prompt-workshop',
          icon: <CloudOutlined />,
          label: <Link to={`/project/${projectId}/prompt-workshop`}>提示词工坊</Link>,
        },
        {
          key: 'novel-ai-tools',
          icon: <ThunderboltOutlined />,
          label: <Link to={`/project/${projectId}/novel-ai-tools`}>网文AI工具</Link>,
        },
        {
          key: 'skill-chat',
          icon: <ThunderboltOutlined />,
          label: <Link to={`/project/${projectId}/skill-chat`}>Skill 工具箱</Link>,
        },
        {
          key: 'skill-manage',
          icon: <SettingOutlined />,
          label: <Link to={`/project/${projectId}/skill-manage`}>Skill 管理</Link>,
        },
      ],
    },
  ];

  const menuItemsCollapsed = [
    {
      key: 'world-setting',
      icon: <GlobalOutlined />,
      label: <Link to={`/project/${projectId}/world-setting`}>世界设定</Link>,
    },
    {
      key: 'careers',
      icon: <TrophyOutlined />,
      label: <Link to={`/project/${projectId}/careers`}>职业管理</Link>,
    },
    {
      key: 'characters',
      icon: <TeamOutlined />,
      label: <Link to={`/project/${projectId}/characters`}>角色管理</Link>,
    },
    {
      key: 'relationships',
      icon: <ApartmentOutlined />,
      label: <Link to={`/project/${projectId}/relationships`}>关系管理</Link>,
    },
    {
      key: 'organizations',
      icon: <BankOutlined />,
      label: <Link to={`/project/${projectId}/organizations`}>组织管理</Link>,
    },
    {
      key: 'outline',
      icon: <FileTextOutlined />,
      label: <Link to={`/project/${projectId}/outline`}>大纲管理</Link>,
    },
    {
      key: 'chapters',
      icon: <BookOutlined />,
      label: <Link to={`/project/${projectId}/chapters`}>章节管理</Link>,
    },
    {
      key: 'chapter-analysis',
      icon: <FundOutlined />,
      label: <Link to={`/project/${projectId}/chapter-analysis`}>剧情分析</Link>,
    },
    {
      key: 'foreshadows',
      icon: <BulbOutlined />,
      label: <Link to={`/project/${projectId}/foreshadows`}>伏笔管理</Link>,
    },
    {
      key: 'writing-styles',
      icon: <EditOutlined />,
      label: <Link to={`/project/${projectId}/writing-styles`}>写作风格</Link>,
    },
    {
      key: 'prompt-workshop',
      icon: <CloudOutlined />,
      label: <Link to={`/project/${projectId}/prompt-workshop`}>提示词工坊</Link>,
    },
    {
      key: 'novel-ai-tools',
      icon: <ThunderboltOutlined />,
      label: <Link to={`/project/${projectId}/novel-ai-tools`}>网文AI工具</Link>,
    },
    {
      key: 'skill-chat',
      icon: <ThunderboltOutlined />,
      label: <Link to={`/project/${projectId}/skill-chat`}>Skill 工具箱</Link>,
    },
    {
      key: 'skill-manage',
      icon: <SettingOutlined />,
      label: <Link to={`/project/${projectId}/skill-manage`}>Skill 管理</Link>,
    },
  ];

  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/world-setting')) return 'world-setting';
    if (path.includes('/careers')) return 'careers';
    if (path.includes('/relationships')) return 'relationships';
    if (path.includes('/organizations')) return 'organizations';
    if (path.includes('/outline')) return 'outline';
    if (path.includes('/characters')) return 'characters';
    if (path.includes('/chapter-analysis')) return 'chapter-analysis';
    if (path.includes('/foreshadows')) return 'foreshadows';
    if (path.includes('/chapters')) return 'chapters';
    if (path.includes('/writing-styles')) return 'writing-styles';
    if (path.includes('/prompt-workshop')) return 'prompt-workshop';
    if (path.includes('/novel-ai-tools')) return 'novel-ai-tools';
    if (path.includes('/skill-chat')) return 'skill-chat';
    if (path.includes('/skill-manage')) return 'skill-manage';
    if (path.includes('/sponsor')) return 'sponsor';
    return 'world-setting';
  }, [location.pathname]);

  if (loading || !currentProject) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const renderMenu = () => (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        style={{
          borderRight: 0,
          paddingTop: '8px',
          background: 'transparent',
        }}
        items={collapsed ? menuItemsCollapsed : menuItems}
        onClick={() => mobile && setDrawerVisible(false)}
      />
    </div>
  );

  const siderWidth = collapsed ? 60 : 200;

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      <Header style={{
        background: token.colorBgContainer,
        padding: mobile ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: mobile ? 0 : siderWidth,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        height: 56,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        borderBottom: `1px solid ${alphaColor(token.colorText, 0.06)}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
          {mobile && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{
                fontSize: '18px',
                color: token.colorText,
                width: '36px',
                height: '36px'
              }}
            />
          )}
        </div>

        <h2 style={{
          margin: 0,
          color: token.colorText,
          fontSize: mobile ? '16px' : '20px',
          fontWeight: 600,
          position: mobile ? 'static' : 'absolute',
          left: mobile ? 'auto' : '50%',
          transform: mobile ? 'none' : 'translateX(-50%)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: mobile ? 1 : 'none',
          textAlign: mobile ? 'center' : 'left',
          paddingLeft: mobile ? '8px' : '0',
          paddingRight: mobile ? '8px' : '0',
          letterSpacing: '0.02em'
        }}>
          {currentProject.title}
        </h2>

        {mobile && (
          <Space size={2} style={{ zIndex: 1 }}>
            <Button
              type="text"
              icon={<img src="/logo.svg" alt="墨小语" style={{ width: 20, height: 20, display: 'block' }} />}
              onClick={() => setAgentDrawerVisible(true)}
              style={{ color: token.colorText, width: 36, height: 36 }}
            />
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{
                fontSize: '14px',
                color: token.colorText,
                height: '36px',
                padding: '0 6px',
              }}
            >
              主页
            </Button>
          </Space>
        )}

        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{
                fontSize: '13px',
                color: token.colorTextSecondary,
                height: '36px',
                padding: '0 10px',
                borderRadius: '8px',
              }}
            >
              主页
            </Button>
          </div>
        )}
      </Header>

      <Layout style={{ marginTop: 56 }}>
        {mobile ? (
          <Drawer
            title={null}
            closable={false}
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
            styles={{
              body: { padding: 0, display: 'flex', flexDirection: 'column', background: '#0F172A' },
              header: { display: 'none' },
            }}
          >
            <div style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 10,
              flexShrink: 0,
            }}>
              <img src="/logo.svg" alt="墨小语" style={{ width: 28, height: 28 }} />
              <span style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>墨小语</span>
            </div>
            {renderMenu()}
            <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                <span>主题模式</span>
                <span>{resolvedMode === 'dark' ? '深色' : '浅色'}</span>
              </div>
              <ThemeSwitch block />
            </div>
          </Drawer>
        ) : (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            width={200}
            collapsedWidth={60}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              height: '100vh',
              background: '#0F172A',
              zIndex: 1000
            }}
          >
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? 0 : '0 14px',
                flexShrink: 0,
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: 8,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                {collapsed ? (
                  <Button
                    type="text"
                    icon={<MenuUnfoldOutlined />}
                    onClick={() => setCollapsed(false)}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      width: '100%',
                      height: '100%',
                      padding: 0,
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  />
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                      <img src="/logo.svg" alt="墨小语" style={{ width: 28, height: 28, flexShrink: 0 }} />
                      <span style={{
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '0.04em',
                      }}>
                        墨小语
                      </span>
                    </div>
                    <Button
                      type="text"
                      icon={<MenuFoldOutlined />}
                      onClick={() => setCollapsed(true)}
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        width: 32,
                        height: 32,
                        padding: 0,
                        flexShrink: 0
                      }}
                    />
                  </>
                )}
              </div>
              {renderMenu()}
              <div style={{
                padding: collapsed ? '12px 8px' : '12px 14px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0
              }}>
                {collapsed ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Button
                      type="text"
                      icon={collapsedThemeIcon}
                      onClick={cycleThemeMode}
                      title={`主题模式：${mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '跟随系统'}（点击切换）`}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        padding: 0,
                      }}
                    />
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/')}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        padding: 0,
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      <span>主题模式</span>
                      <span>{resolvedMode === 'dark' ? '深色' : '浅色'}</span>
                    </div>
                    <ThemeSwitch block />
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate('/')}
                      block
                      style={{
                        color: 'rgba(255,255,255,0.65)',
                        height: 40,
                        justifyContent: 'flex-start',
                        padding: '0 12px',
                        borderRadius: 10,
                      }}
                    >
                      返回主页
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Sider>
        )}

        <Layout style={{
          marginLeft: mobile ? 0 : siderWidth,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Content
            style={{
              background: token.colorBgLayout,
              padding: mobile ? 12 : 20,
              height: 'calc(100vh - 56px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              background: token.colorBgContainer,
              padding: 0,
              borderRadius: mobile ? '10px' : '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row'
            }}>
              <div style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: mobile ? 12 : 24,
              }}>
                <Outlet />
              </div>
              {projectId && (
                <ProjectAgentPanel
                  projectId={projectId}
                  mobile={mobile}
                  mobileOpen={agentDrawerVisible}
                  onMobileClose={() => setAgentDrawerVisible(false)}
                  onExpandedChange={handleAgentLayoutChange}
                />
              )}
            </div>
          </Content>
        </Layout>
      </Layout>

      {projectId && (
        <FloatingTaskPanel
          projectId={projectId}
          rightOffset={mobile ? 23 : (agentLayout.expanded ? agentLayout.width + 35 : 70)}
        />
      )}
    </Layout>
  );
}
