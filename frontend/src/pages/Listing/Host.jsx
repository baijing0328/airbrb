import { Layout, Typography, Button } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const Host = () => {
  const navigate = useNavigate();

  const handleToggle = () => {
    navigate("/all");
  };

  return (
    <Layout className="host-layout">
      <Header className="host-header">
        <div className="host-header__left">
          <Title level={3} className="host-header__title">
            AirBrB Host
          </Title>
        </div>
        <div className="host-header__right">
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={handleToggle}
          >
            All Listings
          </Button>
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          <Title level={2}>Welcome to Host Dashboard</Title>
          <p>Manage your listings here</p>
        </div>
      </Content>
    </Layout>
  );
};

export default Host;
