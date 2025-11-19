import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Layout,
  Typography,
  Button,
  message,
  Spin,
  Flex,
  Empty,
  Tag,
} from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "../../components/LogoutBtn";
import HostItem from "../../components/HostListing/HostItem";
import SearchBar from "../../components/AllListing/SearchBar";
import { getListings, getListing } from "../../services/listingManageService";
import { getBookings } from "../../services/bookingService";
import { useAppSelector } from "../../store/hooks";
import { SORT_LABELS } from "../../utils/utils";
import "./Host.scss";
import dayjs from "dayjs";

const { Header, Content } = Layout;
const { Title } = Typography;

const All = () => {
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);
  const isLoggedIn = authState.isAuthenticated;
  const userEmail = authState.user?.email || "";

  const handleToggle = () => {
    navigate("/host");
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBookings, setUserBookings] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(null);

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
  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`, {
      state: searchCriteria ? { searchCriteria } : undefined,
    });
  };

  const activeFilters = useMemo(() => {
    if (!searchCriteria) {
      return [];
    }

    const summary = [];
    const {
      searchText,
      minBeds,
      maxBeds,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      sortBy,
    } = searchCriteria;

    if (searchText) {
      summary.push(`Keyword: "${searchText}"`);
    }

    if (minBeds !== null || maxBeds !== null) {
      const min = minBeds ?? 0;
      const max = maxBeds ?? "∞";
      summary.push(`Bedrooms: ${min}-${max}`);
    }

    if (minPrice !== null || maxPrice !== null) {
      const min = minPrice !== null ? `$${minPrice}` : "$0";
      const max = maxPrice !== null ? `$${maxPrice}` : "∞";
      summary.push(`Price: ${min} - ${max}`);
    }

    if (startDate && endDate) {
      summary.push(
        `Dates: ${dayjs(startDate).format("MMM D")} - ${dayjs(endDate).format(
          "MMM D"
        )}`
      );
    }

    if (sortBy) {
      if (SORT_LABELS[sortBy]) {
        summary.push(`Sort: ${SORT_LABELS[sortBy]}`);
      }
    }

    return summary;
  }, [searchCriteria]);

  const sortedListings = useMemo(() => {
    let filteredListings = [...listings];

    if (searchCriteria) {
      // Apply search text filter
      if (searchCriteria.searchText) {
        const searchText = searchCriteria.searchText.toLowerCase();
        filteredListings = filteredListings.filter((l) => {
          const title = l.details?.title?.toLowerCase() || "";
          
          let addressStr = "";
          const address = l.details?.address;
          
          if (typeof address === 'string') {
            addressStr = address.toLowerCase();
          } else if (typeof address === 'object' && address !== null) {
            // Handle case where address might be an object
            const parts = [
              address.street, 
              address.city, 
              address.state, 
              address.postcode, 
              address.country
            ].filter(Boolean);
            addressStr = parts.join(" ").toLowerCase();
          }

          return title.includes(searchText) || addressStr.includes(searchText);
        });
      }

      // Apply bedroom filter
      const { minBeds, maxBeds } = searchCriteria;
      if (minBeds !== null || maxBeds !== null) {
        filteredListings = filteredListings.filter((l) => {
          const numBeds = l.details?.metadata?.bedrooms || 0;
          const min = minBeds === null ? 0 : minBeds;
          const max = maxBeds === null ? Infinity : maxBeds;
          return numBeds >= min && numBeds <= max;
        });
      }

      // Apply price filter
      const { minPrice, maxPrice } = searchCriteria;
      if (minPrice !== null || maxPrice !== null) {
        filteredListings = filteredListings.filter((l) => {
          const price = l.details?.price || 0;
          const min = minPrice === null ? 0 : minPrice;
          const max = maxPrice === null ? Infinity : maxPrice;
          return price >= min && price <= max;
        });
      }

      // Date range filter
      const { startDate, endDate } = searchCriteria;
      if (startDate && endDate) {
        const userStart = new Date(startDate);
        const userEnd = new Date(endDate);

        filteredListings = filteredListings.filter((l) => {
          const availability = l.details?.availability;
          if (!availability || availability.length === 0) {
            return false;
          }
          return availability.some((range) => {
            const availableStart = new Date(range.start);
            const availableEnd = new Date(range.end);
            return userStart >= availableStart && userEnd <= availableEnd;
          });
        });
      }
    }

    if (!filteredListings.length) {
      return [];
    }

    // Sorting logic
    const alphaSort = (arr) =>
      [...arr].sort((a, b) =>
        (a.details?.title || "").localeCompare(b.details?.title || "")
      );

    if (searchCriteria && searchCriteria.sortBy) {
      const { sortBy } = searchCriteria;
      const getAvgRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return total / reviews.length;
      };

      filteredListings.sort((a, b) => {
        const aDetails = a.details;
        const bDetails = b.details;
        switch (sortBy) {
        case "beds_asc":
          return (
            (aDetails?.metadata?.bedrooms || 0) -
            (bDetails?.metadata?.bedrooms || 0)
          );
        case "beds_desc":
          return (
            (bDetails?.metadata?.bedrooms || 0) -
            (aDetails?.metadata?.bedrooms || 0)
          );
        case "price_asc":
          return (aDetails?.price || 0) - (bDetails?.price || 0);
        case "price_desc":
          return (bDetails?.price || 0) - (aDetails?.price || 0);
        case "rating_asc":
          return (
            getAvgRating(aDetails?.reviews) - getAvgRating(bDetails?.reviews)
          );
        case "rating_desc":
          return (
            getAvgRating(bDetails?.reviews) - getAvgRating(aDetails?.reviews)
          );
        case "alpha_asc":
        default:
          return (aDetails?.title || "").localeCompare(bDetails?.title || "");
        }
      });
    } else {
      // Default sort (prioritize bookings)
      if (!isLoggedIn || userBookings.length === 0) {
        return alphaSort(filteredListings);
      }

      const prioritizedIds = new Set(
        userBookings.map((booking) => String(booking.listingId))
      );

      const bookingsFirst = [];
      const remaining = [];

      filteredListings.forEach((listing) => {
        if (prioritizedIds.has(String(listing.id))) {
          bookingsFirst.push(listing);
        } else {
          remaining.push(listing);
        }
      });

      return [...alphaSort(bookingsFirst), ...alphaSort(remaining)];
    }

    return filteredListings;
  }, [listings, userBookings, isLoggedIn, searchCriteria]);

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
          <SearchBar
            onSearch={setSearchCriteria}
            onClear={() => setSearchCriteria(null)}
          />
          {activeFilters.length > 0 && (
            <div
              style={{
                marginBottom: "24px",
                padding: "12px 20px",
                borderRadius: "16px",
                border: "1px solid rgba(129, 216, 208, 0.4)",
                background: "rgba(179, 229, 224, 0.25)",
              }}
            >
              <Typography.Text strong style={{ color: "#2D5F5D" }}>
                Active filters:
              </Typography.Text>
              <Flex gap="small" wrap="wrap" style={{ marginTop: "8px" }}>
                {activeFilters.map((item) => (
                  <Tag
                    key={item}
                    color="geekblue"
                    style={{ borderRadius: "999px", padding: "4px 12px" }}
                  >
                    {item}
                  </Tag>
                ))}
              </Flex>
            </div>
          )}
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
                    publishDate={listing.details.postedOn}
                    onCardClick={() => handleListingClick(listing.id)}
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
