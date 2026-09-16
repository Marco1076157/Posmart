const product = [
    { barcode : "891234", name: "Indomie Bangladesh", price: 5000 },
    { barcode : "895678", name: "Mie Sedap", price: 3000 },
    { barcode : "899012", name: "Beras 1kg", price: 15000 },
    { barcode : "893456", name: "Minyak Goreng 1L", price: 12000 },
    { barcode : "897890", name: "Gula 1kg", price: 10000 },
    { barcode : "894567", name: "Teh Celup 25pcs", price: 8000 },
    { barcode : "890123", name: "Coca Cola", price: 15000 }
];

let shoppingCart = [];

const inputBarcode = document.querySelector("#input-barcode");
const cashierForm = document.querySelector("#cashier-form");
const cartTableBody = document.querySelector("#cart-table-body");
const lblTotalAmount = document.querySelector("#total-amount");
const lblTotalItemCount = document.querySelector("#total-items-count");
const iblInvoiceNum = document.querySelector("#invoice-num");
const btnNew = document.querySelector("#btn-new");

// Render cart table
const renderCartTable = () => {
    if (shoppingCart.length === 0) {
        cartTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666; padding: 30px;">Keranjang kosong. Silakan ketik barcode</td></tr>`;

        lblTotalAmount.textContent = "Rp 0";
        lblTotalItemCount.textContent = "0 Jenis";
        return;
    }   

    //.map() untuk transformasi data
    const tableRows = shoppingCart.map((item) => {
        const itemSubtotal = item.price * item.qty;

        // Destructuring objek (ekstrak data dari objek item)
        const { barcode, name, price, qty } = item;

        return `
        <tr>
            <td><code>${barcode}</code></td>
            <td><strong>${name}</strong></td>
            <td style="text-align: center;">${qty}</td>
            <td>Rp ${price.toLocaleString('id-ID')}</td>
            <td>Rp ${itemSubtotal.toLocaleString('id-ID')}</td>
            <td style="text-align: center;">
                <button class="btn btn-sm btn-danger" onclick="removeItemFromCart('${barcode}')">Hapus</button>
            </td>
        </tr>
        `;
    });

    cartTableBody.innerHTML = tableRows.join("");
    lblTotalAmount.textContent = `Rp ${calculateGrandTotal(shoppingCart).toLocaleString('id-ID')}`;
    lblTotalItemCount.textContent = ``;

};

const handleBarcodeScan = () => {
    const scannedBarcode = inputBarcode.value.trim();
    if(!scannedBarcode) return;

    const matchedProduk = product.find(p => p.barcode === scannedBarcode);

    if (matchedProduk) {
        const isInchart = shoppingCart.find(item => item.barcode === scannedBarcode);

        if (isInchart) {
            // Update exiting item
            shoppingCart = shoppingCart.map(item => item.barcode === scannedBarcode ? {...item,qty: item.qty + 1}: item);
        } else {
            // insert new array -> matchedProduct
            shoppingCart = [...shoppingCart, {...matchedProduk, qty:1 }];
        }
        renderCartTable();
    } else {
        alert(`Error Barcode ${scannedBarcode} tidak terdaftar`);
    };
    inputBarcode.value = "";
    inputBarcode.focus();
};

cashierForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleBarcodeScan();
});

window.removeItemFromCart = (targetBarcode) => {
    shoppingCart = shoppingCart.filter(item => item.barcode !== targetBarcode);
    renderCartTable();
};

const calculateGrandTotal = (cartArray) => {
    return cartArray.reduce((totalAccumulator, currentItem) => {
        return totalAccumulator + (currentItem.price * currentItem.qty);
    }, 0);
};


const startNewTransaction = () => {
    shoppingCart = [];
    renderCartTable();
    inputBarcode.focus();
};

startNewTransaction();

