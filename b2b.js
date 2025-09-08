document.addEventListener("DOMContentLoaded", function () {
    // Tabs and Sections
    const invoiceTab = document.getElementById("invoiceTab");
    const itemTab = document.getElementById("itemTab");
    const invoiceSection = document.querySelector(".invoice-section");
    const itemSection = document.querySelector(".item-section");
    const createInvoiceBtn = document.getElementById("createInvoiceBtn");

    // Table and Buttons
    const addItemBtn = document.getElementById("addItemBtn");
    const itemTableBody = document.getElementById("itemTableBody");
    const grandTotalEl = document.getElementById("grandTotal");

    let grandTotal = 0;

    // ✅ Tab Switching Functions
    function switchToInvoice() {
        invoiceTab.classList.add("active");
        itemTab.classList.remove("active");
        invoiceSection.classList.add("active");
        itemSection.classList.remove("active");
    }

    function switchToItems() {
        itemTab.classList.add("active");
        invoiceTab.classList.remove("active");
        itemSection.classList.add("active");
        invoiceSection.classList.remove("active");
    }

    // ✅ Tab Button Click Events
    invoiceTab.addEventListener("click", switchToInvoice);
    itemTab.addEventListener("click", switchToItems);

    // ✅ When Create Invoice button is clicked → Switch to Item tab
    createInvoiceBtn.addEventListener("click", function () {
        switchToItems();
    });

    // ✅ Press Enter inside Invoice form → Switch to Items
    invoiceSection.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            switchToItems();
        }
    });

    // ✅ Add Item and Calculate GST
    addItemBtn.addEventListener("click", function () {
        const itemName = document.getElementById("itemName").value.trim();
        const barcode = document.getElementById("barcode").value.trim();
        const salePrice = parseFloat(document.getElementById("salePrice").value) || 0;
        const quantity = parseInt(document.getElementById("quantity").value) || 1;
        const discount = parseFloat(document.getElementById("discount").value) || 0;
        const gst = parseFloat(document.getElementById("gst").value) || 0;

        if (!itemName || salePrice <= 0) {
            alert("Please enter valid item details!");
            return;
        }

        // ✅ Calculate discounted price
        let discountedPrice = salePrice - (salePrice * discount / 100);
        // ✅ Calculate GST amount
        let gstAmount = (discountedPrice * gst) / 100;
        // ✅ Final price including GST * quantity
        let totalPrice = (discountedPrice + gstAmount) * quantity;

        grandTotal += totalPrice;

        // ✅ Add new row to table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${barcode}</td>
            <td>${quantity}</td>
            <td>${salePrice.toFixed(2)}</td>
            <td>${discount}%</td>
            <td>${gst}%</td>
            <td>${totalPrice.toFixed(2)}</td>
        `;
        itemTableBody.appendChild(row);

        // ✅ Update Grand Total
        grandTotalEl.textContent = grandTotal.toFixed(2);

        // ✅ Reset fields
        document.getElementById("itemName").value = "";
        document.getElementById("barcode").value = "";
        document.getElementById("salePrice").value = "";
        document.getElementById("quantity").value = "1";
        document.getElementById("discount").value = "";
        document.getElementById("gst").value = "";
    });
});
