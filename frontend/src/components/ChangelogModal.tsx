import { Modal, Timeline, Empty, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getChangelogEntries, type ChangelogEntry } from '../services/changelogService';

interface ChangelogModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ visible, onClose }: ChangelogModalProps) {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getChangelogEntries()
        .then(setChangelog)
        .catch(() => setChangelog([]))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  return (
    <Modal
      title={
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          更新日志
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : changelog.length === 0 ? (
        <Empty description="暂无更新日志" />
      ) : (
        <Timeline
          items={changelog.map((entry) => ({
            dot: <ClockCircleOutlined />,
            children: (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {entry.version} <span style={{ color: '#999', fontSize: 12, fontWeight: 400 }}>{entry.date}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {entry.changes.map((change, i) => (
                    <li key={i} style={{ lineHeight: '1.8' }}>{change}</li>
                  ))}
                </ul>
              </div>
            ),
          }))}
        />
      )}
    </Modal>
  );
}
