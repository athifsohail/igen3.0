// Keyboard shortcuts for navigation and actions
document.addEventListener('keydown', function(e) {
    if (e.key === 'F1') {
        e.preventDefault();
        var saleB2B = document.getElementById('invoiceTab');
        if (saleB2B) saleB2B.click();
    }
    if (e.key === 'F2') {
        e.preventDefault();
        var saleB2C = Array.from(document.querySelectorAll('.dropdown-menu .tab-link')).find(a => a.textContent.includes('Sale[B2C]'));
        if (saleB2C) saleB2C.click();
    }
    if (e.key === 'F3') {
        e.preventDefault();
        var creditB2C = Array.from(document.querySelectorAll('.dropdown-menu .tab-link')).find(a => a.textContent.includes('Credit Sale[B2C]'));
        if (creditB2C) creditB2C.click();
    }
    if (e.key === 'F9') {
        e.preventDefault();
        var purchaseNav = document.querySelector('.nav-link[data-section="purchase"]');
        if (purchaseNav) purchaseNav.click();
    }
    if (e.key === 'F10') {
        e.preventDefault();
        var reportsNav = document.querySelector('.nav-link[data-section="reports"]');
        if (reportsNav) {
            reportsNav.click();
            setTimeout(function() {
                var saleReport = document.getElementById('saleReport');
                if (saleReport) saleReport.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 200);
        }
    }
    if (e.key === 'F11') {
        e.preventDefault();
        var reportsNav = document.querySelector('.nav-link[data-section="reports"]');
        if (reportsNav) {
            reportsNav.click();
            setTimeout(function() {
                var purchaseReport = document.getElementById('purchaseReport');
                if (purchaseReport) purchaseReport.scrollIntoView({behavior: 'smooth', block: 'start'});
            }, 200);
        }
    }
    if (e.key === 'F7') {
        e.preventDefault();
        var addBtn = document.getElementById('addItemBtn');
        if (addBtn) addBtn.click();
    }
    if (e.key === 'F8') {
        e.preventDefault();
        var searchInput = document.getElementById('invoiceSearchInput');
        if (searchInput) searchInput.focus();
    }
});
document.addEventListener("DOMContentLoaded", function () {
    // Sale dropdown sub-tab switching logic
    const saleTabMap = {
        'Sale[B2B]': 'sale',
        'Sale[B2C]': 'sale-b2c',
        'Credit Sale[B2C]': 'credit-sale-b2c',
        'Delivery Challan': 'delivery-challan',
        'Estimation': 'estimation'
    };
    document.querySelectorAll('.dropdown-menu .tab-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Use only the visible text before any [shortcut] for matching
            let text = link.textContent.trim();
            // Remove trailing shortcut in brackets, e.g. [F2]
            text = text.replace(/\s*\[.*?\]$/, '');
            if (saleTabMap[text]) {
                // Hide all content sections and set display:none
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.remove('active');
                    sec.style.display = 'none';
                });
                // Show the relevant section
                const sec = document.getElementById(saleTabMap[text]);
                if (sec) {
                    sec.classList.add('active');
                    sec.style.display = 'block';
                }
            }
        });
    });
    // Helper: tab switching for all sale sub-tabs
    function setupSaleTabSwitching(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const tabBtns = section.querySelectorAll('.tab-button');
        const invoiceSec = section.querySelector('.invoice-section');
        const itemSec = section.querySelector('.item-section');
        if (!tabBtns.length || !invoiceSec || !itemSec) return;
        // Always hide both sections initially except the active tab
        function showTab(tabType) {
            if (tabType === 'invoice') {
                invoiceSec.classList.add('active');
                invoiceSec.style.display = 'block';
                itemSec.classList.remove('active');
                itemSec.style.display = 'none';
            } else {
                invoiceSec.classList.remove('active');
                invoiceSec.style.display = 'none';
                itemSec.classList.add('active');
                itemSec.style.display = 'block';
            }
        }
        // Set initial state
        if (tabBtns[0].classList.contains('active')) {
            showTab('invoice');
        } else {
            showTab('items');
        }
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                if (this.textContent.trim().toLowerCase().includes('invoice')) {
                    showTab('invoice');
                } else {
                    showTab('items');
                }
            });
        });
    }
    // Setup for all sale sub-tabs
    setupSaleTabSwitching('sale');
    setupSaleTabSwitching('sale-b2c');
    setupSaleTabSwitching('credit-sale-b2c');
    setupSaleTabSwitching('delivery-challan');
    setupSaleTabSwitching('estimation');
    // Store item details by name
    const itemHistory = {};

    // Helper to set item fields
    function setItemFields(data) {
        if (data.salePrice !== undefined) document.getElementById("salePrice").value = data.salePrice;
        if (data.mrp !== undefined) document.getElementById("oldMrpTop").value = data.oldMrp !== undefined ? data.oldMrp : '';
        if (data.mrp !== undefined) document.getElementById("oldMrp").value = data.mrp;
        if (data.rateBeforeGst !== undefined) document.getElementById("rateBeforeGst").value = data.rateBeforeGst;
    }

    // When item name loses focus, fill fields if item exists
    const itemNameInput = document.getElementById("itemName");
    if (itemNameInput) {
        itemNameInput.addEventListener("blur", function() {
            const name = itemNameInput.value.trim();
            if (name && itemHistory[name]) {
                setItemFields(itemHistory[name]);
            }
        });
    }
    // Enter key to add item from sale price, quantity, or discount fields
    ["salePrice", "quantity", "discount"].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    const addBtn = document.getElementById("addItemBtn");
                    if (addBtn) addBtn.click();
                }
            });
        }
    });
    // Auto-calculate Sale Price when Rate Before GST, GST, or CESS changes
    const rateBeforeGstInput = document.getElementById("rateBeforeGst");
    const gstInput = document.getElementById("gst");
    const cessInput = document.getElementById("cess");
    const salePriceInput = document.getElementById("salePrice");
    function updateSalePrice() {
        const rateBeforeGst = parseFloat(rateBeforeGstInput.value) || 0;
        const gst = parseFloat(gstInput.value) || 0;
        const cess = parseFloat(cessInput.value) || 0;
        const totalPercent = gst + (cess > 0 ? cess : 0);
        const salePrice = rateBeforeGst + (rateBeforeGst * totalPercent / 100);
        salePriceInput.value = salePrice ? salePrice.toFixed(2) : '';
    }
    rateBeforeGstInput.addEventListener('input', updateSalePrice);
    gstInput.addEventListener('input', updateSalePrice);
    cessInput.addEventListener('input', updateSalePrice);
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
    // Enhanced dropdown keyboard navigation
    document.querySelectorAll('.dropdown').forEach(function(dropdown) {
        const navLink = dropdown.querySelector('.nav-link');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!navLink || !menu) return;
        // Open dropdown with ArrowDown
        navLink.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                menu.style.display = 'block';
                const firstItem = menu.querySelector('a,button,li');
                if (firstItem) firstItem.focus();
            }
        });
        // Keyboard navigation inside menu
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
            } else if (e.key === 'Enter') {
                e.preventDefault();
                document.activeElement.click();
                menu.style.display = '';
                navLink.focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                menu.style.display = '';
                navLink.focus();
            }
        });
        // Hide dropdown on blur
        menu.addEventListener('focusout', function(e) {
            setTimeout(function() {
                if (!menu.contains(document.activeElement)) {
                    menu.style.display = '';
                }
            }, 10);
        });
        // Highlight parent nav tab when dropdown item is clicked
        menu.querySelectorAll('.tab-link').forEach(function(dropItem) {
            dropItem.addEventListener('click', function(e) {
                // Find parent .dropdown > .nav-link
                // ...existing code...
                const parentDropdown = this.closest('.dropdown');
                if (parentDropdown) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    const parentNav = parentDropdown.querySelector('.nav-link');
                    if (parentNav) parentNav.classList.add('active');
                }
                menu.style.display = '';
            });
        });
        // Make dropdown items focusable
        menu.querySelectorAll('a,button,li').forEach(function(item) {
            item.setAttribute('tabindex', '0');
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
    // ...existing code...
    // Get top old MRP field
    const oldMrpTopInput = document.getElementById("oldMrpTop");
    // Per Piece Price logic
    const perPieceChecked = document.getElementById("perPieceCheckbox").checked;
    const rateBeforeGst = parseFloat(document.getElementById("rateBeforeGst").value) || 0;
    const itemName = document.getElementById("itemName").value.trim();
    const barcode = document.getElementById("barcode").value.trim();
    let salePrice = parseFloat(document.getElementById("salePrice").value) || 0;
    const quantity = parseInt(document.getElementById("quantity").value) || 1;
    const discount = parseFloat(document.getElementById("discount").value) || 0;
    const discountIsValue = document.getElementById("discountCheckbox").checked;
    const gst = parseFloat(document.getElementById("gst").value) || 0;
    const cess = parseFloat(document.getElementById("cess").value) || 0;
    const oldMrpTop = oldMrpTopInput ? parseFloat(oldMrpTopInput.value) || 0 : 0;
    const mrp = parseFloat(document.getElementById("oldMrp").value) || 0;
    // Split GST into SGST and CGST
    const sgst = gst / 2;
    const cgst = gst / 2;
    let priceDisplay = '';
    if (perPieceChecked && quantity > 0) {
        salePrice = rateBeforeGst / quantity;
        priceDisplay = `₹${salePrice.toFixed(2)}`;
    } else {
        priceDisplay = salePrice.toFixed(2);
    }

    // Store or update item history
    if (itemName) {
        if (!itemHistory[itemName]) {
            itemHistory[itemName] = {
                salePrice: salePrice,
                mrp: mrp,
                oldMrp: oldMrpTop,
                rateBeforeGst: rateBeforeGst
            };
        } else {
            // If MRP changed, update oldMrp
            if (itemHistory[itemName].mrp !== mrp && mrp > 0) {
                itemHistory[itemName].oldMrp = itemHistory[itemName].mrp;
                itemHistory[itemName].mrp = mrp;
            }
            itemHistory[itemName].salePrice = salePrice;
            itemHistory[itemName].rateBeforeGst = rateBeforeGst;
        }
    }

        if (!itemName || salePrice <= 0) {
            alert("Please enter valid item details!");
            return;
        }

        // ✅ Calculate discounted price
        let discountDisplay = '';
        let discountedPrice;
        if (discountIsValue) {
            discountedPrice = salePrice - discount;
            discountDisplay = `₹${discount.toFixed(2)}`;
        } else {
            discountedPrice = salePrice - (salePrice * discount / 100);
            discountDisplay = `${discount}%`;
        }
    // ✅ Calculate GST amount (total)
    let gstAmount = (discountedPrice * gst) / 100;
    // ✅ Calculate SGST and CGST amounts
    let sgstAmount = (discountedPrice * sgst) / 100;
    let cgstAmount = (discountedPrice * cgst) / 100;
    // ✅ Calculate CESS amount
    let cessAmount = (discountedPrice * cess) / 100;
    // ✅ Final price including GST and CESS * quantity
    let totalPrice = (discountedPrice + gstAmount + cessAmount) * quantity;

        grandTotal += totalPrice;

        // ✅ Add new row to table (with split GST columns and discount logic)
        const row = document.createElement("tr");
        // Calculate taxable value
        let taxableValue = 0;
        if ((gst + cess) > 0) {
            taxableValue = totalPrice * 100 / (100 + gst + cess);
        } else {
            taxableValue = totalPrice;
        }
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${barcode}</td>
            <td>${quantity}</td>
            <td>₹${priceDisplay.replace(/^₹?/, '')}</td>
            <td>₹${taxableValue.toFixed(2)}</td>
            <td>${discountIsValue ? `₹${discount.toFixed(2)}` : `${discount}%<br><span style='font-size:11px;color:#888;'>₹${((salePrice * discount / 100) * quantity).toFixed(2)}</span>`}</td>
            <td>₹${(sgstAmount*quantity).toFixed(2)}</td>
            <td>₹${(cgstAmount*quantity).toFixed(2)}</td>
            <td>₹${(cessAmount*quantity).toFixed(2)}</td>
            <td>₹${totalPrice.toFixed(2)}</td>
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
