import { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Button, Flex, Spin, message, Card } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import LogoutBtn from "../../components/LogoutBtn";
import NotificationMenu from "../../components/NotificationMenu";
import HostItem from "../../components/HostListing/HostItem";
import CreateHostForm from "../../components/HostListing/CreateHostForm";
import ProfitChart from "../../components/ProfitChart";
import { getListings, getListing } from "../../services/listingManageService";
import { getBookings } from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title } = Typography;

const Host = () => {
  const navigate = useNavigate();
  const handleToggle = () => {
    navigate("/all");
  };
  const authState = useAppSelector((state) => state.auth);
  const userEmail = authState?.user?.email || "";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profitData, setProfitData] = useState([]);

  const calculateProfitData = (bookings, ownedListingIds) => {
    const thirtyDaysAgo = dayjs().subtract(30, "day").startOf("day");

    // Initialize a map for daily profits { 'YYYY-MM-DD': profit }
    const dailyProfits = new Map();
    for (let i = 0; i <= 30; i++) {
      const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
      dailyProfits.set(date, 0);
    }

    bookings.forEach((booking) => {
      if (
        ownedListingIds.has(String(booking.listingId)) &&
        booking.status === "accepted"
      ) {
        const bookingStart = dayjs(booking.dateRange.start);
        const bookingEnd = dayjs(booking.dateRange.end);

        if (bookingEnd.isBefore(thirtyDaysAgo)) {
          return;
        }

        const duration = bookingEnd.diff(bookingStart, "day");
        if (duration <= 0) return;

        const dailyRate = booking.totalPrice / duration;

        for (let i = 0; i < duration; i++) {
          const currentDate = bookingStart.add(i, "day");
          if (currentDate.isAfter(thirtyDaysAgo.subtract(1, "day"))) {
            // Include today
            const dateStr = currentDate.format("YYYY-MM-DD");
            if (dailyProfits.has(dateStr)) {
              dailyProfits.set(dateStr, dailyProfits.get(dateStr) + dailyRate);
            }
          }
        }
      }
    });

    const chartData = Array.from(dailyProfits.entries())
      .map(([date, profit]) => ({
        date,
        profit,
      }))
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()); // Sort by date ascending

    setProfitData(chartData);
  };

  const fetchListingsAndBookings = useCallback(async () => {
    if (!userEmail) {
      setListings([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const listingsResponse = await getListings();

      const listingsWithDetails = await Promise.all(
        listingsResponse.listings.map(async (listing) => {
          const details = await getListing(listing.id);
          return {
            id: listing.id,
            details: details.listing,
          };
        })
      );

      const ownedListings = listingsWithDetails.filter(
        (listing) => listing.details?.owner === userEmail
      );
      setListings(ownedListings);

      if (ownedListings.length > 0) {
        const ownedListingIds = new Set(ownedListings.map((l) => String(l.id)));
        const bookingsResponse = await getBookings();
        calculateProfitData(bookingsResponse.bookings, ownedListingIds);
      } else {
        setProfitData([]);
      }
    } catch (error) {
      console.error("Error fetching listings or bookings:", error);
      message.error("Error fetching data for host page");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchListingsAndBookings();
  }, [fetchListingsAndBookings]);

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
          <CreateHostForm onSuccess={fetchListingsAndBookings} />
          <NotificationMenu />
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
            <>
              <Card title="Past 30 Days Profit" style={{ marginBottom: 24 }}>
                <ProfitChart data={profitData} />
              </Card>
              <Flex gap="middle" wrap="wrap">
                {listings.map((listing) => {
                  return (
                    <HostItem
                      key={listing.id}
                      listing={listing.details}
                      listingId={listing.id}
                      onDeleteSuccess={fetchListingsAndBookings}
                      onPublishSuccess={fetchListingsAndBookings}
                      isPublished={listing.details.published || false}
                      publishDate={listing.details.postedOn}
                      onManageBookings={() =>
                        navigate(`/host/requests/${listing.id}`)
                      }
                    />
                  );
                })}
              </Flex>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Host;
