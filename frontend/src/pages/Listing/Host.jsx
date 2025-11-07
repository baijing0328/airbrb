import { useState } from "react";
import { Layout, Typography, Button, Flex } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostListing/HostItem";
import CreateHostForm from "../../components/HostListing/CreateHostForm";
import { test_data } from "../../utils/mock";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const renderHostItems = (listings) => {
  return listings.map((listing) => (
    <HostItem key={listing.id} listing={listing} />
  ));
};


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
          <CreateHostForm />
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          <Flex gap="middle">{renderHostItems(test_data)}</Flex>
        </div>
      </Content>
    </Layout>
  );
};

export default Host;
