import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  DatePicker,
  Form,
  message,
  Space,
  Tag,
  Dropdown,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  publishListing,
  unpublishListing,
  updateListing,
  getListing,
} from "../../services/listingManageService";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { theme, mergeDateRanges } from "../../utils/utils";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

const PublishHostItem = ({ listingId, isPublished, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [currentAvailability, setCurrentAvailability] = useState([]);
  const [modalMode, setModalMode] = useState("publish"); // "publish" or "edit"

  useEffect(() => {
    if (isPublished) {
      fetchCurrentAvailability();
    }
  }, [isPublished, listingId]);

  const fetchCurrentAvailability = async () => {
    try {
      const response = await getListing(listingId);
      const availability = response.listing?.availability || [];
      setCurrentAvailability(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const handlePublish = async (values) => {
    if (!values.availability || values.availability.length === 0) {
      message.error("Please add at least one availability range");
      return;
    }

    setLoading(true);
    try {
      const availability = values.availability.map((range) => ({
        start: range[0].format("YYYY-MM-DD"),
        end: range[1].format("YYYY-MM-DD"),
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

  const handleUpdateAvailability = async (values) => {
    if (!values.availability || values.availability.length === 0) {
      message.error("Please add at least one availability range");
      return;
    }

    setLoading(true);
    try {
      const newRanges = values.availability.map((range) => ({
        start: range[0].format("YYYY-MM-DD"),
        end: range[1].format("YYYY-MM-DD"),
      }));

      // Merge with existing availability
      const combinedRanges = [...currentAvailability, ...newRanges];

      // Merge adjacent/overlapping date ranges
      const updatedAvailability = mergeDateRanges(combinedRanges);

      // Update via updateListing with availability
      const response = await getListing(listingId);
      const listing = response.listing;
      await updateListing(listingId, {
        title: listing.title,
        address: listing.address,
        thumbnail: listing.thumbnail,
        price: listing.price,
        metadata: {
          ...listing.metadata,
          availability: updatedAvailability,
        },
      });

      // Since backend doesn't have direct availability update, we need to unpublish and republish
      await unpublishListing(listingId);
      await publishListing(listingId, updatedAvailability);

      message.success("Availability updated successfully!");
      setOpen(false);
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      message.error("Failed to update availability");
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

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setOpen(true);
  };

  const menuItems = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit Availability",
      onClick: () => handleOpenModal("edit"),
    },
    {
      key: "unpublish",
      icon: <DeleteOutlined />,
      label: "Unpublish",
      danger: true,
      onClick: handleUnpublish,
    },
  ];

  return (
    <>
      {isPublished ? (
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button
            type="default"
            style={{
              borderColor: theme.marsGreen,
              color: theme.marsGreen,
              flex: 1,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.tiffanyBlue;
              e.currentTarget.style.backgroundColor = theme.lightTiffany;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.marsGreen;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Manage <DownOutlined />
          </Button>
        </Dropdown>
      ) : (
        <Button
          type="default"
          icon={<UploadOutlined />}
          onClick={() => handleOpenModal("publish")}
          style={{
            backgroundColor: theme.kleinBlue,
            borderColor: theme.kleinBlue,
            color: "#fff",
            flex: 1,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#001A70";
            e.currentTarget.style.borderColor = "#001A70";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.kleinBlue;
            e.currentTarget.style.borderColor = theme.kleinBlue;
          }}
        >
          Publish
        </Button>
      )}

      <Modal
        title={modalMode === "publish" ? "Publish Listing" : "Add Availability"}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={
            modalMode === "publish" ? handlePublish : handleUpdateAvailability
          }
          initialValues={{
            availability: [],
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
                    return Promise.reject(
                      "Please add at least one availability range"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <AvailabilityRangeSelector existingRanges={currentAvailability} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const AvailabilityRangeSelector = ({
  value = [],
  onChange,
  existingRanges = [],
}) => {
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

  // Get all disabled dates from existing ranges and other selected ranges
  const getDisabledDate = (currentIndex) => (current) => {
    if (!current) {
      return false;
    }

    // Ensure current is a dayjs object
    const currentDay = dayjs(current);

    // Disable past dates
    if (currentDay.isBefore(dayjs().startOf("day"))) {
      return true;
    }

    // Check overlap with existing ranges
    for (const existingRange of existingRanges) {
      const start = dayjs(existingRange.start);
      const end = dayjs(existingRange.end);
      if (
        currentDay.isSameOrAfter(start, "day") &&
        currentDay.isSameOrBefore(end, "day")
      ) {
        return true;
      }
    }

    // Check overlap with other currently selected ranges (excluding current one)
    for (let i = 0; i < ranges.length; i++) {
      if (i === currentIndex) continue;
      const range = ranges[i];
      if (range && range[0] && range[1]) {
        const start = dayjs(range[0]);
        const end = dayjs(range[1]);
        if (
          currentDay.isSameOrAfter(start, "day") &&
          currentDay.isSameOrBefore(end, "day")
        ) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div>
      {existingRanges.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Current Availability:
          </div>
          <Space wrap>
            {existingRanges.map((range, index) => (
              <Tag key={index} color="green">
                {dayjs(range.start).format("MMM D")} -{" "}
                {dayjs(range.end).format("MMM D, YYYY")}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <Space direction="vertical" style={{ width: "100%" }}>
        {ranges.map((range, index) => (
          <Space key={index} align="baseline">
            <RangePicker
              value={range}
              onChange={(dates) => handleRangeChange(index, dates)}
              disabledDate={getDisabledDate(index)}
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
            New Ranges to Add:
          </div>
          <Space wrap>
            {ranges.map((range, index) => {
              if (range && range[0] && range[1]) {
                return (
                  <Tag key={index} color="blue">
                    {dayjs(range[0]).format("MMM D")} -{" "}
                    {dayjs(range[1]).format("MMM D, YYYY")}
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
