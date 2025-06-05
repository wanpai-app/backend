const { uniqueCombo } = require("./core/constraints");

const productImagesConstraints = (table) => ({
  uniqueRefImg: uniqueCombo("refId", "imgUrl")(table),
});

module.exports = { productImagesConstraints };