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
        // Find the add button within the currently active section and click it
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) activeSection.querySelector('.add-item-btn')?.click();
    }
    if (e.key === 'F8') {
        e.preventDefault();
        var searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        const homeLink = document.querySelector('.nav-link[data-section="home"]');
        if (homeLink) homeLink.click();
    }
});

/**
 * Manages invoice numbers for the B2B sales section.
 * It uses localStorage to persist the last used invoice number.
 */
function getFinancialYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = January, 3 = April

    if (month >= 3) { // April or later
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else { // Before April (Jan, Feb, March)
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
}

function createInvoiceManager(config) {
    return {
        key: config.key,
        prefixBase: config.prefixBase,
        inputId: config.inputId,

        setNextInvoiceNumber: function() {
            const currentFY = getFinancialYear();
            const currentPrefix = `${this.prefixBase}${currentFY}`;

            const lastInvoice = localStorage.getItem(this.key);
            let nextSeq = 1;

            if (lastInvoice) {
                const parts = lastInvoice.split('-');
                const lastSeq = parseInt(parts[0], 10);
                const lastPrefix = parts.slice(1).join('-');

                if (lastPrefix === currentPrefix && !isNaN(lastSeq)) {
                    // Same financial year, so increment
                    nextSeq = lastSeq + 1;
                }
                // If financial year is different, nextSeq remains 1 (reset)
            }
            
            const nextInvoiceNumber = `${nextSeq}-${currentPrefix}`;
            const invoiceInput = document.getElementById(this.inputId);
            if (invoiceInput) {
                invoiceInput.value = nextInvoiceNumber;
            }
        },

        commitCurrentInvoice: function() {
            const invoiceInput = document.getElementById(this.inputId);
            if (invoiceInput && invoiceInput.value) {
                localStorage.setItem(this.key, invoiceInput.value);
            }
        }
    };
}

// Create managers for each sale type
const b2bInvoiceManager = createInvoiceManager({ key: 'lastB2BInvoiceNumber', prefixBase: 'S', inputId: 'invoiceNoInputB2B' });
const b2cInvoiceManager = createInvoiceManager({ key: 'lastB2CInvoiceNumber', prefixBase: 'C', inputId: 'invoiceNoInputB2C' });
const creditB2cInvoiceManager = createInvoiceManager({ key: 'lastB2CInvoiceNumber', prefixBase: 'C', inputId: 'invoiceNoInputCreditB2C' });
const deliveryChallanManager = createInvoiceManager({ key: 'lastDCInvoiceNumber', prefixBase: 'DC-', inputId: 'invoiceNoInputDC' });
const estimationManager = createInvoiceManager({ key: 'lastEstInvoiceNumber', prefixBase: 'EST-', inputId: 'invoiceNoInputEst' });

const invoiceManagers = {
    'sale': b2bInvoiceManager,
    'sale-b2c': b2cInvoiceManager,
    'credit-sale-b2c': creditB2cInvoiceManager,
    'delivery-challan': deliveryChallanManager,
    'estimation': estimationManager
};

/**
 * Sets the default date for specified date inputs to today.
 */
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    // Find all date inputs within the active section that are not part of the item entry form
    const dateInputs = activeSection.querySelectorAll('.invoice-section input[type="date"]');
    
    dateInputs.forEach(input => {
        // A more robust check could be to see if the ID contains 'Date'
        if (input.id.toLowerCase().includes('date')) {
            input.value = today;
        }
    });
    // Legacy support for the original implementation
    const specificOrderDate = document.getElementById('orderDateInput');
    if (specificOrderDate && activeSection.id === 'sale') {
        specificOrderDate.value = today;
    }
}

/**
 * Handles the "Same as Address" checkbox functionality.
 */
