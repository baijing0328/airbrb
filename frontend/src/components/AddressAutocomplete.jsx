import { useState, useEffect, useRef } from "react";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import axios from "axios";

const AddressAutocomplete = ({ value, onChange, placeholder }) => {
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Geoapify API Key
  const API_KEY = "45ab8189e7044832b4fbad26ecd160bf";

  const fetchAddress = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setOptions([]);
      return;
    }

    setFetching(true);
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: searchText,
            apiKey: API_KEY,
            limit: 5,
          },
        }
      );

      const features = response.data?.features || [];
      const newOptions = features.map((feature) => ({
        label: feature.properties.formatted,
        value: feature.properties.formatted,
      }));

      setOptions(newOptions);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setFetching(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debouncedFetch = useRef(debounce(fetchAddress, 500)).current;

  const handleSearch = (newValue) => {
    setSearchValue(newValue);
    debouncedFetch(newValue);
  };

  const handleChange = (newValue) => {
    setSearchValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    // Update internal search value when external value changes (e.g. loading initial data)
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);

  return (
    <Select
      showSearch
      value={searchValue}
      placeholder={placeholder || "Enter address"}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      style={{ width: "100%" }}
    />
  );
};

export default AddressAutocomplete;

