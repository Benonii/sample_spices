import React from "react";
import {
  useLink,
  useLogin,
  useRouterContext,
  useRouterType,
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
import BetterAuthLogo from "@/assets/better-auth-logo.png"


const { Title } = Typography;

export interface ILoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export const Login: React.FC = () => {
    const [form] = Form.useForm<ILoginForm>();

    const { mutate: login, isPending } = useLogin<ILoginForm>();

    const CardTitle = (
        <Title
          level={3}
          style={{
            ...titleStyles,
          }}
        >
            Sign in to your account
        </Title>
    );

    const Link = useLink();
    const { Link: LegacyLink } = useRouterContext();

    const routerType = useRouterType();

    const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

    return (
        <Layout style={layoutStyles}>
            <Row
              justify="center"
              align={"middle"}
              style={{
                padding: "16px 0",
                minHeight: "100dvh",
                paddingTop: "16px",
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
                            <div style={{ display: "flex", alignItems: "center", fontSize: "24px", marginLeft: "50px"}}>
                                <p style={{ marginTop: "40px"}}>Powered by</p>
                                <span style={{ display: "flex"}}>
                                    <img src={BetterAuthLogo} alt="Better Auth logo" width={100} height={100} />
                                    <h1 style={{ marginTop: "10px" }}>BETTER-AUTH</h1>
                                </span>
                            </div>
                        </div>
                        <Card
                          title={CardTitle}
                          style={{
                            ...containerStyles,
                          }}
                        >
                            <Form<ILoginForm>
                              layout="vertical"
                              form={form}
                              onFinish={(values) => {
                                login(values);
                              }}
                              requiredMark={false}
                              initialValues={{ remember: false }}
                            >
                                <Form.Item
                                  name="email"
                                  label="Email"
                                  rules={[{ required: true, type: "email" }]}
                                >
                                    <Input size="large" placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                  name="password"
                                  label="Password"
                                  rules={[{ required: true }]}
                                  style={{ marginBottom: "12px" }}
                                >
                                  <Input type="password" placeholder="●●●●●●●●" size="large" />
                                </Form.Item> 
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "24px",
                                  }}
                                >
                                    {/* <Form.Item
                                      name="remember"
                                      valuePropName="checked" // Ensure checkbox state is handled
                                      noStyle
                                    >
                                      <Checkbox style={{ fontSize: "12px" }}>
                                        <TextField value='Remember me' />
                                      </Checkbox>
                                    </Form.Item> */}
                                    <ActiveLink
                                      style={{
                                        fontSize: "12px",
                                        marginLeft: "auto",
                                      }}
                                      to="/forgot-password"
                                    >
                                      Forgot password?
                                    </ActiveLink>
                                </div>

                                <Button type="primary" size="large" htmlType="submit" block>
                                  {isPending ? (
                                    <LoadingOutlined style={{ fontSize: 24, color: "#FFF" }} spin />) : (
                                    <>Sign in</>
                                  )}
                                </Button>
                            </Form>
                            <div
                              style={{
                                marginTop: "20px",
                                display: "flex",
                                width: "full",
                                justifyContent: "center"
                              }}
                            >
                                <p>Don't have an account?
                                    <ActiveLink
                                      style={{
                                        fontSize: "14px",
                                        margniLeft: "auto",
                                        textDecoration: "underline"
                                      }}
                                      to="/signup"
                                    >
                                        {" "} Sign up
                                    </ActiveLink>
                                </p>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Layout>
    );
};
