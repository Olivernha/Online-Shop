const deleteProductBtns = document.querySelectorAll(".product-item button");
async function deleteProduct(event) {
  const buttonElement = event.target;
  const productId = buttonElement.dataset.productid;
  const csrfToken = buttonElement.dataset.csrf;
  const response = await fetch("/admin/products/" + productId + "?_csrf=" + csrfToken, {
    method: "DELETE",
    headers: {},
  });
  if(!response.ok) {
    alert("Could not delete product");
    return;
  }
  buttonElement.parentElement.parentElement.parentElement.parentElement.remove();
}
for (const deleteProductBtn of deleteProductBtns) {
  deleteProductBtn.addEventListener("click", deleteProduct);
}
