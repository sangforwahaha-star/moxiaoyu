import { useState } from 'react';
import { Card, Tabs, Input, Button, Space, Tag, Progress, List, Typography, message, Alert } from 'antd';
import {
  WarningOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  EditOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

export default function NovelAITools() {
  const [activeTab, setActiveTab] = useState('sensitive');
  
  // Sensitive word detection
  const [sensitiveText, setSensitiveText] = useState('');
  const [sensitiveResult, setSensitiveResult] = useState<any>(null);
  const [sensitiveLoading, setSensitiveLoading] = useState(false);

  // Hook score
  const [hookText, setHookText] = useState('');
  const [hookResult, setHookResult] = useState<any>(null);
  const [hookLoading, setHookLoading] = useState(false);

  // Title generation
  const [titleGenre, setTitleGenre] = useState('');
  const [titleSummary, setTitleSummary] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [titleLoading, setTitleLoading] = useState(false);

  // Intro generation
  const [introTitle, setIntroTitle] = useState('');
  const [introGenre, setIntroGenre] = useState('');
  const [introKeywords, setIntroKeywords] = useState('');
  const [introSuggestion, setIntroSuggestion] = useState('');
  const [introLoading, setIntroLoading] = useState(false);

  // Dialogue polish
  const [dialogueText, setDialogueText] = useState('');
  const [dialogueContext, setDialogueContext] = useState('');
  const [dialogueResult, setDialogueResult] = useState('');
  const [dialogueLoading, setDialogueLoading] = useState(false);

  // Sensitive word detection
  const handleDetectSensitive = async () => {
    if (!sensitiveText.trim()) {
      message.warning('请输入要检测的文本');
      return;
    }

    setSensitiveLoading(true);
    try {
      const response = await axios.post('/api/novel-ai/sensitive-words', {
        text: sensitiveText,
      });
      setSensitiveResult(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '检测失败');
    } finally {
      setSensitiveLoading(false);
    }
  };

  // Hook score calculation
  const handleCalculateHook = async () => {
    if (!hookText.trim()) {
      message.warning('请输入要评分的文本');
      return;
    }

    setHookLoading(true);
    try {
      const response = await axios.post('/api/novel-ai/hook-score', {
        text: hookText,
      });
      setHookResult(response.data);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '评分失败');
    } finally {
      setHookLoading(false);
    }
  };

  // Title generation
  const handleGenerateTitles = async () => {
    if (!titleGenre.trim() || !titleSummary.trim()) {
      message.warning('请填写题材和故事简介');
      return;
    }

    setTitleLoading(true);
    try {
      const response = await axios.post('/api/novel-ai/generate-titles', {
        genre: titleGenre,
        summary: titleSummary,
      });
      setTitleSuggestions(response.data.suggestions);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setTitleLoading(false);
    }
  };

  // Intro generation
  const handleGenerateIntro = async () => {
    if (!introTitle.trim() || !introGenre.trim()) {
      message.warning('请填写书名和题材');
      return;
    }

    setIntroLoading(true);
    try {
      const response = await axios.post('/api/novel-ai/generate-intro', {
        title: introTitle,
        genre: introGenre,
        keywords: introKeywords,
      });
      setIntroSuggestion(response.data.suggestion);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '生成失败');
    } finally {
      setIntroLoading(false);
    }
  };

  // Dialogue polish
  const handlePolishDialogue = async () => {
    if (!dialogueText.trim()) {
      message.warning('请输入对话内容');
      return;
    }

    setDialogueLoading(true);
    try {
      const response = await axios.post('/api/novel-ai/polish-dialogue', {
        dialogue: dialogueText,
        context: dialogueContext,
      });
      setDialogueResult(response.data.polished);
    } catch (error: any) {
      message.error(error.response?.data?.detail || '润色失败');
    } finally {
      setDialogueLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'sensitive',
      label: (
        <span>
          <WarningOutlined />
          敏感词检测
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            message="检测文本中可能存在的敏感词汇，帮助规避平台审核风险"
            type="info"
            showIcon
          />
          <TextArea
            rows={8}
            placeholder="请输入要检测的章节内容..."
            value={sensitiveText}
            onChange={(e) => setSensitiveText(e.target.value)}
          />
          <Button
            type="primary"
            icon={<WarningOutlined />}
            loading={sensitiveLoading}
            onClick={handleDetectSensitive}
          >
            开始检测
          </Button>
          {sensitiveResult && (
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>检测结果：</Text>
                  {sensitiveResult.has_sensitive ? (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                      发现 {sensitiveResult.sensitive_words.length} 个敏感词
                    </Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      未检测到敏感词
                    </Tag>
                  )}
                </div>
                {sensitiveResult.has_sensitive && (
                  <List
                    size="small"
                    dataSource={sensitiveResult.sensitive_words}
                    renderItem={(item: any) => (
                      <List.Item>
                        <Space>
                          <Text type="danger">{item.word}</Text>
                          <Text type="secondary">建议替换为：</Text>
                          <Tag color="green">{item.suggestions.join('、')}</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Space>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'hook',
      label: (
        <span>
          <ThunderboltOutlined />
          钩子评分
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            message="评估章节开头的吸引力，从悬念、对话、感官描写等维度打分"
            type="info"
            showIcon
          />
          <TextArea
            rows={8}
            placeholder="请输入章节开头内容（建议500-1000字）..."
            value={hookText}
            onChange={(e) => setHookText(e.target.value)}
          />
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={hookLoading}
            onClick={handleCalculateHook}
          >
            计算评分
          </Button>
          {hookResult && (
            <Card>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>综合评分：</Text>
                  <Progress
                    percent={hookResult.score}
                    status={hookResult.score >= 70 ? 'success' : hookResult.score >= 50 ? 'normal' : 'exception'}
                    format={() => `${hookResult.score}分`}
                  />
                </div>
                <div>
                  <Text strong>评分详情：</Text>
                  <List
                    size="small"
                    dataSource={Object.entries(hookResult.breakdown)}
                    renderItem={([key, value]: any) => (
                      <List.Item>
                        <Text>{key}</Text>
                        <Tag color={value >= 15 ? 'green' : value >= 10 ? 'blue' : 'orange'}>
                          {value}分
                        </Tag>
                      </List.Item>
                    )}
                  />
                </div>
                {hookResult.suggestions.length > 0 && (
                  <div>
                    <Text strong>改进建议：</Text>
                    <ul style={{ marginTop: '8px' }}>
                      {hookResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>
                          <Text>{suggestion}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Space>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: (
        <span>
          <FileTextOutlined />
          标题生成
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            message="根据题材和故事简介，智能生成吸引人的小说标题"
            type="info"
            showIcon
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="题材（如：玄幻、都市、言情）"
              value={titleGenre}
              onChange={(e) => setTitleGenre(e.target.value)}
            />
            <TextArea
              rows={4}
              placeholder="故事简介（200字以内）..."
              value={titleSummary}
              onChange={(e) => setTitleSummary(e.target.value)}
            />
          </Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            loading={titleLoading}
            onClick={handleGenerateTitles}
          >
            生成标题
          </Button>
          {titleSuggestions.length > 0 && (
            <Card>
              <Text strong>推荐标题：</Text>
              <List
                style={{ marginTop: '12px' }}
                dataSource={titleSuggestions}
                renderItem={(item: string) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'intro',
      label: (
        <span>
          <BulbOutlined />
          简介生成
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            message="根据书名和题材，生成引人入胜的小说简介"
            type="info"
            showIcon
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="书名"
              value={introTitle}
              onChange={(e) => setIntroTitle(e.target.value)}
            />
            <Input
              placeholder="题材（如：玄幻、都市、言情）"
              value={introGenre}
              onChange={(e) => setIntroGenre(e.target.value)}
            />
            <Input
              placeholder="关键词（可选，用逗号分隔）"
              value={introKeywords}
              onChange={(e) => setIntroKeywords(e.target.value)}
            />
          </Space>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            loading={introLoading}
            onClick={handleGenerateIntro}
          >
            生成简介
          </Button>
          {introSuggestion && (
            <Card>
              <Text strong>推荐简介：</Text>
              <Paragraph style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                {introSuggestion}
              </Paragraph>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'dialogue',
      label: (
        <span>
          <EditOutlined />
          对话润色
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            message="优化对话内容，使其更加生动自然，符合角色性格"
            type="info"
            showIcon
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            <TextArea
              rows={6}
              placeholder="原始对话内容..."
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
            />
            <TextArea
              rows={3}
              placeholder="对话背景（可选，如：角色性格、场景氛围）..."
              value={dialogueContext}
              onChange={(e) => setDialogueContext(e.target.value)}
            />
          </Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            loading={dialogueLoading}
            onClick={handlePolishDialogue}
          >
            润色对话
          </Button>
          {dialogueResult && (
            <Card>
              <Text strong>润色后：</Text>
              <Paragraph style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>
                {dialogueResult}
              </Paragraph>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>墨小语 AI 工具</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        专为网文作者打造的智能写作辅助工具
      </Text>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>
    </div>
  );
}
