import { useState } from "react";
import {
  Input,
  Button,
  InputNumber,
  DatePicker,
  Select,
  Form,
  Card,
  Modal,
  Flex,
  Typography,
  Row,
  Col,
} from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import "./SearchBar.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const SearchBar = ({ onSearch, onClear }) => {
  const [form] = Form.useForm();

  // State for all search criteria
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [bedroomRange, setBedroomRange] = useState([null, null]);
  const [priceRange, setPriceRange] = useState([null, null]);
  const [sortBy, setSortBy] = useState("alpha_asc");

  // State for modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  const triggerSearch = () => {
    onSearch({
      searchText,
      minBeds: bedroomRange[0],
      maxBeds: bedroomRange[1],
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      startDate: dateRange && dateRange[0] ? dateRange[0].toISOString() : null,
      endDate: dateRange && dateRange[1] ? dateRange[1].toISOString() : null,
      sortBy,
    });
  };

  const handleApplyFilters = () => {
    triggerSearch();
    setIsModalVisible(false);
  };

  const handleClearAll = () => {
    form.resetFields();
    setSearchText("");
    setBedroomRange([null, null]);
    setPriceRange([null, null]);
    setDateRange([null, null]);
    setSortBy("alpha_asc");
    if (onClear) {
      onClear();
    }
  };

  const handleClearModalFilters = () => {
    setBedroomRange([null, null]);
    setPriceRange([null, null]);
    setSortBy("alpha_asc");
    // We also need to reset the form fields for InputNumber as they are controlled by state
    form.setFieldsValue({
      minBeds: null,
      maxBeds: null,
      minPrice: null,
      maxPrice: null,
    });
  };

  return (
    <>
      <Card className="search-card">
        <Flex
          className="search-card__form"
          gap="middle"
          align="center"
          wrap="wrap"
        >
          <div className="search-card__field search-card__field--grow">
            <span className="search-card__label">Destination</span>
            <Input
              placeholder="Search by title or city"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-card__input"
            />
          </div>

          <div className="search-card__divider" />

          <div className="search-card__field">
            <span className="search-card__label">Dates</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [null, null])}
              className="search-card__date"
              allowEmpty={[true, true]}
            />
          </div>

          <Flex gap="small" align="center" className="search-card__actions">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="search-card__filter-btn"
              size="large"
            >
              Filters
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={triggerSearch}
              className="search-card__search-btn"
              size="large"
            >
              Search
            </Button>
            <Button
              type="link"
              className="search-card__clear-btn"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </Flex>
        </Flex>
      </Card>

     
    </>
  );
};

export default SearchBar;