function setupSameAsAddress() {
    const addressInput = document.getElementById('addressInput');
    const shippingAddressInput = document.getElementById('shippingAddress');
    const sameAsAddressCheckbox = document.getElementById('sameAsAddressCheckbox');

    if (addressInput && shippingAddressInput && sameAsAddressCheckbox) {
        sameAsAddressCheckbox.addEventListener('change', function() {
            if (this.checked) {
                shippingAddressInput.value = addressInput.value;
            } else {
                shippingAddressInput.value = ''; // Clear the field when unchecked
            }
        });

        // Also update the shipping address in real-time if the main address changes
        addressInput.addEventListener('input', function() {
            if (sameAsAddressCheckbox.checked) {
                shippingAddressInput.value = this.value;
            }
        });

        // Trigger the copy on load if the checkbox is already checked
        if (sameAsAddressCheckbox.checked) {
            // Use a small timeout to ensure the address field has its value if it's auto-filled
            setTimeout(() => {
                shippingAddressInput.value = addressInput.value;
            }, 100);
        }
    }
}



document.addEventListener("DOMContentLoaded", function () {
    // Sale dropdown sub-tab switching logic
    const saleTabMap = {
        'Sale[B2B]': 'sale',
        'Sale[B2C]': 'sale-b2c',
        'Credit Sale[B2C]': 'credit-sale-b2c',
        'Delivery Challan': 'delivery-challan',
        'Estimation': 'estimation'
    };
    const globalSearchContainer = document.getElementById('global-search-container');



    // Initialize "Same as Address" checkbox logic
    setupSameAsAddress();

    // Add a single, delegated event listener for all dropdown link clicks
    document.querySelector('body').addEventListener('click', function(e) {
        // Check if a dropdown link was clicked
        if (e.target.matches('.dropdown-menu .tab-link')) {
            const parentDropdown = e.target.closest('.dropdown');
            if (parentDropdown) {
                // Remove 'active' from all main nav links
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                // Add 'active' to the parent nav link of the clicked item
                const parentNavLink = parentDropdown.querySelector('.nav-link');
                if (parentNavLink) parentNavLink.classList.add('active');
            }
        }
    });
    document.querySelectorAll('.dropdown-menu .tab-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Use only the visible text before any [shortcut] for matching
            let text = link.textContent.trim()
                // Remove trailing shortcut in brackets, e.g. [F2], but not [B2C]
                .replace(/\s*\[F\d{1,2}\]$/, '');
            if (saleTabMap[text]) {
                // Show the global search bar for sale sections
                if (globalSearchContainer) {
                    globalSearchContainer.style.display = 'flex';
                }

                // Hide all content sections and set display:none
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.remove('active');
                    sec.style.display = 'none';
                });
                // Show the relevant section
                const sec = document.getElementById(saleTabMap[text]);
                if (sec) {
                    sec.querySelector('.tab-container').style.display = 'flex';
                    sec.classList.add('active');
                    sec.style.display = 'block';

                    // If the activated section is Sale[B2B], set its invoice number.
                    const sectionId = saleTabMap[text];
                    const manager = invoiceManagers[sectionId];
                    if (manager) {
                        manager.setNextInvoiceNumber();
                        setDefaultDates();
                    }
                }
            } else {
                if (globalSearchContainer) {
                    globalSearchContainer.style.display = 'none';
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

        const itemExtraFields = section.querySelector('.item-extra-fields');
        const grandTotalTabDisplay = section.querySelector('.grand-total-tab-display'); // In invoice tab
        const invoiceItemsTableContainer = section.querySelector('.invoice-items-table-container');
        const invoiceItemsTableBody = section.querySelector('.invoice-items-table-body');
        const mainItemTableBody = section.querySelector('.item-table-body');

        // Always hide both sections initially except the active tab
        function showTab(tabType) {
            if (tabType === 'invoice') {
                invoiceSec.classList.add('active');
                invoiceSec.style.display = 'block'; // Use 'block' for the invoice section layout
                itemSec.classList.remove('active');
                itemSec.style.display = 'none';

                // Hide/Show relevant parts
                if (itemExtraFields) itemExtraFields.style.display = 'none';

                // Copy table content from item tab to invoice tab
                if (mainItemTableBody && invoiceItemsTableBody) {
                    invoiceItemsTableBody.innerHTML = mainItemTableBody.innerHTML;
                }
            } else {
                invoiceSec.classList.remove('active');
                invoiceSec.style.display = 'none';
                itemSec.classList.add('active');
                itemSec.style.display = 'block';
                if (itemExtraFields) itemExtraFields.style.display = 'flex';
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
                if (this.dataset.tab === 'invoice') {
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

    // --- Credit Sale[B2C] Tab Logic ---
    const invoiceBtnCreditB2C = document.getElementById('invoiceBtnCreditB2C');
    const itemBtnCreditB2C = document.getElementById('itemBtnCreditB2C');
    const invoiceSectionCreditB2C = document.querySelector('#credit-sale-b2c .invoice-section');
    const itemSectionCreditB2C = document.querySelector('#credit-sale-b2c .item-section');
    const tabContainerCreditB2C = document.querySelector('#credit-sale-b2c .tab-container');
    const createInvoiceBtnCreditB2C = document.getElementById('createInvoiceBtnCreditB2C');
    const addItemBtnCreditB2C = document.getElementById('addItemBtnCreditB2C');
    const itemTableBodyCreditB2C = document.getElementById('itemTableBodyCreditB2C');
    const grandTotalCreditB2CEl = document.getElementById('grandTotalCreditB2C');
    const grandTotalTabDisplayCreditB2C = document.getElementById('grandTotalTabDisplayCreditB2C');
    const grandTotalTabCreditB2C = document.getElementById('grandTotalTabCreditB2C');
    let grandTotalCreditB2C = 0;

    if (invoiceBtnCreditB2C && itemBtnCreditB2C && invoiceSectionCreditB2C && itemSectionCreditB2C) {
        invoiceBtnCreditB2C.addEventListener('click', function () {
            invoiceBtnCreditB2C.classList.add('active');
            itemBtnCreditB2C.classList.remove('active');
            invoiceSectionCreditB2C.classList.add('active');
            invoiceSectionCreditB2C.style.display = 'block';
            itemSectionCreditB2C.classList.remove('active');
            itemSectionCreditB2C.style.display = 'none';
            if (grandTotalTabDisplayCreditB2C) {
                grandTotalTabDisplayCreditB2C.style.display = 'block';
                if (grandTotalTabCreditB2C) grandTotalTabCreditB2C.textContent = grandTotalCreditB2C.toFixed(2);
            }
        });
        itemBtnCreditB2C.addEventListener('click', function () {
            itemBtnCreditB2C.classList.add('active');
            invoiceBtnCreditB2C.classList.remove('active');
            itemSectionCreditB2C.classList.add('active');
            itemSectionCreditB2C.style.display = 'block';
            invoiceSectionCreditB2C.classList.remove('active');
            invoiceSectionCreditB2C.style.display = 'none';
            if (grandTotalTabDisplayCreditB2C) grandTotalTabDisplayCreditB2C.style.display = 'none';
            if (grandTotalCreditB2CEl && grandTotalCreditB2CEl.parentElement) grandTotalCreditB2CEl.parentElement.style.display = 'block';
        });
        // Default to Invoice tab
        invoiceBtnCreditB2C.classList.add('active');
        itemBtnCreditB2C.classList.remove('active');
        invoiceSectionCreditB2C.classList.add('active');
        invoiceSectionCreditB2C.style.display = 'block';
        itemSectionCreditB2C.classList.remove('active');
        itemSectionCreditB2C.style.display = 'none';
    }

    if (createInvoiceBtnCreditB2C && itemBtnCreditB2C) {
        createInvoiceBtnCreditB2C.addEventListener('click', function () {
            itemBtnCreditB2C.click();
        });
    }

    if (invoiceSectionCreditB2C && itemBtnCreditB2C) {
        invoiceSectionCreditB2C.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                itemBtnCreditB2C.click();
            }
        });
    }

    // A single, delegated event listener for all "Add" buttons
    document.body.addEventListener('click', function(e) {
        // If the clicked element is not an "Add" button, do nothing.
        if (!e.target.matches('.add-item-btn')) {
            return;
        }

        // Find the currently active sale section
        const section = e.target.closest('.content-section.active');
        if (!section) {
            return;
        }

        // Find all the necessary elements *within the active section*
        const itemTableBody = section.querySelector('.item-table-body');
        const grandTotalEl = section.querySelector('.grand-total-amount');
        const grandTotalTabAmount = section.querySelector('.grand-total-tab-amount');
        const itemNameInput = section.querySelector('.item-name-input');
        const barcodeInput = section.querySelector('.barcode-input');
        const salePriceInput = section.querySelector('.sale-price-input');
        const quantityInput = section.querySelector('.quantity-input');
        const discountInput = section.querySelector('.discount-input');
        const gstInput = section.querySelector('.gst-input');
        const cessInput = section.querySelector('.cess-input');
        const rateBeforeGstInput = section.querySelector('.rate-before-gst-input');
        const perPieceCheckbox = section.querySelector('.per-piece-checkbox');
        const discountCheckbox = section.querySelector('.discount-checkbox');

        // Get values from the inputs
        const itemName = itemNameInput.value.trim();
        let salePrice = parseFloat(salePriceInput.value) || 0;
        const quantity = parseFloat(quantityInput.value) || 1;
        const barcode = barcodeInput.value.trim();
        const discount = parseFloat(discountInput.value) || 0;
        const discountIsValue = discountCheckbox.checked;
        const gst = parseFloat(gstInput.value) || 0;
        const cess = parseFloat(cessInput.value) || 0;
        const rateBeforeGst = parseFloat(rateBeforeGstInput.value) || 0;
        const perPieceChecked = perPieceCheckbox.checked;

        // Basic validation
        if (!itemName || salePrice <= 0) {
            alert("Please enter a valid Item Name and Sale Price.");
            return;
        }

        // --- Calculations ---
        const sgstPercent = gst / 2;
        const cgstPercent = gst / 2;
        let priceDisplay = salePrice.toFixed(2);

        // If "Per Piece Price" is checked, the entered Sale Price is treated as the total for all quantities.
        // We then calculate the price for a single item.
        if (perPieceChecked && quantity > 0 && salePrice > 0) {
            const totalSalePrice = salePrice; // The input value is the total
            salePrice = totalSalePrice / quantity; // The variable now holds the per-piece price
            priceDisplay = salePrice.toFixed(2);
        }

        // Calculate discount
        let discountedPrice;
        if (discountIsValue) {
            discountedPrice = salePrice - discount;
        } else {
            discountedPrice = salePrice - (salePrice * discount / 100);
        }

        // Calculate taxes
        const sgstAmount = (discountedPrice * sgstPercent) / 100;
        const cgstAmount = (discountedPrice * cgstPercent) / 100;
        const cessAmount = (discountedPrice * cess) / 100;
        const totalItemPrice = (discountedPrice + sgstAmount + cgstAmount + cessAmount) * quantity;
        const taxableValue = discountedPrice * quantity;

        // --- Update Table ---
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${barcode}</td>
            <td>${quantity}</td>
            <td>₹${priceDisplay}</td>
            <td>₹${taxableValue.toFixed(2)}</td>
            <td>${discountIsValue ? `₹${discount.toFixed(2)}` : `${discount}%`}</td>
            <td>${sgstPercent}%<br>₹${(sgstAmount * quantity).toFixed(2)}</td>
            <td>${cgstPercent}%<br>₹${(cgstAmount * quantity).toFixed(2)}</td>
            <td>₹${(cessAmount * quantity).toFixed(2)}</td>
            <td>₹${totalItemPrice.toFixed(2)}</td>
            <td class="actions-column">
                <button class="edit-item-btn" title="Edit">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1lZGl0Ij48cGF0aCBkPSJNMTIgMjBIOS41MjVDNi40OCAyMCA0IDE3LjUyIDQgMTQuNDhWOS41MkM0IDYuNDggNi40OCA0IDkuNTIgNGgxLjQ0TTguNSA2LjVMMTMuNSA2LjUiLz48cGF0aCBkPSJNMTggMTMuNzZWMTguNUMxOCAyMC40MyAxNi40MyAyMiAxNC41IDIySDkuNUM3LjU3IDIyIDYgMjAuNDMgNiAxOC41VjkuNUM2IDcuNTcgNy41NyA2IDkuNSA2SDE0Ii8+PHBhdGggZD0iTTE2IDRMMjAgOCIvPjxwYXRoIGQ9Ik0yMS4zOCA2LjYyTDE3LjM4IDExLjYyQzE3LjA0IDExLjk2IDE2LjYxIDEyLjE4IDE2LjE1IDEyLjIyTDEzIDEyLjk5TDEzLjc3IDkuODNDMTMuODEgOS4zOCAxNC4wNCA4Ljk1IDE0LjM4IDguNjJMMTguMzggMy42MkMyMC4wOSAxLjkxIDIyLjA5IDEuOTEgMjIuMzggMi4yQzIzLjA5IDIuOTEgMjMuMDkgNC45MSAyMS4zOCA2LjYyWiIvPjwvc3ZnPg==" alt="Edit">
                </button>
                <button class="delete-item-btn" title="Delete">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci10cmFzaC0yIj48cG9seWxpbmUgcG9pbnRzPSIzIDYgNSA2IDIxIDYiLz48cGF0aCBkPSJNMTkgNnYxNGExIDEgMCAwIDEtMSAxaC0xMGExIDEgMCAwIDEtMS0xVjZtMyAwViRhMSAxIDAgMCAxIDEtMWg0YTEgMSAwIDAgMSAxIDF2MiIvPjxsaW5lIHgxPSIxMCIgeTE9IjExIiB4Mj0iMTAiIHkyPSIxNyIvPjxsaW5lIHgxPSIxNCIgeTE9IjExIiB4Mj0iMTQiIHkyPSIxNyIvPjwvc3ZnPg==" alt="Delete">
                </button>
            </td>
        `;
        itemTableBody.appendChild(row);

        // --- Update Grand Total ---
        let currentGrandTotal = 0;
        itemTableBody.querySelectorAll('tr').forEach(r => {
            const totalCell = r.cells[r.cells.length - 1]; // Last cell is Total
            currentGrandTotal += parseFloat(totalCell.textContent.replace('₹', '')) || 0;
        });
        grandTotalEl.textContent = currentGrandTotal.toFixed(2);
        if (grandTotalTabAmount) {
            grandTotalTabAmount.textContent = currentGrandTotal.toFixed(2);
        }

        // --- Reset Fields ---
        itemNameInput.value = '';
        barcodeInput.value = '';
        salePriceInput.value = '';
        quantityInput.value = '1';
        discountInput.value = '0';
        gstInput.value = '';
        cessInput.value = '';
        rateBeforeGstInput.value = '';
        perPieceCheckbox.checked = false;
        discountCheckbox.checked = false;
        itemNameInput.focus(); // Move cursor back to item name
    });

    // Store item details by name
    const itemHistory = {};

    // Helper to set item fields
    function setItemFields(data) {
        if (data.salePrice !== undefined) document.getElementById("salePrice").value = data.salePrice;
        if (data.mrp !== undefined) document.getElementById("oldMrpTop").value = data.oldMrp !== undefined ? data.oldMrp : '';
        if (data.mrp !== undefined) document.getElementById("oldMrp").value = data.mrp;
        if (data.rateBeforeGst !== undefined) document.getElementById("rateBeforeGst").value = data.rateBeforeGst;
    }

    // Helper function to recalculate totals and sync tables
    function updateTotalsAndSyncTables(section) {
        const itemTableBody = section.querySelector('.item-table-body');
        const grandTotalEl = section.querySelector('.grand-total-amount');
        const grandTotalTabAmount = section.querySelector('.grand-total-tab-amount');
        const invoiceItemsTableBody = section.querySelector('.invoice-items-table-body');

        if (!itemTableBody || !grandTotalEl || !grandTotalTabAmount || !invoiceItemsTableBody) return;

        let newGrandTotal = 0;
        itemTableBody.querySelectorAll('tr').forEach(r => {
            // The total cell is now the second to last one
            const totalCell = r.cells[r.cells.length - 2]; 
            newGrandTotal += parseFloat(totalCell.textContent.replace('₹', '')) || 0;
        });

        // Update grand total displays
        grandTotalEl.textContent = newGrandTotal.toFixed(2);
        grandTotalTabAmount.textContent = newGrandTotal.toFixed(2);

        // Sync the invoice table with the main item table
        invoiceItemsTableBody.innerHTML = itemTableBody.innerHTML;
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
    // Delegated event listener for Enter key on item input fields to trigger Add button
    document.body.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.matches('.sale-price-input, .rate-before-gst-input, .quantity-input')) {
            e.preventDefault();
            const activeSection = e.target.closest('.content-section.active');
            activeSection?.querySelector('.add-item-btn')?.click();
        }
    });

    // Auto-calculate Sale Price when Rate Before GST, GST, or CESS changes
    document.body.addEventListener('input', function(e) {
        // Check if the input event came from one of our target fields
        if (e.target.matches('.rate-before-gst-input, .gst-input, .cess-input')) {
            // Forward calculation: Rate Before GST -> Sale Price
            updateSalePrice(e.target.closest('.content-section.active'));
        }
        // Reverse calculation: Sale Price -> Rate Before GST
        if (e.target.matches('.sale-price-input')) {
            updateRateBeforeGst(e.target.closest('.content-section.active'));
        }
    });

    function updateSalePrice(activeSection) {
        if (!activeSection) return;

        // Find the relevant inputs within the active section
        const rateBeforeGstInput = activeSection.querySelector(".rate-before-gst-input");
        const gstInput = activeSection.querySelector(".gst-input");
        const cessInput = activeSection.querySelector(".cess-input");
        const salePriceInput = activeSection.querySelector(".sale-price-input");

        if (!rateBeforeGstInput || !gstInput || !cessInput || !salePriceInput) return;

        const rateBeforeGst = parseFloat(rateBeforeGstInput.value) || 0;
        const gst = parseFloat(gstInput.value) || 0;
        const cess = parseFloat(cessInput.value) || 0;
        const totalTaxPercent = gst + cess;
        const salePrice = rateBeforeGst * (1 + totalTaxPercent / 100);

        salePriceInput.value = salePrice > 0 ? salePrice.toFixed(2) : '';
    }

    function updateRateBeforeGst(activeSection) {
        if (!activeSection) return;

        // Find the relevant inputs within the active section
        const rateBeforeGstInput = activeSection.querySelector(".rate-before-gst-input");
        const gstInput = activeSection.querySelector(".gst-input");
        const cessInput = activeSection.querySelector(".cess-input");
        const salePriceInput = activeSection.querySelector(".sale-price-input");

        if (!rateBeforeGstInput || !gstInput || !cessInput || !salePriceInput) return;

        const salePrice = parseFloat(salePriceInput.value) || 0;
        const gst = parseFloat(gstInput.value) || 0;
        const cess = parseFloat(cessInput.value) || 0;

        if (salePrice > 0) {
            const totalTaxDivisor = 1 + (gst + cess) / 100;
            const rateBeforeGst = totalTaxDivisor > 0 ? salePrice / totalTaxDivisor : 0;
            rateBeforeGstInput.value = rateBeforeGst > 0 ? rateBeforeGst.toFixed(2) : '';
        }
    }
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

    const addItemBtn = document.getElementById("addItemBtn");
    const itemTableBody = document.getElementById("itemTableBody");
    const grandTotalEl = document.getElementById("grandTotal");

    let grandTotal = 0;
    // Invoice tab in dropdown menu: open Sale section and Invoice tab
    if (invoiceTab) {
    }

    // Set Home as default active on page load
    navLinks.forEach(l => l.classList.remove("active"));
    contentSections.forEach(section => section.classList.remove("active"));
    document.querySelector('.nav-link[data-section="home"]').classList.add("active");
    document.getElementById("home").classList.add("active");

    // Only show Home tab content when Home tab is clicked or ESC is pressed
    navLinks.forEach(link => {
        if (link.getAttribute("data-section") === "home") {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove("active"));
                contentSections.forEach(section => section.classList.remove("active"));
                this.classList.add("active");
                document.getElementById("home").classList.add("active");
            });
        }
    });

    // Set Home as default active on page load
    showHome();

    // Centralized function to show the Home section
    function showHome() {
        // Deactivate all nav links and content sections
        navLinks.forEach(l => l.classList.remove("active"));
        contentSections.forEach(section => {
            section.classList.remove("active");
            section.style.display = "none"; // Also hide it
        });

        // Activate Home link and section
        const homeLink = document.querySelector('.nav-link[data-section="home"]');
        const homeSection = document.getElementById("home");
        if (homeLink) homeLink.classList.add("active");
        if (homeSection) {
            homeSection.classList.add("active");
            homeSection.style.display = "block"; // And show it
        }

        // Hide elements specific to other sections, like the tab container or search bar
        document.querySelectorAll('.tab-container').forEach(tc => {
            tc.style.display = 'none';
        });

        if (globalSearchContainer) globalSearchContainer.style.display = 'none';
    }

    // Attach event listeners for Home and Escape key
    const homeLink = document.querySelector('.nav-link[data-section="home"]');
    if (homeLink) {
        homeLink.addEventListener("click", function(e) {
            e.preventDefault();
            showHome();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            showHome();
        }
    });


    // ✅ Navigation Switching
    navLinks.forEach(link => {
        // Avoid re-attaching a listener to the home link
        if (link.getAttribute("data-section") === "home") return;

        link.addEventListener("click", function(e) {
            e.preventDefault();

            // Remove active from all
            navLinks.forEach(l => l.classList.remove("active"));
            contentSections.forEach(section => {
                section.classList.remove("active");
                section.style.display = "none";
            });

            // Add active to clicked link and its section
            this.classList.add("active");
            const sectionId = this.getAttribute("data-section");
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add("active");
                activeSection.style.display = "block";
            }


            // Hide global search if not a sale section
            if (sectionId !== 'sale' && globalSearchContainer) {
                globalSearchContainer.style.display = 'none';
            }

            // If Sale section is opened, show its tab container
            if (sectionId === "sale") {
                const saleTabContainer = activeSection.querySelector('.tab-container');
                if (saleTabContainer) saleTabContainer.style.display = "flex";

                // Set the next available invoice number for B2B sales
                b2bInvoiceManager.setNextInvoiceNumber();
                setDefaultDates();

                if (globalSearchContainer) globalSearchContainer.style.display = 'flex';
            } else if (!activeSection.id.startsWith('sale')) { // Hide for non-sale sections
                document.querySelectorAll('.tab-container').forEach(tc => tc.style.display = 'none');
            }
        });
    });

    // Global Search Logic
    const globalSearchBtn = document.getElementById('globalSearchBtn');
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchBtn && globalSearchInput) {
        globalSearchBtn.addEventListener('click', function() {
            const activeSection = document.querySelector('.content-section.active');
            const searchValue = globalSearchInput.value;
            if (activeSection && searchValue) {
                // In a real app, you would perform the search here.
                // For now, we'll just log it.
                console.log(`Searching for invoice "${searchValue}" in section "${activeSection.id}"`);
                alert(`Searching for invoice "${searchValue}" in section: ${activeSection.id}`);
            }
        });

        // Add event listener for Enter key on the search input
        globalSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent any default form submission
                globalSearchBtn.click(); // Trigger the search button's click event
            }
        });
    }

    // ✅ Create Invoice → Switch to Item tab
    document.body.addEventListener('click', function(e) {
        if (e.target.matches('.create-invoice-btn')) {
            e.target.closest('.content-section.active')?.querySelector('.tab-button[data-tab="items"]')?.click();
        }
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
    // Split GST into SGST and CGST (show percent in table)
    const sgstPercent = gst / 2;
    const cgstPercent = gst / 2;
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
    let sgstAmount = (discountedPrice * sgstPercent) / 100;
    let cgstAmount = (discountedPrice * cgstPercent) / 100;
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
            <td>${sgstPercent}%<br>₹${(sgstAmount*quantity).toFixed(2)}</td>
            <td>${cgstPercent}%<br>₹${(cgstAmount*quantity).toFixed(2)}</td>
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
    
    // When an action is taken that finalizes an invoice (like printing),
    // commit the invoice number so the next one will be incremented.
    document.addEventListener('click', function(e) {
        // Use event delegation for all action buttons that should commit an invoice
        if (e.target.matches('.action-btn')) {
            const buttonText = e.target.textContent.toLowerCase();
            // Define which buttons trigger a commit
            const commitActions = ['print', 'whatsapp'];

            if (commitActions.includes(buttonText)) {
                const activeSection = e.target.closest('.content-section.active');
                if (activeSection && activeSection.id) {
                    const manager = invoiceManagers[activeSection.id];
                    if (manager) {
                        manager.commitCurrentInvoice();
                    }
                }
            }
        }
    });
});
