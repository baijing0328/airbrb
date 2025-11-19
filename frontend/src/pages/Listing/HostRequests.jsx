import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Layout,
  Typography,
  Button,
  Card,
  List,
  Tag,
  Space,
  Statistic,
  message,
  Spin,
  Empty,
  Flex,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getListing } from "../../services/listingManageService";
import {
  getBookings,
  acceptBooking,
  declineBooking,
} from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import { theme } from "../../utils/utils";
import "./Host.scss";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const HostRequests = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const currentUserEmail = authState.user?.email;

  const [listing, setListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchListingDetails = useCallback(async () => {
    try {
      setLoadingListing(true);
      const response = await getListing(listingId);
      setListing(response.listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      message.error("Failed to load listing details");
    } finally {
      setLoadingListing(false);
    }
  }, [listingId]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const response = await getBookings();
      const relevant = (response.bookings || []).filter(
        (booking) => String(booking.listingId) === String(listingId)
      );
      setBookings(relevant);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to load booking requests");
    } finally {
      setLoadingBookings(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getBookingRange = (booking) => {
    const start =
      booking.dateRange?.start ||
      booking.start ||
      booking.date?.start ||
      booking.startDate;
    const end =
      booking.dateRange?.end ||
      booking.end ||
      booking.date?.end ||
      booking.endDate;
    return {
      start: start ? dayjs(start) : null,
      end: end ? dayjs(end) : null,
    };
  };

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings]
  );

  const acceptedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "accepted"),
    [bookings]
  );

  const bookingHistory = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aDate = getBookingRange(a).start || dayjs(0);
      const bDate = getBookingRange(b).start || dayjs(0);
      return bDate.valueOf() - aDate.valueOf();
    });
  }, [bookings]);

  const handleBookingAction = async (bookingId, actionType) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      if (actionType === "accept") {
        await acceptBooking(bookingId);
        message.success("Booking accepted");
      } else {
        await declineBooking(bookingId);
        message.success("Booking declined");
      }
      fetchBookings();
    } catch (error) {
      console.error(`Error updating booking (${actionType}):`, error);
      message.error("Action failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const listingOnlineDays = useMemo(() => {
    if (!listing?.postedOn) {
      return null;
    }
    return dayjs().diff(dayjs(listing.postedOn), "day");
  }, [listing?.postedOn]);

  const currentYear = dayjs().year();
  const yearStart = dayjs().startOf("year");
  const yearEnd = dayjs().endOf("year");
  const stats = useMemo(() => {
    let totalDays = 0;
    let totalProfit = 0;

    acceptedBookings.forEach((booking) => {
      const { start, end } = getBookingRange(booking);
      if (!start || !end) return;

      const effectiveStart = start.isBefore(yearStart) ? yearStart : start;
      const effectiveEnd = end.isAfter(yearEnd) ? yearEnd : end;

      if (effectiveEnd.isAfter(effectiveStart)) {
        const nights = effectiveEnd.diff(effectiveStart, "day");
        totalDays += nights;
        totalProfit += booking.totalPrice || 0;
      }
    });

    return {
      totalDaysBooked: totalDays,
      totalProfit,
    };
  }, [acceptedBookings, yearStart, yearEnd]);

  const renderBookingMeta = (booking) => {
    const { start, end } = getBookingRange(booking);
    const nights =
      start && end ? Math.max(end.diff(start, "day"), 1) : undefined;
    return (
      <Space direction="vertical" size={4}>
        <Text>
          <CalendarOutlined style={{ color: theme.tiffanyBlue }} />{" "}
          {start ? start.format("MMM D, YYYY") : "?"} -{" "}
          {end ? end.format("MMM D, YYYY") : "?"}
        </Text>
        <Text type="secondary">
          <ClockCircleOutlined /> {nights || "-"} night
          {nights === 1 ? "" : "s"}
        </Text>
        {booking.totalPrice !== undefined && (
          <Text strong style={{ color: theme.marsGreen }}>
            <DollarOutlined /> ${booking.totalPrice}
          </Text>
        )}
      </Space>
    );
  };

  const renderStatusTag = (status) => {
    if (status === "accepted") {
      return <Tag color="green">Accepted</Tag>;
    }
    if (status === "pending") {
      return <Tag color="orange">Pending</Tag>;
    }
    return <Tag color="red">Declined</Tag>;
  };

  const loading = loadingListing || loadingBookings;

  return (
    <Layout className="host-layout">
      <Header className="host-header">
        <div className="host-header__left">
          <Title level={3} className="host-header__title">
            Booking Requests
          </Title>
        </div>
        <div className="host-header__right">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/host")}
          >
            Back to listings
          </Button>
        </div>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : !listing ? (
            <Empty description="Listing not found" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card>
                <Flex align="center" justify="space-between" wrap="wrap">
                  <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                      {listing.title}
                    </Title>
                    <Text type="secondary">
                      Listing ID: {listingId} · Owner: {listing.owner}
                    </Text>
                  </div>
                  <Space size="large">
                    <Statistic
                      title="Pending requests"
                      value={pendingBookings.length}
                    />
                    <Statistic
                      title={`Booked days (${currentYear})`}
                      value={stats.totalDaysBooked}
                    />
                    <Statistic
                      title={`Profit (${currentYear})`}
                      prefix="$"
                      value={Number(stats.totalProfit.toFixed(2))}
                    />
                    <Statistic
                      title="Online duration"
                      value={
                        listingOnlineDays !== null
                          ? `${listingOnlineDays} days`
                          : "Not published"
                      }
                    />
                  </Space>
                </Flex>
              </Card>

              <Card
                title="Pending Booking Requests"
                extra={
                  <Tag color="orange">{pendingBookings.length} pending</Tag>
                }
              >
                {pendingBookings.length === 0 ? (
                  <Empty description="No pending requests" />
                ) : (
                  <List
                    itemLayout="vertical"
                    dataSource={pendingBookings}
                    renderItem={(booking) => (
                      <List.Item
                        key={booking.id}
                        actions={[
                          <Button
                            key="accept"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() =>
                              handleBookingAction(booking.id, "accept")
                            }
                            loading={actionLoading[booking.id]}
                          >
                            Accept
                          </Button>,
                          <Button
                            key="decline"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() =>
                              handleBookingAction(booking.id, "decline")
                            }
                            loading={actionLoading[booking.id]}
                          >
                            Decline
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space align="center">
                              <Text strong>{booking.owner}</Text>
                              {renderStatusTag(booking.status)}
                            </Space>
                          }
                          description={renderBookingMeta(booking)}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              <Card
                title="Booking History"
                extra={<Tag>{bookingHistory.length} total</Tag>}
              >
                {bookingHistory.length === 0 ? (
                  <Empty description="No booking history" />
                ) : (
                  <List
                    itemLayout="horizontal"
                    dataSource={bookingHistory}
                    renderItem={(booking) => (
                      <List.Item key={booking.id}>
                        <List.Item.Meta
                          title={
                            <Space align="center">
                              <Text strong>Booking #{booking.id}</Text>
                              {renderStatusTag(booking.status)}
                            </Space>
                          }
                          description={
                            <Space direction="vertical">
                              <Text>Guest: {booking.owner}</Text>
                              {renderBookingMeta(booking)}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Space>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default HostRequests;
