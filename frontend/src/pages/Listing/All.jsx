import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout, Typography, Button, message, Spin, Flex, Empty } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostListing/HostItem";
import { getListings, getListing } from "../../services/listingManageService";
import { getBookings } from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const All = () => {
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const { user, token, isAuthenticated } = authState;
  const isLoggedIn = Boolean(token) || isAuthenticated;
  const userEmail = user?.email || "";

  const handleToggle = () => {
    navigate("/host");
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState([]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getListings();

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

      const publishedListings = listingsWithDetails.filter(
        (listing) => listing.details?.published
      );
      setListings(publishedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      message.error("Error fetching listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserBookings = useCallback(async () => {
    if (!isLoggedIn || !userEmail) {
      setUserBookings([]);
      return;
    }
    try {
      const response = await getBookings();
      const relevantBookings = (response.bookings || []).filter(
        (booking) =>
          booking.owner === userEmail &&
          (booking.status === "accepted" || booking.status === "pending")
      );
      setUserBookings(relevantBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Error fetching bookings");
    }
  }, [isLoggedIn, userEmail]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const sortedListings = useMemo(() => {
    if (!listings.length) {
      return [];
    }

    const alphaSort = (arr) =>
      [...arr].sort((a, b) =>
        (a.details?.title || "").localeCompare(b.details?.title || "")
      );

    if (!isLoggedIn || userBookings.length === 0) {
      return alphaSort(listings);
    }

    const prioritizedIds = new Set(
      userBookings.map((booking) => String(booking.listingId))
    );

    const bookingsFirst = [];
    const remaining = [];

    listings.forEach((listing) => {
      if (prioritizedIds.has(String(listing.id))) {
        bookingsFirst.push(listing);
      } else {
        remaining.push(listing);
      }
    });

    console.log("listings", listings);
    console.log("bookingsFirst", bookingsFirst);
    console.log("remaining", remaining);

    return [...alphaSort(bookingsFirst), ...alphaSort(remaining)];
  }, [listings, userBookings, isLoggedIn]);

  console.log("sortedListings", listings, sortedListings);

  return (
    <Layout className="host-layout">
      <Header className="host-header">
        <div className="host-header__left">
          <Title level={3} className="host-header__title">
            AirBrB
          </Title>
        </div>
        <div className="host-header__right">
          <Button type="default" icon={<HomeOutlined />} onClick={handleToggle}>
            My Listings
          </Button>
          <LogoutBtn />
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
            </div>
          ) : sortedListings.length === 0 ? (
            <Empty description="No published listings available yet." />
          ) : (
            <Flex gap="middle" wrap="wrap">
              {sortedListings.map((listing) => {
                return (
                  <HostItem
                    key={listing.id}
                    listing={listing.details}
                    listingId={listing.id}
                    onDeleteSuccess={fetchListings}
                    onPublishSuccess={fetchListings}
                    isPublished={listing.details.published || false}
                    showActions={false}
                  />
                );
              })}
            </Flex>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default All;
