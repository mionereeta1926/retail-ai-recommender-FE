const API = "http://127.0.0.1:5000";

let currentUser = null;
let verifyEmail = "";
let cart = [];

function showMessage(message) {

    const box = document.getElementById("message");

    box.innerHTML = message;

    box.classList.remove("hidden");

    setTimeout(() => {

        box.classList.add("hidden");

    },3000);

}

function showPage(name){

    document.querySelectorAll(".page").forEach(page=>{

        page.classList.add("hidden");

    });

    document
    .getElementById("page-"+name)
    .classList.remove("hidden");

}

async function apiSignup(){

    const response = await fetch(

        API+"/signup",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                username:

                document.getElementById("signup-user").value,

                email:

                document.getElementById("signup-email").value,

                password:

                document.getElementById("signup-pass").value,

                phone_number:

                document.getElementById("signup-phone").value

            })

        }

    );

    const data = await response.json();

    if(data.success){

        verifyEmail=document.getElementById("signup-email").value;

        showMessage(

            "Verification Code : "

            +data.verification_code

        );

        showPage("verify");

    }

    else{

        showMessage(data.message);

    }

}

async function apiVerify(){

    const response=await fetch(

        API+"/verify-email",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email:verifyEmail,

                code:

                document.getElementById("verify-code").value

            })

        }

    );

    const data=await response.json();

    showMessage(data.message);

    if(data.success){

        showPage("login");

    }

}

async function apiLogin(){

    const response=await fetch(

        API+"/login",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email:

                document.getElementById("login-email").value,

                password:

                document.getElementById("login-pass").value

            })

        }

    );

    const data=await response.json();

    if(data.success){

        currentUser=data.user_id;

        localStorage.setItem(
    "user_id",
    data.user_id
);

        document
        .getElementById("navbar")
        .classList.remove("hidden");

        loadItems();

        showPage("items");

    }

    else{

        showMessage(data.message);

    }

}

function apiLogout(){

    currentUser=null;

    cart=[];

    document
    .getElementById("navbar")
    .classList.add("hidden");

    showPage("login");

}

async function loadItems(){

    const response=await fetch(

        API+"/items"

    );

    const data=await response.json();

    let html="";

    data.data.forEach(item=>{

        html+=`

        <div class="bg-white shadow rounded p-3">

            <img

            src="${item.image_url}"

            class="w-full h-40 object-cover rounded">

            <h3 class="font-bold mt-2">

            ${item.item_name}

            </h3>

            <p>

            RM ${item.item_price}

            </p>

            <button

            onclick="loadItem(${item.item_id})"

            class="bg-blue-600 text-white w-full mt-2 p-2 rounded">

            View

            </button>

        </div>

        `;

    });

    document.getElementById("items-grid").innerHTML=html;

}

async function loadItem(id){

    showPage("detail");

    const itemResponse=

    await fetch(API+"/items/"+id);

    const item=

    await itemResponse.json();

    document.getElementById(

        "detail-content"

    ).innerHTML=`

    <img

    src="${item.data.image_url}"

    class="w-full h-72 object-cover rounded">

    <h2 class="text-2xl font-bold mt-3">

    ${item.data.item_name}

    </h2>

    <p>

    ${item.data.item_description}

    </p>

    <p class="font-bold mt-2">

    RM ${item.data.item_price}

    </p>

    <button

    onclick="addCart(${item.data.item_id})"

    class="bg-green-600 text-white p-2 rounded mt-3">

    Add To Cart

    </button>

    `;

    loadRecommendations(id);

}

async function loadRecommendations(id){

    const response=

    await fetch(

        API+"/recommendations/"+id

    );

    const data=

    await response.json();

    let html="";

    data.recommendations.forEach(item=>{

        html+=`

        <div class="min-w-[150px] bg-white p-2 rounded shadow">

            <img

            src="${item.image_url}"

            class="h-24 w-full object-cover">

            <p>

            ${item.item_name}

            </p>

            <p>

            RM ${item.item_price}

            </p>

            <small>

            AI ${(item.score*100).toFixed(0)}%

            </small>

        </div>

        `;

    });

    document.getElementById("rec-grid").innerHTML=html;

}

function addCart(id){

    cart.push(id);

    document.getElementById(

        "cart-count"

    ).innerHTML=cart.length;

    showMessage("Added to cart");

}

async function checkout(){

    const response=

    await fetch(

        API+"/checkout",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                user_id:currentUser,

                items:cart,

                payment:"Dummy Payment"

            })

        }

    );

    const data=

    await response.json();

    if(data.success){

        showMessage(

            "Invoice #"

            +data.invoice.invoice_id+

            " Created"

        );

        cart=[];

        document.getElementById(

            "cart-count"

        ).innerHTML=0;

    }

}

async function apiForgot() {

    const response = await fetch(
        API + "/forgot-password",
        {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email: document.getElementById(
                    "forgot-email"
                ).value
            })
        }
    );

    const data = await response.json();

    if(data.success){

        showMessage(
            "Reset Code: " +
            data.reset_code
        );

        showPage("login");
    }
}

async function loadProfile(){

    const response =
    await fetch(
        API + "/profile/" + currentUser
    );

    const data =
    await response.json();

    if(!data.success){
        return;
    }

    const user = data.data;

    document.getElementById(
        "profile-data"
    ).innerHTML = `

    <p>
        <strong>Name:</strong>
        ${user.username}
    </p>

    <p>
        <strong>Email:</strong>
        ${user.email}
    </p>

    <p>
        <strong>Phone:</strong>
        ${user.phone_number}
    </p>

    <p>
        <strong>Status:</strong>
        ${user.active ? "Active" : "Inactive"}
    </p>

    `;

    loadInvoices();
}

async function loadInvoices(){

    const response =
    await fetch(
        API + "/invoices/" + currentUser
    );

    const data =
    await response.json();

    let html = "";

    data.data.forEach(invoice=>{

        html += `
<div class="bg-white p-3 rounded shadow">

    <p>
        Invoice #${invoice.invoice_id}
    </p>

    <p>
        Date: ${invoice.invoice_date}
    </p>

    <p>
        Amount: RM ${invoice.amount.toFixed(2)}
    </p>

    <p>
        Payment: ${invoice.payment}
    </p>

</div>
`;
    });

    document.getElementById(
        "invoices-list"
    ).innerHTML = html;
}

async function showCart(){

    showPage("checkout");

    const container =
    document.getElementById(
        "cart-items"
    );

    container.innerHTML = "";

    let total = 0;

    for(const itemId of cart){

        const response =
        await fetch(
            API + "/items/" + itemId
        );

        const data =
        await response.json();

        const item =
        data.data;

        total += item.item_price;

        container.innerHTML += `

        <div class="bg-white p-3 rounded shadow">

            <p class="font-bold">
                ${item.item_name}
            </p>

            <p>
                RM ${item.item_price}
            </p>

        </div>

        `;
    }

    container.innerHTML += `

    <div class="font-bold text-xl mt-4">

        Total :
        RM ${total.toFixed(2)}

    </div>

    `;
}

window.onload = function(){

    const user =
    localStorage.getItem(
        "user_id"
    );

    if(user){

        currentUser = user;

        document
        .getElementById("navbar")
        .classList.remove("hidden");

        loadItems();

        showPage("items");
    }
    else{

        showPage("login");
    }
};