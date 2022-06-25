const refIDGenerator = (desiredLength) => {
  let result = "";
  const usableChars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  const charactersLength = usableChars.length;
  for (let i = 0; i < desiredLength; i++) {
    result += usableChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = {
  refIDGenerator,
};
