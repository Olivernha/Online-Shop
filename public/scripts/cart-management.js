const addToCartButtonElement = document.querySelector('#product-details button');
const cartBadgeElements = document.querySelectorAll('.nav-items .badge');
async function addToCart(){
   const productId = addToCartButtonElement.dataset.productid;
   const csrfToken = addToCartButtonElement.dataset.csrf;
   let response
   try{
    response = await fetch('/cart/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify({
                productId: productId,
                _csrf: csrfToken
            })
        });
   }catch(err){
         alert('Something went wrong');
         return;
   }

    if(!response.ok){
        alert('Could not add item to cart');
        return;
    }

    const responseData = await response.json();
    const newTotalQuantity=  responseData.newTotalItems;
    for(const cartBadgeElement of cartBadgeElements){
        cartBadgeElement.textContent = newTotalQuantity;
    }
}
addToCartButtonElement.addEventListener('click', addToCart);