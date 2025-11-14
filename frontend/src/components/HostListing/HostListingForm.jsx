import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Radio,
  InputNumber,
  Upload,
  Space,
  Popover,
  List,
  message,
} from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { fileToDataUrl, formatFormData } from "../../utils/helper";
import {
  addListing,
  getListing,
  updateListing,
} from "../../services/listingManageService";
import { HostListngFormRules, HostListingPromptData, theme } from "../../utils/utils";

const HostListingForm = ({ mode, onSuccess, listingId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailType, setThumbnailType] = useState("image");
  const [propertyImages, setPropertyImages] = useState([]);

  useEffect(() => {
    if (mode === "edit" && listingId) {
      const fetchListingDetails = async () => {
        try {
          setLoading(true);
          const response = await getListing(listingId);
          const listing = response.listing;

          // Set form initial values
          const formValues = {
            title: listing.title,
            address: listing.address,
            price: listing.price.toString(),
            property_type: listing.metadata?.property_type,
            bathrooms: listing.metadata?.bathrooms,
            bedrooms: listing.metadata?.bedrooms || [{ single: 0, double: 0 }],
            amenities: listing.metadata?.amenities,
          };

          // Set property images
          setPropertyImages(listing.metadata?.property_images || []);

          form.setFieldsValue(formValues);

          // Handle thumbnail
          if (listing.thumbnail) {
            if (listing.thumbnail.includes("youtube.com/embed/")) {
              setThumbnailType("video");
              // Extract YouTube URL from embed URL (this is a simple conversion)
              const videoId = listing.thumbnail.split("/embed/")[1];
              if (videoId) {
                form.setFieldsValue({
                  youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
                });
              }
            } else {
              setThumbnailType("image");
              setImagePreview(listing.thumbnail);
              form.setFieldsValue({ thumbnail: listing.thumbnail });
            }
          }
        } catch (error) {
          console.error("Error fetching listing details:", error);
          message.error("Failed to load listing details");
        } finally {
          setLoading(false);
        }
      };

      fetchListingDetails();
    } else if (mode === "create") {
      // Reset form for create mode
      form.resetFields();
      setImagePreview(null);
      setThumbnailType("image");
      setPropertyImages([]);
    }
  }, [mode, listingId, form]);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const params = await formatFormData(values);

      // Add property images to metadata
      if (!params.metadata) {
        params.metadata = {};
      }
      params.metadata.property_images = propertyImages;

      if (mode === "create") {
        await addListing(params);
        message.success("Listing created successfully");
        form.resetFields();
        setImagePreview(null);
        setThumbnailType("image");
        setPropertyImages([]);
      } else {
        await updateListing(listingId, params);
        message.success("Listing updated successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} listing:`,
        error
      );
      message.error(
        `Failed to ${mode === "create" ? "create" : "update"} listing`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item name="title" label="Title" rules={HostListngFormRules.title}>
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="Address"
        rules={HostListngFormRules.address}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="price"
        label={mode === "create" ? "Price" : "Price (per night)"}
        rules={HostListngFormRules.price}
      >
        <Input addonBefore={mode === "edit" ? "$" : undefined} />
      </Form.Item>

      <Form.Item
        name="property_type"
        label="Property Type"
        rules={HostListngFormRules.property_type}
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
        rules={HostListngFormRules.bathrooms}
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
                  dataSource={HostListingPromptData}
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
                    label={"Single Beds"}
                    rules={[
                      {
                        validator: async (_, value) => {
                          const doubleValue = form.getFieldValue([
                            "bedrooms",
                            name,
                            "double",
                          ]);
                          const single = value ?? 0;
                          const double = doubleValue ?? 0;

                          if (single === 0 && double === 0) {
                            return Promise.reject(
                              new Error(
                                "At least one bed (single or double) is required"
                              )
                            );
                          }
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
                    label={"Double Beds"}
                    rules={[
                      {
                        validator: async (_, value) => {
                          const single =
                            form.getFieldValue(["bedrooms", name, "single"]) ??
                            0;
                          const double = value ?? 0;

                          if (single === 0 && double === 0) {
                            return Promise.reject(
                              new Error(
                                "At least one bed (single or double) is required"
                              )
                            );
                          }
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
                {mode === "create" ? "Add field" : "Add bedroom"}
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item name="amenities" label="Property amenities">
        <Input.TextArea
          rows={4}
          placeholder="Describe the amenities of your property..."
        />
      </Form.Item>
      <Form.Item label="Thumbnail Type">
        <Radio.Group
          value={thumbnailType}
          onChange={(e) => {
            setThumbnailType(e.target.value);
            form.setFieldsValue({ thumbnail: null, youtubeUrl: null });
            setImagePreview(null);
          }}
        >
          <Radio value="image">Image Upload</Radio>
          <Radio value="video">YouTube Video</Radio>
        </Radio.Group>
      </Form.Item>

      {thumbnailType === "image" ? (
        <Form.Item label="Thumbnail Image">
          <Upload.Dragger
            name="files"
            maxCount={1}
            beforeUpload={(file) => {
              fileToDataUrl(file)
                .then((dataUrl) => {
                  form.setFieldsValue({
                    thumbnail: dataUrl,
                    youtubeUrl: null,
                  });
                  setImagePreview(dataUrl);
                })
                .catch((error) => {
                  console.error(error);
                  setImagePreview(null);
                });
              return false;
            }}
            onRemove={() => {
              form.setFieldsValue({ thumbnail: null });
              setImagePreview(null);
            }}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                style={{ maxHeight: "150px" }}
              />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for image uploads (PNG, JPG, JPEG)
                </p>
              </>
            )}
          </Upload.Dragger>
        </Form.Item>
      ) : (
        <Form.Item
          name="youtubeUrl"
          label="YouTube URL"
          rules={[
            {
              validator: async (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const youtubeRegex =
                  /^(https?:\/\/)?(www\.)?(youtube\.com\/(embed\/|watch\?v=)|youtu\.be\/)[\w-]+/;
                if (!youtubeRegex.test(value)) {
                  return Promise.reject(
                    new Error("Please enter a valid YouTube URL")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            onChange={() => {
              form.setFieldsValue({ thumbnail: null });
            }}
          />
        </Form.Item>
      )}

      <Form.Item name="thumbnail" hidden>
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
        <Space>
          <Button
            type="default"
            htmlType="submit"
            loading={saving}
            style={{
              backgroundColor: theme.kleinBlue,
              borderColor: theme.kleinBlue,
              color: "#fff",
            }}
          >
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
          {mode === "create" && (
            <Button onClick={() => form.resetFields()}>Reset</Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default HostListingForm;
