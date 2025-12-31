import React from "react";
import {
  Card,
  Typography,
  Space,
  List,
  Avatar,
  Tag,
  Popconfirm,
  Button,
} from "antd";
import {
  DesktopOutlined,
  MobileOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNotification } from "@refinedev/core";
import { Session } from "../../data/settingsData";

const { Paragraph } = Typography;

interface SessionManagementProps {
  sessions: Session[];
  onRevokeSession?: (sessionId: string) => void;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
  sessions,
  onRevokeSession,
}) => {
    const { open } = useNotification();

    const handleRevokeSession = (sessionId: string) => {
      // Simulate API call
      onRevokeSession?.(sessionId);
      open?.({
        type: "success",
        message: "Session revoked",
        description: "The selected session has been terminated.",
      });
    };

    const getDeviceIcon = (device: string) => {
      if (device.includes("iPhone") || device.includes("Mobile")) {
        return <MobileOutlined />;
      }
      return <DesktopOutlined />;
    };

    return (
        <Card
          title={
            <Space>
              <DesktopOutlined />
              Active Sessions
            </Space>
          }
        >
            <Paragraph>
              Manage your active sessions across different devices. You can revoke access
              to any device you no longer use.
            </Paragraph>
            <List
                size="small"
                dataSource={sessions}
                renderItem={(item) => (
                    <List.Item
                      actions={
                        item.current
                          ? [
                              <Tag key="current" color="blue">Current</Tag>
                            ]
                          : [
                              <Popconfirm
                                key="revoke"
                                title="Revoke this session?"
                                description="This will sign out the device from your account."
                                onConfirm={() => handleRevokeSession(item.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                >
                                  Revoke
                                </Button>
                              </Popconfirm>
                            ]
                      }
                    >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={getDeviceIcon(item.device)}
                            />
                          }
                          title={item.device}
                          description={`${item.location} • Last active: ${item.lastActive}`}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};