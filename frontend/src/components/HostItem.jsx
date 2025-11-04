import { Card, Tag, Flex } from "antd";
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
  console.log(metadata);
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={
        <img
          alt={title}
          src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
        />
      }
    >
      <Meta title={title} description={renderPropertyType(metadata)} />
      <Flex vertical>
        <div>Price: ${price}</div>
        <div>Reviews: {reviews?.length || 0}</div>
      </Flex>
    </Card>
  );
};
export default HostItem;
