import { useState } from "react";
import {
  Card,
  Typography,
  Switch,
  Space,
  Modal,
  Button,
  Alert,
  Input,
  Form,
  notification,
} from "antd";
import { SecurityScanOutlined } from "@ant-design/icons";
import { useNotification } from "@refinedev/core";
import { authClient } from "@/utils/authClient";
import { QRCode } from 'antd';
import BetterAuthIcon from "@/assets/better-auth-logo.png"

const { Paragraph } = Typography;

type TwoFactorData = {
    totpURI: string,
    backupCodes: string[]
}

export const TwoFactorAuth = () => {
    const [showModal, setShowModal] = useState(false);
    const [ twoFactorData, setTwoFactorData ] = useState<TwoFactorData | undefined >(undefined);
    const [showQRCode, setShowQRCode ] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const { open } = useNotification();
    const { data: session, error } = authClient.useSession();
    const [form] = Form.useForm();

    if (error) {
        console.error("===========ERROR===========\n", error)
        notification.error({
          message: "Error!",
          description: error?.message || "Error getting user session"
        });
    };

    const handleToggle = async (password: string) => {
        if (session?.user.twoFactorEnabled) { 
            setIsLoading(true);
            const { error } = await authClient.twoFactor.disable({
              password
            })
            if (error) {
                setIsLoading(false)
                open?.({
                    type: "error",
                    message: "An error occured disabling 2FA",
                    description: error?.message || "Unkown error occured!"
                })
            } else {
                setIsLoading(false)
                open?.({
                    type: "success",
                    message: "Two-factor authentication disabled",
                    description: "Your account is now less secure. Consider re-enabling 2FA.",
                });
            }
        } else {
            setIsLoading(true);
            const { data, error } = await authClient.twoFactor.enable({
              password,
            });

            if (error) {
                setIsLoading(false)
                open?.({
                    type: "error",
                    message: "Error enabling 2FA",
                    description: error?.message || "Unkown error occured!"
                });
            } else {
                setIsLoading(false)
                console.log("Enabling 2fa!!!!!/n", data)
                setTwoFactorData(data)
                setShowQRCode(true)
            }
        }
    };

    const handleVerifyTotp = async (code: string) => {
        const { data, error } = await authClient.twoFactor.verifyTotp({
            code: "1234",
            trustDevice: true
        });

        console.log("=======Verification=========\n", data)

        if (error) {
            console.error("=====ERROR=====\n", error);
            open?.({
                type: "error",
                message: "Error verifiying Totp code",
                description: error?.message || ""
            })
        } else {
            open?.({
                type: "success",
                message: "Two-factor authentication enabled",
                description: "Your account is now more secure.",
            });
            setShowModal(false);
        }
    }

    console.log("==========FORM===========\n", form.getFieldValue('password'))

    return (
        <>
            <Card
              title={
                <Space>
                    <SecurityScanOutlined />
                    Two-Factor Authentication
                </Space>
              }
              extra={
                <Switch
                  checked={session?.user.twoFactorEnabled || false}
                  onChange={() => setShowModal(true)}
                  loading={loading}
                />
              }
            >
                <Paragraph>
                    Add an extra layer of security to your account by enabling two-factor authentication.
                    You will recive a code from your email.
                </Paragraph>
                {session?.user.twoFactorEnabled && (
                  <Alert
                    message="Two-factor authentication is enabled"
                    description="Your account is protected with 2FA. You'll need to enter a verification code when signing in."
                    type="success"
                    showIcon
                    style={{ marginTop: "16px" }}
                  />
                )}
            </Card>

            <Modal
              open={showModal}
              onCancel={() => setShowModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>,
                    <Button
                      key="setup"
                      type="primary"
                      loading={loading}
                      onClick={() => handleToggle(form.getFieldValue('password'))}
                    >
                        Set Up 2FA
                    </Button>
                ]}
                width={600}
            >
                <div style={{ textAlign: "left", padding: "24px 0" }}>
                    <Form form={form}>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                          <Input
                            type="password"
                          />
                        </Form.Item>
                        {showQRCode && (
                         <div style={{ width: 'full', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <p>*Scan the QR code on your Authenticator app and enter the code below</p>
                            <QRCode value={twoFactorData?.totpURI || ""} icon={BetterAuthIcon} size={250} />
                            <Form.Item
                                label="code"
                                name="Code"
                            >
                                <div style={{ display: 'flex',  gap: 2 }}>
                                    <Input width={100}/>
                                    <Button variant="dashed" onClick={() => handleVerifyTotp(form.getFieldValue('code'))}>Verify</Button>
                                </div>
                                
                            </Form.Item>
                         </div>
                        )}
                    </Form>
                </div>
            </Modal>
        </>
    );
}; 