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
        addressData: {
          formatted: feature.properties.formatted,
          street: feature.properties.address_line1,
          city: feature.properties.city,
          suburb: feature.properties.suburb,
          state: feature.properties.state,
          postcode: feature.properties.postcode,
          country: feature.properties.country,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        }
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
    // If user types but doesn't select, we might just track the text. 
    // But Select input display is controlled by 'value' prop usually.
    // We update options based on search.
    debouncedFetch(newValue);
  };

  const handleChange = (newValue, option) => {
    // If option exists, user selected from list -> pass structured data
    // If option is undefined (user cleared input), pass null/string
    if (option && option.addressData) {
        if (onChange) {
            onChange(option.addressData);
        }
    } else {
        // Fallback for manual input or clear
        if (onChange) {
            onChange(newValue);
        }
    }
  };

  useEffect(() => {
    // Update internal search value when external value changes (e.g. loading initial data)
    if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
            setSearchValue(value.formatted || "");
        } else {
            setSearchValue(value);
        }
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

