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

        <Form.Item
          label={
            <>
              <span>Bedrooms</span>
              <Popover
                title={
                  <List
                    size="small"
                    bordered
                    dataSource={promptData}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  />
                }
              >
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Popover>
            </>
          }
          required
        >
          <Form.List
            name="bedrooms"
            initialValue={[{ single: 0, double: 0 }]}
            rules={[
              {
                validator: async (_, bedrooms) => {
                  if (!bedrooms || bedrooms.length < 1) {
                    return Promise.reject(
                      new Error("At least 1 bedroom required")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      width: "100%",
                      alignItems: "flex-start",
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "single"]}
                      initialValue={0}
                      rules={[
                        {
                          validator: async (_, value) => {
                            const doubleValue = form.getFieldValue([
                              "bedrooms",
                              name,
                              "double",
                            ]);
                            console.log(11111, form.getFieldValue());
                            // 使用 ?? 0 来处理 undefined 情况
                            const single = value ?? 0;
                            const double = doubleValue ?? 0;

                            console.log("Bedroom index:", name);
                            console.log("Single beds:", single);
                            console.log("Double beds:", double);
                            return Promise.resolve();
                          },
                        },
                      ]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <InputNumber
                        placeholder="Single Beds"
                        style={{ width: "100%" }}
                        min={0}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "double"]}
                      initialValue={0}
                      rules={[
                        {
                          validator: async (_, value) => {
                            return Promise.resolve();
                          },
                        },
                      ]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <InputNumber
                        placeholder="Double Beds"
                        style={{ width: "100%" }}
                        min={0}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{
                          color: "#ff4d4f",
                          fontSize: "18px",
                          marginTop: "8px",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{
                    marginTop: fields.length > 0 ? 8 : 0,
                  }}
                >
                  Add field
                </Button>
              </>
            )}
          </Form.List>
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
    </>
  );
};

export default CreateHostForm;
