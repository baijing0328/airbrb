import { useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  InputNumber,
  Upload,
} from "antd";
import {
  UnorderedListOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostItem";
import { test_data } from "../../utils/mock";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const formRules = {
  title: [
    {
      required: true,
      message: "Please input the title of host listing!",
    },
  ],
  address: [
    {
      required: true,
      message: "Please input the address of host listing!",
    },
  ],
  price: [
    {
      required: true,
      message: "Please input the price per night of host listing!",
    },
  ],
  property_type: [
    {
      required: true,
      message: "Please select the property type of host listing!",
    },
  ],
  bathrooms: [
    {
      required: true,
      message: "Please input the number of bathrooms of host listing!",
    },
  ],
};

const renderHostItems = (listings) => {
  return listings.map((listing) => (
    <HostItem key={listing.id} listing={listing} />
  ));
};

const normFile = (e) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
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
        width="90%"
        style={{ maxWidth: "800px" }}
        modalRender={(dom) => (
          <Form
            layout="horizontal"
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            name="form_in_modal"
            labelAlign="right"
            clearOnDestroy
            onFinish={(values) => onCreate(values)}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item name="title" label="Title" rules={formRules.title}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={formRules.address}>
          <Input />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={formRules.price}>
          <Input />
        </Form.Item>
        <Form.Item
          name="property_type"
          label="Property Type"
          rules={formRules.property_type}
        >
          <Radio.Group>
            <Radio value="Apartment">Apartment</Radio>
            <Radio value="House">House</Radio>
            <Radio value="Townhouse">Townhouse</Radio>
            <Radio value="Land">Land</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="bathrooms"
          label="Bathrooms"
          rules={formRules.bathrooms}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item name="amenities" label="Property amenities">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Thumbnail">
          <Form.Item
            name="thumbnail "
            valuePropName="fileList"
            getValueFromEvent={normFile}
            noStyle
          >
            <Upload.Dragger name="files" action="/upload.do">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload.
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
      </Modal>
    </Layout>
  );
};

export default Host;
