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
import { HostListngFormRules, HostListingPromptData } from "../../utils/utils";

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
    
  );
};

export default HostListingForm;
