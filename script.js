document.addEventListener("DOMContentLoaded", function () {
    // Reference for extra item fields (right of item tab)
    const itemExtraFields = document.getElementById("itemExtraFields");
    // Show by default if Items tab is active on load
    if (itemExtraFields && document.querySelector('.tab-button.active')?.id === 'itemBtn') {
        itemExtraFields.style.display = 'flex';
    } else if (itemExtraFields) {
        itemExtraFields.style.display = 'none';
    }
    // Grand Total display below Invoice tab
    const grandTotalTabDisplay = document.getElementById("grandTotalTabDisplay");
    const grandTotalTab = document.getElementById("grandTotalTab");
    // Highlight parent nav tab when dropdown item is clicked
    document.querySelectorAll('.dropdown-menu .tab-link').forEach(function(dropItem) {
        dropItem.addEventListener('click', function(e) {
            // Find parent .dropdown > .nav-link
            const parentDropdown = this.closest('.dropdown');
            if (parentDropdown) {
                // Remove active from all nav links
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                // Add active to parent nav-link
                const parentNav = parentDropdown.querySelector('.nav-link');
                if (parentNav) parentNav.classList.add('active');
            }
        });
    });
    // Navigation links
    const navLinks = document.querySelectorAll(".nav-link");
    const contentSections = document.querySelectorAll(".content-section");

    // Tabs inside Sale section
    const invoiceBtn = document.getElementById("invoiceBtn");
    const itemBtn = document.getElementById("itemBtn");
    const invoiceSection = document.querySelector(".invoice-section");
    const itemSection = document.querySelector(".item-section");
    const tabContainer = document.querySelector(".tab-container");

    // Invoice tab in dropdown
    const invoiceTab = document.getElementById("invoiceTab");

    // Buttons and Inputs
    const createInvoiceBtn = document.getElementById("createInvoiceBtn");
    const addItemBtn = document.getElementById("addItemBtn");
    const itemTableBody = document.getElementById("itemTableBody");
    const grandTotalEl = document.getElementById("grandTotal");

    let grandTotal = 0;
    // Invoice tab in dropdown menu: open Sale section and Invoice tab
    if (invoiceTab) {
        invoiceTab.addEventListener("click", function (e) {
            e.preventDefault();
            // Activate Sale in navbar
            navLinks.forEach(l => l.classList.remove("active"));
            document.querySelector('.nav-link[data-section="sale"]').classList.add("active");
            // Show Sale section only
            contentSections.forEach(section => section.classList.remove("active"));
            document.getElementById("sale").classList.add("active");
            // Activate Invoice tab inside Sale
            invoiceBtn.classList.add("active");
            itemBtn.classList.remove("active");
            invoiceSection.classList.add("active");
            itemSection.classList.remove("active");
        });
    }

    // Set Home as default active on page load
    navLinks.forEach(l => l.classList.remove("active"));
    contentSections.forEach(section => section.classList.remove("active"));
    document.querySelector('.nav-link[data-section="home"]').classList.add("active");
    document.getElementById("home").classList.add("active");

    // 705 Navigation Switching
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Remove active from all
            navLinks.forEach(l => l.classList.remove("active"));
            contentSections.forEach(section => section.classList.remove("active"));

            // Add active to clicked link and its section
            this.classList.add("active");
            const sectionId = this.getAttribute("data-section");
            document.getElementById(sectionId).classList.add("active");

            // If Sale section is opened, show Invoice by default
            if (sectionId === "sale") {
                if (tabContainer) tabContainer.style.display = "block";
                invoiceBtn.classList.add("active");
                itemBtn.classList.remove("active");
                invoiceSection.classList.add("active");
                itemSection.classList.remove("active");
            } else {
                // Hide both invoice and item sections and tab container when not in Sale
                if (tabContainer) tabContainer.style.display = "none";
                invoiceSection.classList.remove("active");
                itemSection.classList.remove("active");
            }
    // Hide tab-container by default unless Sale is active
    if (tabContainer) tabContainer.style.display = "none";
        });
    });

    // ✅ Tab Switching inside Sale section
    invoiceBtn.addEventListener("click", function () {
        // Hide extra item fields in Invoice tab
        if (itemExtraFields) itemExtraFields.style.display = "none";
        // Show grand total and items table below invoice tab
        if (grandTotalTabDisplay) {
            grandTotalTabDisplay.style.display = "block";
            grandTotalTab.textContent = grandTotal.toFixed(2);
        }
        // Hide grand total in Items section
        const grandTotalEl = document.getElementById("grandTotal");
        if (grandTotalEl && grandTotalEl.parentElement) grandTotalEl.parentElement.style.display = "none";
        // Show items table and populate it
        const invoiceItemsTableContainer = document.getElementById("invoiceItemsTableContainer");
        const invoiceItemsTableBody = document.getElementById("invoiceItemsTableBody");
        if (invoiceItemsTableContainer && invoiceItemsTableBody) {
            invoiceItemsTableContainer.style.display = "block";
            // Copy rows from itemTableBody
            const itemTableBody = document.getElementById("itemTableBody");
            invoiceItemsTableBody.innerHTML = itemTableBody ? itemTableBody.innerHTML : "";
        }
        invoiceBtn.classList.add("active");
        itemBtn.classList.remove("active");
        invoiceSection.classList.add("active");
        itemSection.classList.remove("active");
    });

    itemBtn.addEventListener("click", function () {
    // Show extra item fields only in Items tab
    if (itemExtraFields) itemExtraFields.style.display = "flex";
    // Hide grand total and items table below invoice tab when switching to items
    if (grandTotalTabDisplay) grandTotalTabDisplay.style.display = "none";
    // Show grand total in Items section
    const grandTotalEl = document.getElementById("grandTotal");
    if (grandTotalEl && grandTotalEl.parentElement) grandTotalEl.parentElement.style.display = "block";
    const invoiceItemsTableContainer = document.getElementById("invoiceItemsTableContainer");
    if (invoiceItemsTableContainer) invoiceItemsTableContainer.style.display = "none";
    itemBtn.classList.add("active");
    invoiceBtn.classList.remove("active");
    itemSection.classList.add("active");
    invoiceSection.classList.remove("active");
    });

    // ✅ Create Invoice → Switch to Item tab
    createInvoiceBtn.addEventListener("click", function () {
        itemBtn.click();
    });

    // ✅ Press Enter inside Invoice Section → Switch to Item tab
    invoiceSection.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            itemBtn.click();
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
        if (grandTotalEl) grandTotalEl.textContent = grandTotal.toFixed(2);
        // If invoice tab is visible, update there too
        if (grandTotalTabDisplay && grandTotalTabDisplay.style.display === "block") {
            grandTotalTab.textContent = grandTotal.toFixed(2);
        }
        // If invoice items table is visible, update it too
        const invoiceItemsTableContainer = document.getElementById("invoiceItemsTableContainer");
        const invoiceItemsTableBody = document.getElementById("invoiceItemsTableBody");
        if (invoiceItemsTableContainer && invoiceItemsTableContainer.style.display === "block" && invoiceItemsTableBody) {
            const itemTableBody = document.getElementById("itemTableBody");
            invoiceItemsTableBody.innerHTML = itemTableBody ? itemTableBody.innerHTML : "";
        }
    // Generic dropdown keyboard navigation for all dropdown menus
    document.querySelectorAll('.dropdown-menu').forEach(function(menu) {
        menu.addEventListener('keydown', function(e) {
            const items = Array.from(menu.querySelectorAll('a,button,li'));
            let idx = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                let next = (idx + 1) % items.length;
                items[next].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let prev = (idx - 1 + items.length) % items.length;
                items[prev].focus();
            }
        });
        // Make dropdown items focusable
        menu.querySelectorAll('a,button,li').forEach(function(item) {
            item.setAttribute('tabindex', '0');
        });
    });

        // ✅ Reset fields
        document.getElementById("itemName").value = "";
        document.getElementById("barcode").value = "";
        document.getElementById("salePrice").value = "";
        document.getElementById("quantity").value = "1";
        document.getElementById("discount").value = "";
        document.getElementById("gst").value = "";
    });
});
