exports.getCardPlanPrice = (planType) => {
  switch (planType) {
    case "quarterly":
      return 50;
    case "half-year":
      return 100;
    case "annual":
      return 150;
    default:
      return null;
  }
};
