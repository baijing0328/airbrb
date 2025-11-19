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
        
      </Content>
    </Layout>
  );
};

export default HostRequests;

