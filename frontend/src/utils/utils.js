export const theme = {
  tiffanyBlue: "#81D8D0",
  marsGreen: "#2D5F5D",
  lightTiffany: "#B3E5E0",
  darkMars: "#1A3635",
  sunblownYellow: "#FFBE7B",
  kleinBlue: "#002FA7",
};

export const HostListngFormRules = {
  title: [
    {
      required: true,
      message: "Please input the title of host listing!",
    },
  ],
  address: [
    {
      required: true,
      message: "Please input the address of host listing!",
    },
  ],
  price: [
    {
      required: true,
      message: "Please input the price per night of host listing!",
    },
  ],
  property_type: [
    {
      required: true,
      message: "Please select the property type of host listing!",
    },
  ],
  bathrooms: [
    {
      required: true,
      message: "Please input the number of bathrooms of host listing!",
    },
  ],
};

export const HostListingPromptData = [
  "Single beds: Single, Long Single, and King Single beds.",
  "Double beds: Double, Queen, King, Super King beds.",
];
