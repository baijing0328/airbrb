import { Layout, Typography, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const All = () => {
  const navigate = useNavigate();

  const handleToggle = () => {
    navigate("/host");
  };

  return (
    <Layout className="host-layout">
      <Header className="host-header">
        <div className="host-header__left">
          <Title level={3} className="host-header__title">
            AirBrB
          </Title>
        </div>
        <div className="host-header__right">
          <Button
            type="default"
            icon={<HomeOutlined />}
            onClick={handleToggle}
          >
            My Listings
          </Button>
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          <Title level={2}>All Listings</Title>
          <p>Browse all available listings</p>
        </div>
      </Content>
    </Layout>
  );
};

export default All;
