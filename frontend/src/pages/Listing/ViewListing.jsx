import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Layout,
  Typography,
  Button,
  message,
  Spin,
  Flex,
  Card,
  Tag,
  Image,
  Rate,
  List,
  Divider,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  StarFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { getListing } from "../../services/listingManageService";
import { getBookings } from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import { theme } from "../../utils/utils";
import LogoutBtn from "../../components/LogoutBtn";
import bedroomIcon from "../../assets/bedroom.svg";
import bedIcon from "../../assets/bed.svg";
import bathroomIcon from "../../assets/bathroom.svg";
import "./ViewListing.scss";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ListingView = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatuses, setBookingStatuses] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const isLoggedIn = Boolean(token) || isAuthenticated;
  const userEmail = user?.email || "";
  const searchContext = location.state?.searchCriteria;

  const fetchListingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getListing(listingId);
      setListing(response.listing);
    } catch (error) {
      console.error("Error fetching listing details:", error);
      message.error("Unable to load listing details");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  const fetchUserBookings = useCallback(async () => {
    if (!isLoggedIn || !userEmail) {
      setBookingStatuses([]);
      return;
    }

    try {
      setBookingsLoading(true);
      const response = await getBookings();
      const relevant = (response.bookings || []).filter(
        (booking) =>
          booking.owner === userEmail &&
          String(booking.listingId) === String(listingId)
      );
      setBookingStatuses(relevant);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Unable to load your booking status");
    } finally {
      setBookingsLoading(false);
    }
  }, [isLoggedIn, userEmail, listingId]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  const normalizeYouTubeUrl = (url) => {
    if (
      !url ||
      typeof url !== "string" ||
      (!url.includes("youtube.com") && !url.includes("youtu.be"))
    ) {
      return url;
    }
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  const mediaItems = useMemo(() => {
    if (!listing) return [];
    const propertyImages = listing.metadata?.property_images || [];
    const allMedia = [listing.thumbnail, ...propertyImages].filter(Boolean);

    return allMedia.map((item) => {
      const value = typeof item === "string" ? item : "";
      if (value.includes("youtube.com") || value.includes("youtu.be")) {
        return { type: "video", src: normalizeYouTubeUrl(value) };
      }
      return { type: "image", src: value };
    });
  }, [listing]);

  const amenities = useMemo(() => {
    if (!listing?.metadata?.amenities) return [];
    if (Array.isArray(listing.metadata.amenities)) {
      return listing.metadata.amenities.filter(Boolean);
    }
    if (typeof listing.metadata.amenities === "string") {
      return listing.metadata.amenities
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }, [listing]);

  const reviews = listing?.reviews || [];
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    return total / reviews.length;
  }, [reviews]);

  const metadata = listing?.metadata || {};
  const bedroomCount = useMemo(() => {
    if (Array.isArray(metadata.bedrooms)) {
      return metadata.bedrooms.length;
    }
    if (typeof metadata.bedrooms === "number") {
      return metadata.bedrooms;
    }
    return 0;
  }, [metadata]);

  let derivedBedCount = 0;
  if (Array.isArray(metadata.bedrooms)) {
    derivedBedCount = metadata.bedrooms.reduce(
      (acc, room) => acc + (room?.single || 0) + (room?.double || 0),
      0
    );
  }
  const bedCount = metadata.beds ?? derivedBedCount;

  const bathrooms = metadata.bathrooms ?? 0;

  const hasSearchDates =
    searchContext?.startDate && searchContext?.endDate
      ? dayjs(searchContext.endDate).isAfter(dayjs(searchContext.startDate))
      : false;

  let nightsDifference = 0;
  if (hasSearchDates) {
    nightsDifference = dayjs(searchContext.endDate).diff(
      dayjs(searchContext.startDate),
      "day"
    );
  }
  const nights = hasSearchDates ? Math.max(1, nightsDifference) : 0;

  const nightlyPrice = Number(listing?.price) || 0;
  const stayPrice = hasSearchDates ? nightlyPrice * nights : nightlyPrice;
  const priceLabel = hasSearchDates ? "Price per stay" : "Price per night";

  const renderBookingDateRange = (booking) => {
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

    if (start && end) {
      return `${dayjs(start).format("MMM D, YYYY")} - ${dayjs(end).format(
        "MMM D, YYYY"
      )}`;
    }
    return "Dates unavailable";
  };

  const renderPriceBreakdown = () => {
    if (!hasSearchDates) {
      return "Includes nightly rate, taxes, and service fees";
    }

    return `${nights} ${
      nights === 1 ? "night" : "nights"
    } @ $${nightlyPrice.toLocaleString()} per night`;
  };

  const getBookingStatusColor = (status) => {
    if (status === "accepted") {
      return "green";
    }
    if (status === "pending") {
      return "orange";
    }
    return "red";
  };

  return (
    <Layout className="host-layout listing-view">
      <Header className="host-header listing-view__header">
        <div className="host-header__left">
          <Title level={3} className="host-header__title">
            AirBrB
          </Title>
        </div>
        <Flex className="host-header__right" gap="small">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <LogoutBtn />
        </Flex>
      </Header>
      <Content className="host-content">
        <div className="host-content__wrapper">
          {loading ? (
            <div className="listing-view__loading">
              <Spin size="large" />
            </div>
          ) : !listing ? (
            <Empty description="Listing not found." />
          ) : (
            <div className="listing-view__content">
              <Card className="listing-view__summary" bordered={false}>
                <Flex justify="space-between" align="flex-start" wrap="wrap">
                  <div>
                    <Tag color="cyan" style={{ marginBottom: 12 }}>
                      {metadata.property_type || "Property"}
                    </Tag>
                    <Title level={2} style={{ marginBottom: 8 }}>
                      {listing.title}
                    </Title>
                    <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                      <EnvironmentOutlined
                        style={{ color: theme.tiffanyBlue }}
                      />
                      <Text type="secondary">
                        {listing.address || "Address unavailable"}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={6}>
                      <Rate allowHalf disabled value={averageRating} />
                      <Text strong>
                        {averageRating.toFixed(1)} · {reviews.length} review
                        {reviews.length === 1 ? "" : "s"}
                      </Text>
                    </Flex>
                  </div>
                  <div className="listing-view__price">
                    <Text type="secondary">{priceLabel}</Text>
                    <Title
                      level={3}
                      style={{ color: theme.marsGreen, margin: 0 }}
                    >
                      ${stayPrice.toLocaleString()}
                    </Title>
                    <Text type="secondary">{renderPriceBreakdown()}</Text>
                  </div>
                </Flex>
                <Divider className="listing-view__divider" />
                <Flex
                  className="listing-view__stats-bar"
                  gap="large"
                  wrap="wrap"
                >
                  <div className="listing-view__stats-pill">
                    <img
                      src={bedroomIcon}
                      alt="Bedrooms"
                      className="listing-view__stats-pill-icon"
                    />
                    <div>
                      <Text strong>{bedroomCount}</Text>
                      <Text type="secondary">Bedrooms</Text>
                    </div>
                  </div>
                  <div className="listing-view__stats-pill">
                    <img
                      src={bedIcon}
                      alt="Beds"
                      className="listing-view__stats-pill-icon"
                    />
                    <div>
                      <Text strong>{bedCount}</Text>
                      <Text type="secondary">Beds</Text>
                    </div>
                  </div>
                  <div className="listing-view__stats-pill">
                    <img
                      src={bathroomIcon}
                      alt="Bathrooms"
                      className="listing-view__stats-pill-icon"
                    />
                    <div>
                      <Text strong>{bathrooms}</Text>
                      <Text type="secondary">Bathrooms</Text>
                    </div>
                  </div>
                  {hasSearchDates && (
                    <div className="listing-view__stats-pill">
                      <CalendarOutlined />
                      <div>
                        <Text strong>{nights}</Text>
                        <Text type="secondary">Night stay</Text>
                      </div>
                    </div>
                  )}
                </Flex>
              </Card>

              {mediaItems.length > 0 && (
                <Card className="listing-view__media" bordered={false}>
                  <div className="listing-view__media-grid">
                    {mediaItems.map((media, index) => (
                      <div
                        key={`${media.src}-${index}`}
                        className={`listing-view__media-item listing-view__media-item--${index}`}
                      >
                        {media.type === "video" ? (
                          <div className="listing-view__media-video">
                            <iframe
                              src={media.src}
                              title={`${listing.title}-video-${index + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <Image
                            src={media.src}
                            alt={`${listing.title}-image-${index + 1}`}
                            className="listing-view__media-image"
                            height="100%"
                            width="100%"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

             
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ListingView;
