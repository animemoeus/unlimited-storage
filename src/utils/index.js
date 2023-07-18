const calculatePercentage = (numerator, denominator) => {
  const percentage = (numerator / denominator) * 100;
  const formattedPercentage = percentage.toFixed(2); // Adjust the decimal places as needed
  return `${formattedPercentage}%`;
};

export { calculatePercentage };
