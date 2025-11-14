import { useState } from "react";
import { Button, Modal, DatePicker, Form, message, Space, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { publishListing, unpublishListing } from "../../services/listingManageService";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const PublishHostItem = ({ listingId, isPublished, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handlePublish = async (values) => {
    if (!values.availability || values.availability.length === 0) {
      message.error("Please add at least one availability range");
      return;
    }

    setLoading(true);
    try {
      const availability = values.availability.map(range => ({
        start: range[0].format('YYYY-MM-DD'),
        end: range[1].format('YYYY-MM-DD')
      }));

      await publishListing(listingId, availability);
      message.success("Listing published successfully!");
      setOpen(false);
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error publishing listing:", error);
      message.error("Failed to publish listing");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishListing(listingId);
      message.success("Listing unpublished successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error unpublishing listing:", error);
      message.error("Failed to unpublish listing");
    }
  };

  return (
    <>
      {isPublished ? (
        <Button
          type="default"
          onClick={handleUnpublish}
          style={{
            borderColor: "#1890ff",
            color: "#1890ff",
            flex: 1,
          }}
        >
          Unpublish
        </Button>
      ) : (
        <>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setOpen(true)}
            style={{
              flex: 1,
            }}
          >
            Publish
          </Button>

          <Modal
            title="Publish Listing"
            open={open}
            onCancel={() => setOpen(false)}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePublish}
              initialValues={{
                availability: []
              }}
            >
              <Form.Item
                name="availability"
                label="Availability Ranges"
                rules={[
                  {
                    required: true,
                    message: "Please add at least one availability range",
                  },
                  {
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject("Please add at least one availability range");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <AvailabilityRangeSelector />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </>
  );
};

const AvailabilityRangeSelector = ({ value = [], onChange }) => {
  const [ranges, setRanges] = useState(value);

  const handleAddRange = () => {
    const newRanges = [...ranges, [null, null]];
    setRanges(newRanges);
    onChange?.(newRanges);
  };

  const handleRemoveRange = (index) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges);
    onChange?.(newRanges);
  };

  const handleRangeChange = (index, range) => {
    const newRanges = [...ranges];
    newRanges[index] = range;
    setRanges(newRanges);
    onChange?.(newRanges);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        {ranges.map((range, index) => (
          <Space key={index} align="baseline">
            <RangePicker
              value={range}
              onChange={(dates) => handleRangeChange(index, dates)}
              disabledDate={(current) => {
                return current && current < dayjs().startOf('day');
              }}
              placeholder={["Check-in", "Check-out"]}
            />
            {ranges.length > 1 && (
              <Button
                type="link"
                danger
                onClick={() => handleRemoveRange(index)}
              >
                Remove
              </Button>
            )}
          </Space>
        ))}
        <Button type="dashed" onClick={handleAddRange} block>
          Add Availability Range
        </Button>
      </Space>

      {ranges.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
            Selected Ranges:
          </div>
          <Space wrap>
            {ranges.map((range, index) => {
              if (range && range[0] && range[1]) {
                return (
                  <Tag key={index} color="blue">
                    {dayjs(range[0]).format('MMM D')} - {dayjs(range[1]).format('MMM D, YYYY')}
                  </Tag>
                );
              }
              return null;
            })}
          </Space>
        </div>
      )}
    </div>
  );
};

export default PublishHostItem;