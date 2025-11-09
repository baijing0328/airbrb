import { useState, useEffect } from "react";
import { Layout, Typography, Button, Flex, Spin } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostListing/HostItem";
import CreateHostForm from "../../components/HostListing/CreateHostForm";
import { getListings, getListing } from "../../services/listingManageService";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const Host = () => {
  const navigate = useNavigate();
  const handleToggle = () => {
    navigate("/all");
  };
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await getListings();
        console.log(0, response);

        // Fetch details for each listing
        const listingsWithDetails = await Promise.all(
          response.listings.map(async (listing) => {
            const details = await getListing(listing.id);
            return {
              id: listing.id,
              details: details.listing,
            };
          })
        );

        setListings(listingsWithDetails);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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
          <CreateHostForm />
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Flex gap="middle" wrap="wrap">
              {listings.map((listing) => {
                return <HostItem key={listing.id} listing={listing.details} />
              })}
            </Flex>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Host;
