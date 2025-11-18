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

/**
 * Merge adjacent or overlapping date ranges
 * @param {Array} ranges - Array of date range objects with start and end properties
 * @returns {Array} - Merged date ranges sorted by start date
 *
 * Example:
 * Input: [{start: '2024-11-20', end: '2024-11-23'}, {start: '2024-11-24', end: '2024-11-25'}, {start: '2024-11-26', end: '2024-11-30'}]
 * Output: [{start: '2024-11-20', end: '2024-11-30'}]
 */
export const mergeDateRanges = (ranges) => {
  if (!ranges || ranges.length === 0) {
    return [];
  }

  // Convert all dates to Date objects and sort by start date
  const sortedRanges = ranges
    .map((range) => ({
      start: new Date(range.start),
      end: new Date(range.end),
      originalStart: range.start,
      originalEnd: range.end,
    }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  let current = { ...sortedRanges[0] };

  for (let i = 1; i < sortedRanges.length; i++) {
    const next = sortedRanges[i];

    // Calculate the day difference
    const dayDiff = Math.floor(
      (next.start - current.end) / (1000 * 60 * 60 * 24)
    );

    // If ranges are adjacent (1 day apart) or overlapping (0 or negative days apart), merge them
    if (dayDiff <= 1) {
      // Extend current range to include next range
      if (next.end > current.end) {
        current.end = next.end;
        current.originalEnd = next.originalEnd;
      }
    } else {
      // Ranges are not adjacent, push current and start new range
      merged.push({
        start: current.originalStart,
        end: current.originalEnd,
      });
      current = { ...next };
    }
  }

  // Don't forget to push the last range
  merged.push({
    start: current.originalStart,
    end: current.originalEnd,
  });

  return merged;
};

export const SORT_LABELS = {
  alpha_asc: "Alphabetical A→Z",
  beds_asc: "Beds ↑",
  beds_desc: "Beds ↓",
  price_asc: "Price ↑",
  price_desc: "Price ↓",
  rating_asc: "Rating ↑",
  rating_desc: "Rating ↓",
};
