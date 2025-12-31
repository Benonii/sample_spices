import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
  Tag,
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNotification } from "@refinedev/core";

const { Paragraph } = Typography;

interface PasswordManagementProps {
  lastChanged?: string;
  passwordStrength?: string;
}

export const PasswordManagement: React.FC<PasswordManagementProps> = ({
  lastChanged = "3 months ago",
  passwordStrength = "Strong",
}) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { open } = useNotification();

    const handlePasswordReset = async (values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
        if (values.newPassword !== values.confirmPassword) {
          message.error("New passwords don't match");
          return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShowModal(false);
        form.resetFields();
        setLoading(false);
        open?.({
          type: "success",
          message: "Password updated successfully",
          description: "Your password has been changed.",
        });
    };

    const getStrengthColor = (strength: string) => {
      switch (strength.toLowerCase()) {
        case "strong":
          return "green";
        case "medium":
          return "orange";
        case "weak":
          return "red";
        default:
          return "green";
      }
    };

    return (
        <>
            <Card
              title={
                <Space>
                    <LockOutlined />
                    Password Management
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => setShowModal(true)}
                  icon={<LockOutlined />}
                >
                    Change Password
                </Button>
              }
            >
                <Paragraph>
                    Keep your password strong and unique. Consider using a password manager to generate
                    secure passwords.
                </Paragraph>
                <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Last changed">{lastChanged}</Descriptions.Item>
                    <Descriptions.Item label="Password strength">
                        <Tag color={getStrengthColor(passwordStrength)}>{passwordStrength}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
              title={
                <Space>
                    <LockOutlined />
                    Change Password
                </Space>
              }
              open={showModal}
              onCancel={() => setShowModal(false)}
              footer={null}
              width={500}
            >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handlePasswordReset}
                >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: "Please enter your current password" }]}
                    >
                        <Input.Password placeholder="Enter current password" />
                    </Form.Item>
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: "Please enter a new password" },
                        { min: 8, message: "Password must be at least 8 characters" },
                      ]}
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      rules={[
                        { required: true, message: "Please confirm your new password" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Passwords don't match"));
                          },
                        }),
                      ]}
                    >
                        <Input.Password placeholder="Confirm new password" />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                            >
                                Update Password
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}; 