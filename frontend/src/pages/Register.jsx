import { Layout, Button, Form, Input, Card, Typography } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../components/LogoutBtn";
import "./Register.scss";

const onFinish = (values) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const { Content } = Layout;
const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <Layout className="register-layout">
      <Content className="register-content">
        <Card className="register-card">
          <div className="register-header">
            <Title level={2} className="register-header__title">
              Create Account
            </Title>
            <Typography.Text type="secondary">
              Join AirBrB today
            </Typography.Text>
          </div>
          <LogoutBtn />
          <Form
            name="register"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please input your name!" },
                { min: 2, message: "Name must be at least 2 characters!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Your full name" />
            </Form.Item>

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
              <Input prefix={<MailOutlined />} placeholder="your@email.com" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
              />
            </Form.Item>

            <Form.Item className="register-form__submit-item">
              <Button
                type="primary"
                htmlType="submit"
                block
                className="register-form__submit-button"
              >
                Sign Up
              </Button>
            </Form.Item>

            <div className="register-footer">
              <Typography.Text type="secondary">
                Already have an account?{" "}
              </Typography.Text>
              <Button
                type="link"
                className="register-footer__signin-link"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Register;
