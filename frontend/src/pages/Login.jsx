import { Layout, Button, Form, Input, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const onFinish = (values) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
  useEffect(() => {
    // Remove default margins and padding from body and html
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";

    return () => {
      // Cleanup on unmount
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            borderRadius: "12px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Welcome Back
            </Title>
            <Typography.Text type="secondary">
              Sign in to your AirBrB account
            </Typography.Text>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email address!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="your@email.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ height: 45, fontSize: 16 }}
              >
                Sign In
              </Button>
            </Form.Item>

            <div
              style={{
                textAlign: "center",
                marginTop: 16,
              }}
            >
              <Typography.Text type="secondary">
                Don&apos;t have an account?{" "}
              </Typography.Text>
              <Button type="link" style={{ padding: 0 }}>
                Sign Up
              </Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
