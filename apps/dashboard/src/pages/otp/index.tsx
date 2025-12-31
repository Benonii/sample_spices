import React from "react";
import {
  useRouterContext,
  useRouterType,
  useLink,
} from "@refinedev/core";
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Layout,
} from "antd";
import { containerStyles, layoutStyles, titleStyles } from "./styles";
import { LoadingOutlined } from "@ant-design/icons";
import BetterAuthLogo from "@/assets/better-auth-logo.png";

const { Title } = Typography;

interface IOtpForm {
  otp: string;
}

export const Otp: React.FC = () => {
  const [form] = Form.useForm<IOtpForm>();
  const [loading, setLoading] = React.useState(false);

  const Link = useLink();
  const { Link: LegacyLink } = useRouterContext();
  const routerType = useRouterType();

  const handleOtpSubmit = (values: IOtpForm) => {
    setLoading(true);
    // Simulate OTP verification delay
    setTimeout(() => {
      console.log("OTP Submitted:", values.otp);
      setLoading(false);
      // Redirect or handle result here
    }, 1000);
  };

  const CardTitle = (
    <Title
      level={3}
      style={{
        ...titleStyles,
      }}
    >
      Enter the code we sent to your email
    </Title>
  );

  return (
    <Layout style={layoutStyles}>
      <Row
        justify="center"
        align={"middle"}
        style={{
          padding: "16px 0",
          minHeight: "100dvh",
        }}
      >
        <Col xs={22}>
          <div className="container">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "32px",
                fontSize: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "24px",
                  marginLeft: "50px",
                }}
              >
                <p style={{ marginTop: "40px" }}>Powered by</p>
                <span style={{ display: "flex" }}>
                  <img
                    src={BetterAuthLogo}
                    alt="Better Auth logo"
                    width={100}
                    height={100}
                  />
                  <h2 style={{ marginTop: "10px" }}>BETTER-AUTH</h2>
                </span>
              </div>
            </div>
            <Card title={CardTitle} style={{ ...containerStyles }}>
              <Form<IOtpForm>
                layout="vertical"
                form={form}
                onFinish={handleOtpSubmit}
                requiredMark={false}
              >
                <Form.Item
                  name="otp"
                  label="OTP"
                  rules={[
                    { required: true, message: "Please enter the code" },
                    { len: 6, message: "OTP must be 6 digits" },
                  ]}
                >
                  <Input
                    placeholder="Enter 6-digit code"
                    size="large"
                    maxLength={6}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  block
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingOutlined style={{ fontSize: 24, color: "#FFF" }} spin />
                  ) : (
                    <>Verify</>
                  )}
                </Button>
              </Form>

              {/* Optional: Resend link */}
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <p style={{ fontSize: "14px" }}>
                  Didn't get the code?{" "}
                  <a style={{ textDecoration: "underline" }} onClick={() => alert("Resend OTP")}>
                    Resend
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </Layout>
  );
};
