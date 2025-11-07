import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Radio,
  InputNumber,
  Upload,
  Space,
  Popover,
  List,
} from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

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

const normFile = (e) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const promptData = [
  "Single beds: Single, Long Single, and King Single beds.",
  "Double beds: Double, Queen, King, Super King beds.",
];

const CreateHostForm = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState();
  const onCreate = (values) => {
    console.log("Received values of form: ", values);
    setFormValues(values);
    setOpen(false);
  };
  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<PlusOutlined />}
      >
        Create new listing
      </Button>

      <Modal
        open={open}
        title="Create new listing"
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        onCancel={() => setOpen(false)}
        destroyOnHidden
        width="90%"
        style={{ maxWidth: "800px", top: 20 }}
        styles={{
          body: {
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          },
        }}
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
       
      </Modal>
    </>
  );
};

export default CreateHostForm;
