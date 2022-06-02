function handleErrors(err, req, res, next) {
  console.log(err);
  if (err.code === 404) {
    return res.status(404).render("shared/400");
  }
  res.status(500).render("shared/500");
}
module.exports = handleErrors;
