import React, { useState } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  List,
  Avatar,
  Popconfirm,
} from "antd";
import {
  KeyOutlined,
  PlusOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNotification } from "@refinedev/core";
import { PassKey } from "../../data/settingsData";

const { Paragraph, Title } = Typography;

interface PasskeysProps {
  passKeys: PassKey[];
  onDeletePassKey?: (passKeyId: string) => void;
}

export const Passkeys: React.FC<PasskeysProps> = ({
  passKeys,
  onDeletePassKey,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { open } = useNotification();

    const handleAddPassKey = async (values: { name: string }) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setShowModal(false);
        form.resetFields();
        setLoading(false);
        open?.({
          type: "success",
          message: "Passkey added successfully",
          description: "You can now use this passkey to sign in.",
        });
    };

    const handleDeletePassKey = (passKeyId: string) => {
        onDeletePassKey?.(passKeyId);
        open?.({
          type: "success",
          message: "Passkey removed",
          description: "The selected passkey has been deleted.",
        });
    };

    return (
        <>
            <Card
              title={
                <Space>
                  <KeyOutlined />
                  Passkeys
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => setShowModal(true)}
                  icon={<PlusOutlined />}
                >
                  Add Passkey
                </Button>
              }
            >
                <Paragraph>
                  Passkeys provide a more secure and convenient way to sign in without passwords.
                  They use biometric authentication or device PINs.
                </Paragraph>
                <List
                  size="small"
                  dataSource={passKeys}
                  renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Popconfirm
                              key="delete"
                              title="Delete this passkey?"
                              description="You won't be able to use this passkey to sign in anymore."
                              onConfirm={() => handleDeletePassKey(item.id)}
                              okText="Yes"
                              cancelText="No"
                            >
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                >
                                    Remove
                                </Button>
                            </Popconfirm>
                        ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<SafetyCertificateOutlined />} />}
                        title={item.name}
                        description={`Created: ${item.createdAt} • Last used: ${item.lastUsed}`}
                      />
                    </List.Item>
                  )}
                />
            </Card> 
            <Modal
              title={
                <Space>
                  <KeyOutlined />
                  Add New Passkey
                </Space>
              }
              open={showModal}
              onCancel={() => setShowModal(false)}
              footer={null}
              width={500}
            >
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        margin: "0 auto 24px",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #d9d9d9",
                        borderRadius: "8px",
                      }}
                    >
                        <SafetyCertificateOutlined style={{ fontSize: "48px", color: "#999" }} />
                    </div>
                    <Title level={4}>Set Up Passkey</Title>
                    <Paragraph>
                      Follow your device's prompts to create a new passkey. This will allow you to
                      sign in using biometric authentication or your device PIN.
                    </Paragraph>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleAddPassKey}
                >
                    <Form.Item
                      name="name"
                      label="Passkey Name"
                      rules={[{ required: true, message: "Please enter a name for this passkey" }]}
                    >
                        <Input placeholder="e.g., MacBook Pro Touch ID" />
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
                          Create Passkey
                        </Button>
                      </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}; 