export const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Format the date using toLocaleDateString
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Add markdown bold formatting
  return formattedDate;
};

// Example usage
