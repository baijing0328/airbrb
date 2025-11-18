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
      <Modal
        title="More Filters"
        className="search-filter-modal"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="clear" onClick={handleClearModalFilters}>
            Clear Filters
          </Button>,
          <Button key="submit" type="primary" onClick={handleApplyFilters}>
            Apply Filters
          </Button>,
        ]}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          className="search-filter-modal__form"
        >
          <div className="search-filter-modal__section">
            <Title level={5}>Bedrooms</Title>
            <p>Filter by the number of bedrooms.</p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="minBeds">
                  <InputNumber
                    placeholder="Min"
                    value={bedroomRange[0]}
                    min={0}
                    onChange={(value) =>
                      setBedroomRange([value, bedroomRange[1]])
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxBeds">
                  <InputNumber
                    placeholder="Max"
                    value={bedroomRange[1]}
                    min={bedroomRange[0] || 0}
                    onChange={(value) =>
                      setBedroomRange([bedroomRange[0], value])
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="search-filter-modal__section">
            <Title level={5}>Price</Title>
            <p>Filter by the price per night.</p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="minPrice">
                  <InputNumber
                    placeholder="Min"
                    value={priceRange[0]}
                    min={0}
                    onChange={(value) => setPriceRange([value, priceRange[1]])}
                    addonBefore="$"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxPrice">
                  <InputNumber
                    placeholder="Max"
                    value={priceRange[1]}
                    min={priceRange[0] || 0}
                    onChange={(value) => setPriceRange([priceRange[0], value])}
                    addonBefore="$"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="search-filter-modal__section">
            <Title level={5}>Sort By</Title>
            <p>Sort the results based on your preference.</p>
            <Form.Item>
              <Select value={sortBy} onChange={(value) => setSortBy(value)}>
                <Option value="alpha_asc">Alphabetical (A-Z)</Option>
                <Option value="beds_asc">Bedrooms (Low to High)</Option>
                <Option value="beds_desc">Bedrooms (High to Low)</Option>
                <Option value="price_asc">Price (Low to High)</Option>
                <Option value="price_desc">Price (High to Low)</Option>
                <Option value="rating_asc">Rating (Low to High)</Option>
                <Option value="rating_desc">Rating (High to Low)</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SearchBar;
