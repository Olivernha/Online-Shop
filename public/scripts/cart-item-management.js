const cartItemUpdateFormElements = document.querySelectorAll('.cart-item-management');
async function updateCartItem(event){
    event.preventDefault();
    const form = event.target;
    const productId = form.dataset.productid;
    const csrfToken = form.dataset.csrf;

    const newQuantity = form.firstElementChild.value;
    let response;
    try{
      response = await fetch('/cart/items/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity : newQuantity,
                _csrf: csrfToken
            })
        })
    }catch(err){
        alert('Something went wrong');
        return;
    }
    if(!response.ok){
        alert('Something went wrong');
        return;
    }
    const responseData = await response.json();

}
for(const formElement of cartItemUpdateFormElements){
    formElement.addEventListener('submit', updateCartItem);
}