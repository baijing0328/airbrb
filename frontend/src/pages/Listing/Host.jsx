import { useState } from "react";
import { Layout, Typography, Button, Flex, Form, Input, Modal } from "antd";
import { UnorderedListOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostItem";
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
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState();
  const handleToggle = () => {
    navigate("/all");
  };

  const onCreate = (values) => {
    console.log("Received values of form: ", values);
    setFormValues(values);
    setOpen(false);
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
          <Button
            type="primary"
            onClick={() => setOpen(true)}
            icon={<PlusOutlined />}
          >
            Create new listing
          </Button>
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          <Flex gap="middle">{renderHostItems(test_data)}</Flex>
        </div>
      </Content>
      <Modal
        open={open}
        title="Create new listing"
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        modalRender={(dom) => (
          <Form
            layout="horizontal"
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            name="form_in_modal"
            labelAlign="right"
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please input the title of collection!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input type="textarea" />
        </Form.Item>
      </Modal>
    </Layout>
  );
};

export default Host;
