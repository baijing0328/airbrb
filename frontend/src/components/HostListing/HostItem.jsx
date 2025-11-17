import { Card, Tag, Flex, Rate, Typography } from "antd";
import {
  DollarOutlined,
  StarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import EditHostItem from "./EditHostItem";
import DeleteHostItem from "./DeleteHostItem";
import PublishHostItem from "./PublishHostItem";
import { theme } from "../../utils/utils";
const { Meta } = Card;

const renderPropertyType = (metadata) => {
  const colorMap = {
    Apartment: "cyan",
    House: "green",
    Townhouse: "geekblue",
    Land: "gold",
  };
  return (
    <Tag color={colorMap[metadata?.property_type] || "default"}>
      {metadata?.property_type || "N/A"}
    </Tag>
  );
};

const HostItem = ({
  listing,
  listingId,
  onDeleteSuccess,
  onPublishSuccess,
  isPublished,
  showActions = true,
}) => {
  const { title, price, thumbnail, reviews, metadata } = listing;

  // Check if thumbnail is a YouTube embed URL
  const isYouTubeVideo = thumbnail && thumbnail.includes("youtube.com/embed/");

  return (
    <Card
      hoverable
      style={{
        width: 320,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: `0 2px 8px ${theme.tiffanyBlue}40`,
        transition: "all 0.3s ease",
        border: `1px solid ${theme.lightTiffany}`,
      }}
      styles={{
        body: { padding: "16px" },
        cover: { overflow: "hidden", height: "200px" },
      }}
      cover={
        <div
          style={{
            height: "200px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {isYouTubeVideo ? (
            <iframe
              width="100%"
              height="100%"
              src={thumbnail}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: "none",
              }}
            />
          ) : (
            <img
              alt={title}
              src={thumbnail}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          )}
        </div>
      }
    >
      <Meta
        title={
          <Flex justify="space-between" align="center">
            <Typography.Title
              level={5}
              style={{ margin: 0, fontSize: "16px", color: theme.darkMars }}
            >
              {title}
            </Typography.Title>
            {renderPropertyType(metadata)}
          </Flex>
        }
        description={
          <Flex align="center" gap="small" style={{ marginTop: "8px" }}>
            <HomeOutlined style={{ color: theme.marsGreen }} />
            <Typography.Text
              type="secondary"
              style={{ fontSize: "14px", color: theme.marsGreen }}
            >
              {metadata?.beds || 0} Beds · {metadata?.bathrooms || 0} Baths
            </Typography.Text>
          </Flex>
        }
      />

      <Flex vertical gap="middle" style={{ marginTop: "16px" }}>
        <Flex justify="space-between" align="center">
          <Flex align="baseline" gap="4px">
            <DollarOutlined
              style={{ color: theme.tiffanyBlue, fontSize: "18px" }}
            />
            <Typography.Text
              strong
              style={{ fontSize: "20px", color: theme.marsGreen }}
            >
              {price}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "14px", color: theme.marsGreen }}
            >
              / night
            </Typography.Text>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center">
          <Rate
            disabled
            defaultValue={4}
            style={{ fontSize: "16px", color: theme.sunblownYellow }}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: "14px", color: theme.marsGreen }}
          >
            <StarOutlined
              style={{ color: theme.sunblownYellow, marginRight: "4px" }}
            />
            {reviews?.length || 0} reviews
          </Typography.Text>
        </Flex>

        {showActions && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <div style={{ flex: 1 }}>
              <EditHostItem listingId={listingId} />
            </div>
            <div style={{ flex: 1 }}>
              <PublishHostItem
                listingId={listingId}
                isPublished={isPublished}
                onSuccess={onPublishSuccess}
              />
            </div>
            <div style={{ flex: 1 }}>
              <DeleteHostItem listingId={listingId} onSuccess={onDeleteSuccess} />
            </div>
          </div>
        )}
      </Flex>
    </Card>
  );
};
export default HostItem;
