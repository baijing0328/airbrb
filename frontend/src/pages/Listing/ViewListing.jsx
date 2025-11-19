import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  DatePicker,
  Tooltip,
  Modal,
  Progress,
  Select,
  Input,
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
import {
  getListing,
  putListingReview,
} from "../../services/listingManageService";
import { getBookings, newBooking } from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import { theme } from "../../utils/utils";
import LogoutBtn from "../../components/LogoutBtn";
import bedroomIcon from "../../assets/bedroom.svg";
import bedIcon from "../../assets/bed.svg";
import bathroomIcon from "../../assets/bathroom.svg";
import "./ViewListing.scss";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const ListingView = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatuses, setBookingStatuses] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingRange, setBookingRange] = useState([null, null]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const bookingsSectionRef = useRef(null);
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const isLoggedIn = Boolean(token) || isAuthenticated;
  const userEmail = user?.email || "";
  const searchContext = location.state?.searchCriteria;

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = listing?.reviews?.length || 0;

    if (total === 0) return []; // Return empty array if no reviews

    listing.reviews.forEach((review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating] = (distribution[rating] || 0) + 1;
      }
    });

    // Convert to array properly
    return Object.keys(distribution).map((key) => {
      const stars = Number(key);
      const count = distribution[stars];
      return {
        stars,
        count,
        percent: (count / total) * 100,
      };
    });
  }, [listing?.reviews]);

  const filteredReviews = useMemo(() => {
    if (!selectedRatingFilter || !listing?.reviews) return [];
    return listing.reviews.filter(
      (review) => Math.round(review.rating) === selectedRatingFilter
    );
  }, [selectedRatingFilter, listing?.reviews]);

  const renderRatingTooltip = () => {
    if (!Array.isArray(ratingDistribution) || ratingDistribution.length === 0)
      return null;

    // Create a copy before sorting
    const sortedDistribution = [...ratingDistribution].sort(
      (a, b) => b.stars - a.stars
    );

    return (
      <div className="rating-breakdown-container">
        <Title level={5} style={{ color: theme.darkMars, marginBottom: 12 }}>
          Rating Breakdown
        </Title>
        {sortedDistribution.map(({ stars, count, percent }) => (
          <Flex
            key={stars}
            align="center"
            gap={6}
            className="rating-breakdown-row"
            style={{ marginBottom: 4, cursor: "pointer", width: "100%" }}
            onClick={() => {
              setSelectedRatingFilter(stars);
              setRatingModalOpen(true);
            }}
          >
            <Text className="rating-label">
              {stars} stars
            </Text>
            <Progress
              percent={percent}
              showInfo={false}
              strokeColor={theme.sunblownYellow}
              trailColor={`${theme.lightTiffany}80`}
              className="rating-progress"
            />
            <Text className="rating-count">
              {count} ({Math.round(percent)}%)
            </Text>
          </Flex>
        ))}
      </div>
    );
  };

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
      const accepted = relevant.filter(
        (booking) => booking.status === "accepted"
      );
      if (accepted.length > 0 && !selectedBookingId) {
        setSelectedBookingId(String(accepted[0].id));
      }
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
  const availabilityRanges = useMemo(() => {
    if (!listing?.availability || listing.availability.length === 0) {
      return [];
    }
    return listing.availability
      .filter((slot) => slot.start && slot.end)
      .map((slot) => ({
        start: dayjs(slot.start).startOf("day"),
        end: dayjs(slot.end).startOf("day"),
      }));
  }, [listing]);
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

  const bookingSelection = useMemo(() => {
    if (!bookingRange[0] || !bookingRange[1]) {
      return { nights: 0, total: 0 };
    }
    const diff = bookingRange[1].diff(bookingRange[0], "day");
    const nightsCount = Math.max(1, diff);
    return {
      nights: nightsCount,
      total: nightsCount * nightlyPrice,
    };
  }, [bookingRange, nightlyPrice]);

  const bookingSelectionLabel = useMemo(() => {
    if (bookingSelection.nights > 0) {
      const unit = bookingSelection.nights === 1 ? "night" : "nights";
      return `${bookingSelection.nights} ${unit} selected`;
    }
    return "Select dates to see total";
  }, [bookingSelection.nights]);

  const acceptedBookings = useMemo(
    () => bookingStatuses.filter((booking) => booking.status === "accepted"),
    [bookingStatuses]
  );

  const isDateWithinAvailability = (date) =>
    availabilityRanges.some(
      (range) =>
        date.isSame(range.start, "day") ||
        date.isSame(range.end, "day") ||
        (date.isAfter(range.start, "day") && date.isBefore(range.end, "day"))
    );

  const isRangeWithinAvailability = (start, end) =>
    availabilityRanges.some(
      (range) =>
        start.isSameOrAfter(range.start, "day") &&
        end.isSameOrBefore(range.end, "day")
    );

  const disabledBookingDate = (current) => {
    if (!availabilityRanges.length || !current) {
      return false;
    }
    return !isDateWithinAvailability(current);
  };

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

  const handleBookingSubmit = async () => {
    if (!isLoggedIn) {
      message.warning("Please log in to make a booking.");
      return;
    }
    if (!bookingRange[0] || !bookingRange[1]) {
      message.warning("Please select a start and end date.");
      return;
    }
    const [start, end] = bookingRange;
    const bookingStart = start.startOf("day");
    const bookingEnd = end.startOf("day");

    const fitsAvailability = isRangeWithinAvailability(
      bookingStart,
      bookingEnd
    );

    if (!fitsAvailability) {
      message.error("Selected dates are not available for this listing.");
      return;
    }

    const totalPrice =
      bookingSelection.total || bookingSelection.nights * nightlyPrice;

    try {
      setBookingSubmitting(true);
      await newBooking(listingId, {
        dateRange: {
          start: bookingStart.toISOString(),
          end: bookingEnd.toISOString(),
        },
        totalPrice,
      });
      message.success("Booking request submitted!");
      setBookingRange([null, null]);
      fetchUserBookings();
      fetchListingDetails();
    } catch (error) {
      console.error("Booking failed:", error);
      message.error("Unable to create booking. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) {
      message.warning("Please log in to leave a review.");
      return;
    }
    if (!selectedBookingId) {
      message.warning("Select a booking to attach your review.");
      return;
    }
    if (reviewRating <= 0) {
      message.warning("Please provide a rating.");
      return;
    }
    try {
      setReviewSubmitting(true);
      await putListingReview(listingId, selectedBookingId, {
        rating: reviewRating,
        comment: reviewComment,
      });
      message.success("Review posted!");
      setReviewRating(0);
      setReviewComment("");
      fetchListingDetails();
    } catch (error) {
      console.error("Error posting review:", error);
      message.error("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleScrollToBookings = () => {
    bookingsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        <Modal
          title={`${selectedRatingFilter} Star Reviews`}
          open={ratingModalOpen}
          onCancel={() => setRatingModalOpen(false)}
          footer={null}
          width={600}
          className="listing-view__modal"
          wrapClassName="listing-view__modal-wrap"
        >
          <List
            itemLayout="vertical"
            dataSource={filteredReviews}
            renderItem={(review, index) => (
              <List.Item
                key={review.id || index}
                className="review-modal__item"
              >
                <Flex justify="space-between" align="center">
                  <Text strong>{review.reviewer || "Guest"}</Text>
                  <Flex align="center" gap={4}>
                    <StarFilled style={{ color: theme.sunblownYellow }} />
                    <Text>{review.rating}</Text>
                  </Flex>
                </Flex>
                <Paragraph style={{ marginTop: 8 }}>
                  {review.comment || review.text || "No comment provided."}
                </Paragraph>
                {review.createdAt && (
                  <Text type="secondary">
                    Stayed {dayjs(review.createdAt).format("MMM YYYY")}
                  </Text>
                )}
              </List.Item>
            )}
          />
        </Modal>
        <div className="host-content__wrapper">
          {loading ? (
            <div className="listing-view__loading">
              <Spin size="large" />
            </div>
          ) : !listing ? (
            <Empty description="Listing not found." />
          ) : (
            <div className="listing-view__content">
              <Card className="listing-view__summary" variant="borderless">
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
                        {typeof listing.address === "object" && listing.address !== null
                          ? listing.address.formatted
                          : listing.address || "Address unavailable"}
                      </Text>
                    </Flex>
                    <Tooltip
                      title={renderRatingTooltip()}
                      placement="bottomLeft"
                      overlayClassName="listing-view__tooltip"
                    >
                      <Flex
                        align="center"
                        gap={6}
                        style={{ cursor: "pointer", width: "fit-content" }}
                      >
                        <Rate allowHalf disabled value={averageRating} />
                        <Text strong>
                          {averageRating.toFixed(1)} · {reviews.length} review
                          {reviews.length === 1 ? "" : "s"}
                        </Text>
                      </Flex>
                    </Tooltip>
                  </div>
                  <div className="listing-view__price">
                    <div className="listing-view__price-info">
                      <Text type="secondary">{priceLabel}</Text>
                      <Title
                        level={3}
                        style={{ color: theme.marsGreen, margin: 0 }}
                      >
                        ${stayPrice.toLocaleString()}
                      </Title>
                      <Text type="secondary">{renderPriceBreakdown()}</Text>
                    </div>
                    <Button
                      className="listing-view__bookings-btn"
                      icon={<CalendarOutlined />}
                      onClick={handleScrollToBookings}
                    >
                      My bookings
                    </Button>
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
                <Card className="listing-view__media" variant="borderless">
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
              <Card
                className="listing-view__card listing-view__card--glass listing-view__booking-form"
                title="Book this stay"
                variant="borderless"
              >
                {isLoggedIn ? (
                  <Flex vertical gap="large">
                    <div>
                      <Text strong>Select your dates</Text>
                      <RangePicker
                        value={bookingRange}
                        onChange={(dates) =>
                          setBookingRange(dates || [null, null])
                        }
                        style={{ width: "100%", marginTop: 8 }}
                        disabledDate={disabledBookingDate}
                      />
                    </div>
                    <Flex justify="space-between" align="center" wrap="wrap">
                      <div>
                        <Text type="secondary">{bookingSelectionLabel}</Text>
                        {bookingSelection.total > 0 && (
                          <Title
                            level={4}
                            style={{ margin: 0, color: theme.marsGreen }}
                          >
                            ${bookingSelection.total.toLocaleString()}
                          </Title>
                        )}
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleBookingSubmit}
                        loading={bookingSubmitting}
                      >
                        Request booking
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <Text type="secondary">
                    Log in to select dates and request a booking.
                  </Text>
                )}
              </Card>
              {isLoggedIn && (
                <Card
                  className="listing-view__card listing-view__card--glass listing-view__review-form"
                  title="Leave a review"
                  variant="borderless"
                >
                  {acceptedBookings.length === 0 ? (
                    <Text type="secondary">
                      You need at least one accepted booking before leaving a
                      review.
                    </Text>
                  ) : (
                    <Flex vertical gap="large">
                      <div>
                        <Text strong>Select booking</Text>
                        <Select
                          value={selectedBookingId}
                          onChange={(value) => setSelectedBookingId(value)}
                          style={{ marginTop: 8, width: "100%" }}
                          options={acceptedBookings.map((booking) => ({
                            value: String(booking.id),
                            label: `Booking #${
                              booking.id
                            } · ${renderBookingDateRange(booking)}`,
                          }))}
                        />
                      </div>
                      <div>
                        <Text strong>Rating</Text>
                        <Rate
                          value={reviewRating}
                          onChange={(value) => setReviewRating(value)}
                          style={{ display: "block", marginTop: 8 }}
                        />
                      </div>
                      <div>
                        <Text strong>Comment</Text>
                        <Input.TextArea
                          rows={4}
                          placeholder="Share your experience..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{ marginTop: 8 }}
                        />
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        disabled={reviewRating <= 0}
                        loading={reviewSubmitting}
                        onClick={handleReviewSubmit}
                      >
                        Submit review
                      </Button>
                    </Flex>
                  )}
                </Card>
              )}
              <Flex gap="large" wrap="wrap">
                <Card
                  className="listing-view__card listing-view__card--glass"
                  title="Quick facts"
                  variant="borderless"
                >
                  <Flex gap={24} wrap="wrap">
                    <div className="listing-view__stat">
                      <img
                        src={bedroomIcon}
                        alt="Bedrooms"
                        className="listing-view__stat-icon"
                      />
                      <Text>{bedroomCount} bedrooms</Text>
                    </div>
                    <div className="listing-view__stat">
                      <img
                        src={bedIcon}
                        alt="Beds"
                        className="listing-view__stat-icon"
                      />
                      <Text>{bedCount} beds</Text>
                    </div>
                    <div className="listing-view__stat">
                      <img
                        src={bathroomIcon}
                        alt="Bathrooms"
                        className="listing-view__stat-icon"
                      />
                      <Text>{bathrooms} bathrooms</Text>
                    </div>
                  </Flex>
                </Card>

                <Card
                  className="listing-view__card listing-view__card--glass"
                  title="Amenities"
                  variant="borderless"
                >
                  {amenities.length ? (
                    <Flex gap="small" wrap="wrap">
                      {amenities.map((amenity) => (
                        <Tag
                          key={amenity}
                          color="geekblue"
                          className="listing-view__amenity"
                        >
                          {amenity}
                        </Tag>
                      ))}
                    </Flex>
                  ) : (
                    <Text type="secondary">No amenities listed.</Text>
                  )}
                </Card>
              </Flex>

              <Card
                className="listing-view__card listing-view__card--glass"
                title="Description"
                variant="borderless"
              >
                <Paragraph>
                  {listing.description ||
                    "This host has not provided a description yet."}
                </Paragraph>
              </Card>

              <Card
                className="listing-view__card listing-view__card--glass listing-view__reviews"
                title="Reviews"
                variant="borderless"
              >
                {reviews.length === 0 ? (
                  <Text type="secondary">No reviews yet.</Text>
                ) : (
                  <List
                    itemLayout="vertical"
                    dataSource={reviews}
                    renderItem={(review, index) => (
                      <List.Item
                        key={review.id || index}
                        className="listing-view__review-item"
                      >
                        <Flex justify="space-between" align="center">
                          <Text strong>{review.reviewer || "Guest"}</Text>
                          <Flex align="center" gap={4}>
                            <StarFilled
                              style={{ color: theme.sunblownYellow }}
                            />
                            <Text>{review.rating || "N/A"}</Text>
                          </Flex>
                        </Flex>
                        <Paragraph style={{ marginTop: 8 }}>
                          {review.comment ||
                            review.text ||
                            "No comment provided."}
                        </Paragraph>
                        {review.createdAt && (
                          <Text type="secondary">
                            Stayed {dayjs(review.createdAt).format("MMM YYYY")}
                          </Text>
                        )}
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              <div ref={bookingsSectionRef}>
                <Card
                  className="listing-view__card listing-view__card--glass listing-view__bookings"
                  title="Your bookings for this listing"
                  variant="borderless"
                  extra={
                    <Flex align="center" gap={6}>
                      <CalendarOutlined />
                      <Text type="secondary">
                        {bookingStatuses.length} booking
                        {bookingStatuses.length === 1 ? "" : "s"}
                      </Text>
                    </Flex>
                  }
                >
                  {bookingsLoading ? (
                    <Spin />
                  ) : !isLoggedIn ? (
                    <Text type="secondary">
                      Log in to see the status of your bookings.
                    </Text>
                  ) : bookingStatuses.length === 0 ? (
                    <Text type="secondary">
                      You have no bookings for this listing yet.
                    </Text>
                  ) : (
                    <List
                      dataSource={bookingStatuses}
                      renderItem={(booking) => (
                        <List.Item
                          key={booking.id}
                          className="listing-view__booking-item"
                        >
                          <div className="booking-item__header">
                            <div className="booking-item__status">
                              <Text strong>Status</Text>
                              <Tag
                                color={getBookingStatusColor(booking.status)}
                                className="booking-item__status-tag"
                              >
                                {booking.status || "Unknown"}
                              </Tag>
                            </div>
                            <Text type="secondary">Booking #{booking.id}</Text>
                          </div>
                          <div className="booking-item__body">
                            <div>
                              <Text type="secondary">Dates</Text>
                              <Text>{renderBookingDateRange(booking)}</Text>
                            </div>
                            {booking.totalPrice && (
                              <div className="booking-item__price">
                                <Text type="secondary">Total</Text>
                                <Flex align="center" gap={6}>
                                  <DollarOutlined />
                                  <Text>{booking.totalPrice}</Text>
                                </Flex>
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ListingView;
