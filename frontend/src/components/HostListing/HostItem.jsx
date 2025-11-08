import { Card, Tag, Flex, Rate, Typography, Button } from "antd";
import {
  DollarOutlined,
  StarOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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

const HostItem = ({ listing }) => {
  const { title, price, thumbnail, reviews, metadata } = listing;

  const theme = {
    tiffanyBlue: "#81D8D0",
    marsGreen: "#2D5F5D",
    lightTiffany: "#B3E5E0",
    darkMars: "#1A3635",
    sunblownYellow: "#FFBE7B",
  };

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
              {metadata?.bedrooms || 0} Beds · {metadata?.bathrooms || 0} Baths
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

        <Flex gap="small" style={{ marginTop: "8px" }}>
          <Button 
            icon={<EditOutlined />}
            style={{ 
              flex: 1,
              borderColor: theme.tiffanyBlue,
              color: theme.marsGreen,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.marsGreen;
              e.currentTarget.style.backgroundColor = theme.lightTiffany;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.tiffanyBlue;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />}
            danger
            style={{ 
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff4d4f';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#ff4d4f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ff4d4f';
              e.currentTarget.style.borderColor = '#ff4d4f';
            }}
          >
            Delete
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
export default HostItem;
