import { Layout, Button, Form, Input, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Login.scss";

const onFinish = (values) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const { Content } = Layout;
const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <Layout className="login-layout">
      <Content className="login-content">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-header__title">
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
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="your@email.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item className="login-form__submit-item">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-form__submit-button"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="login-footer">
              <Typography.Text type="secondary">
                Don&apos;t have an account?{" "}
              </Typography.Text>
              <Button
                type="link"
                className="login-footer__signup-link"
                onClick={handleSignUp}
              >
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
