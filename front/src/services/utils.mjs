export {
  getIntervalInMillisecs,
  to2dec
}

function getIntervalInMillisecs(interval) {
  return {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 60 * 60 * 1000,
    '3h': 3 * 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
    '7D': 7 * 24 * 60 * 60 * 1000,
    '14D': 14 * 24 * 60 * 60 * 1000
  }[interval]
}

function to2dec(num) {
  let dec2 = String(Math.round(num * 100) / 100);
  if (dec2.indexOf('.') === -1) {
    dec2 += '.';
  }
  const numDecimalsToAdd = 2 - dec2.substring(dec2.indexOf('.') + 1).length;
  for (let i = 0; i < numDecimalsToAdd; i += 1) {
    dec2 += '0';
  }
  return dec2;
}
