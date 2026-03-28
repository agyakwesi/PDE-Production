const EXCHANGE_RATE = 10.90;

const getGlobalPrice = (usdPrice) => {
  return usdPrice * EXCHANGE_RATE;
};

module.exports = {
  EXCHANGE_RATE,
  getGlobalPrice
};
