// Seletores de elementos
const menu = document.getElementById("menu");
const cartbtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("finish-btn"); // Alterado para finish-btn
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const paymentSelect = document.getElementById("payment-method");
const changeForContainer = document.getElementById("change-for-container");
const changeForInput = document.getElementById("change-for");
const spanItem = document.getElementById("date-span");

// Inicializar o carrinho a partir do localStorage ou com um array vazio
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Função para atualizar o modal do carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p>Quantidade: ${item.quantity}</p> 
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <div>
                    <button class="remove-from-cart-btn bg-red-500 text-white px-2 py-1 rounded" data-name="${item.name}">
                        Remover
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Atualizar o total do carrinho
    total = calculateTotal(cart);
    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });

    // Adicionar evento de clique para os botões "Remover"
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', function () {
            const name = this.getAttribute('data-name');
            removeItemCart(name);
        });
    });
}

// Função para atualizar o contador do carrinho
function updateCartCounter() {
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCounter.textContent = itemCount;
}

// Função para adicionar ao carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }

    updateCartModal();
    updateCartCounter();
    saveCart();
}

// Função para salvar o carrinho no localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Função de remover item do carrinho
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        updateCartModal();
        updateCartCounter();
        saveCart();
    }
}

// Inicializar o carrinho e o contador ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartModal();
    updateCartCounter();
    checkRestaurantStatus(); // Verificar status do restaurante ao carregar a página
});

// Abrir o modal do carrinho
cartbtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal do carrinho clicando fora dele
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Fechar o modal do carrinho pelo botão
closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

// Adicionar ao carrinho quando um botão de tamanho é clicado
menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".size-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name") + " (" + parentButton.getAttribute("data-size") + ")";
        const price = parseFloat(parentButton.getAttribute("data-price"));
        addToCart(name, price);
    }
});

// Adicionar evento de clique para os botões "Adicionar ao Carrinho"
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function () {
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        addToCart(name, price);
    });
});

// Lógica para alternar a visibilidade do campo de troco
paymentSelect.addEventListener('change', function () {
    if (this.value === 'dinheiro') {
        changeForContainer.style.display = 'block';
    } else {
        changeForContainer.style.display = 'none';
    }
});

// Função para calcular o total do carrinho
function calculateTotal(cart) {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// Função para verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const data = new Date();
    const diaSemana = data.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const hora = data.getHours();

    // Verificar se é segunda-feira (diaSemana === 1) e impedir o pedido
    if (diaSemana === 1) { // 1 é segunda-feira
        Toastify({
            text: "Ops... Estamos fechados para manutenção todas às segundas-feiras!",
            duration: 10000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
            onClick: function () { } // Callback after click
        }).showToast();
        
        return false; // Restaurante fechado para manutenção
    }

    // Verificar horário de funcionamento
    return hora >= 17 && hora < 24; // true = aberto
}

// Função para atualizar o status do restaurante
function checkRestaurantStatus() {
    const isOpen = checkRestaurantOpen();
    const statusSpan = document.getElementById("date-span");

    if (isOpen) {
        statusSpan.classList.remove("bg-red-500");
        statusSpan.classList.add("bg-green-600");
        statusSpan.textContent = "Apenas Delivery de Terça a Domingo - 17:00 as 00:00 - Status Atual Aberto!!!"; // Adicione um texto indicativo
    } else {
        statusSpan.classList.remove("bg-green-600");
        statusSpan.classList.add("bg-red-500");
        statusSpan.textContent = "Apenas Delivery - Terça a Domingo - 17:00 as 00:00 - Status Atual Fechado!!!"; // Texto indicativo de fechado
    }

    // Definir cor do texto como branca
    statusSpan.style.color = "white";

    return isOpen;
}


// Verificar o status do restaurante periodicamente
setInterval(checkRestaurantStatus, 60000); // Verificar a cada 60 segundos

// Função de finalizar pedido
checkoutBtn.addEventListener('click', function () {
    const isOpen = checkRestaurantStatus();

    if (!isOpen) {
        Toastify({
            text: "Ops... a pizzaria está fechada!",
            duration: 10000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
            onClick: function () { } // Callback after click
        }).showToast();

        return;
    }

    // Verificação para impedir a adição de apenas metade de uma pizza
    const halfPizzaCount = cart.filter(item => item.name.includes("Metade")).length;
    if (halfPizzaCount % 2 !== 0) {
        Toastify({
            text: "Ops... não vendemos apenas metade de uma pizza. Por favor, adicione outra metade para completar a pizza!",
            duration: 10000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
            onClick: function () { } // Callback after click
        }).showToast();

        return;
    }

    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const paymentMethod = paymentSelect.value;
    const changeFor = paymentMethod === 'dinheiro' ? changeForInput.value.trim() : null;

    if (!name || !address || cart.length === 0 || !paymentMethod) {
        Toastify({
            text: "Ops... por favor, preencha todos os campos!",
            duration: 10000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
            onClick: function () { } // Callback after click
        }).showToast();

        return;
    }

    const total = calculateTotal(cart);
    let message = `Olá, temos um pedido!\n\nNome: ${name}\nEndereço: ${address}\n\nProdutos:\n`;

    cart.forEach(item => {
        message += `${item.name} - Quantidade: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\nTotal: R$ ${total.toFixed(2)}\nForma de pagamento: ${paymentMethod}${paymentMethod === 'dinheiro' ? `\nTroco para: R$ ${changeFor}` : ''}\n`;

    const phoneNumber = "+5581933006491"; // Substitua pelo seu número de WhatsApp

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');

    // Zerar carrinho e contador do header
    cart = [];
    saveCart();
    updateCartModal();
    updateCartCounter();
});
