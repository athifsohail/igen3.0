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

function setupCustomerForm() {
    const sameAsBillingCheckbox = document.getElementById('sameAsBilling');
    const billingAddress = document.getElementById('customerBillingAddress');
    const shippingAddress = document.getElementById('customerShippingAddress');

    if (sameAsBillingCheckbox && billingAddress && shippingAddress) {
        sameAsBillingCheckbox.addEventListener('change', function() {
            if (this.checked) {
                shippingAddress.value = billingAddress.value;
            } else {
                shippingAddress.value = '';
            }
        });
    }
    // Add logic for Save and Cancel buttons if needed
}

let editingCustomerRow = null; // Variable to store the row being edited

function setupGstinUnregisteredLogic() {
    const unregCheckbox = document.getElementById('customerUnreg');
    const gstinInput = document.getElementById('customerGSTIN');

    if (!unregCheckbox || !gstinInput) return;

    unregCheckbox.addEventListener('change', function() {
        if (this.checked) {
            gstinInput.value = 'UNREG';
            gstinInput.readOnly = true;
            gstinInput.style.backgroundColor = '#e9ecef'; // A common "disabled" background color
        } else {
            gstinInput.value = '';
            gstinInput.readOnly = false;
            gstinInput.style.backgroundColor = '#fff';
        }
    });
}

function setupGstinStatePopulation() {
    const gstinInput = document.getElementById('customerGSTIN');
    const stateSelect = document.getElementById('customerState');
    const stateCodeInput = document.getElementById('customerStateCode');

    if (!gstinInput || !stateSelect || !stateCodeInput) return;

    const gstStateMap = {
        '37': { name: 'Andhra Pradesh', code: '37' },
        '12': { name: 'Arunachal Pradesh', code: '12' },
        '18': { name: 'Assam', code: '18' },
        '10': { name: 'Bihar', code: '10' },
        '04': { name: 'Chandigarh', code: '04' },
        '22': { name: 'Chhattisgarh', code: '22' },
        '26': { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
        '07': { name: 'Delhi', code: '07' },
        '30': { name: 'Goa', code: '30' },
        '24': { name: 'Gujarat', code: '24' },
        '06': { name: 'Haryana', code: '06' },
        '02': { name: 'Himachal Pradesh', code: '02' },
        '01': { name: 'Jammu & Kashmir', code: '01' },
        '20': { name: 'Jharkhand', code: '20' },
        '29': { name: 'Karnataka', code: '29' },
        '32': { name: 'Kerala', code: '32' },
        '38': { name: 'Ladakh', code: '38' },
        '31': { name: 'Lakshadweep', code: '31' },
        '23': { name: 'Madhya Pradesh', code: '23' },
        '27': { name: 'Maharashtra', code: '27' },
        '14': { name: 'Manipur', code: '14' },
        '17': { name: 'Meghalaya', code: '17' },
        '15': { name: 'Mizoram', code: '15' },
        '13': { name: 'Nagaland', code: '13' },
        '21': { name: 'Odisha', code: '21' },
        '34': { name: 'Puducherry', code: '34' },
        '03': { name: 'Punjab', code: '03' },
        '08': { name: 'Rajasthan', code: '08' },
        '11': { name: 'Sikkim', code: '11' },
        '33': { name: 'Tamil Nadu', code: '33' },
        '36': { name: 'Telangana', code: '36' },
        '16': { name: 'Tripura', code: '16' },
        '09': { name: 'Uttar Pradesh', code: '09' },
        '05': { name: 'Uttarakhand', code: '05' },
        '19': { name: 'West Bengal', code: '19' },
        '35': { name: 'Andaman & Nicobar Islands', code: '35' }
    };

    gstinInput.addEventListener('input', function() {
        const gstinValue = this.value.trim();
        if (gstinValue.length >= 2) {
            const stateCode = gstinValue.substring(0, 2);
            const stateData = gstStateMap[stateCode];
            if (stateData) {
                stateSelect.value = stateData.name;
                stateCodeInput.value = stateData.code;
            }
        }
    });
}

/**
 * Dynamically populates the route dropdowns in all sale sections.
 * It collects unique routes from the customer table.
 */
function updateSaleRouteDropdowns() {
    const customerTableBody = document.getElementById('customerTableBody');
    if (!customerTableBody) return;

    const routes = new Set();
    // Collect all unique routes from the customer table
    customerTableBody.querySelectorAll('tr').forEach(row => {
        const routeCell = row.querySelector('[data-field="route"]');
        if (routeCell && routeCell.textContent.trim()) {
            routes.add(routeCell.textContent.trim());
        }
    });

    const sortedRoutes = Array.from(routes).sort();

    // Find all route dropdowns in the sale sections
    const routeDropdowns = document.querySelectorAll('#sale select[id^="routeSelect"], #sale-b2c select[id^="routeSelect"], #credit-sale-b2c select[id^="routeSelect"], #delivery-challan select[id^="routeSelect"], #estimation select[id^="routeSelect"]');

    routeDropdowns.forEach(dropdown => {
        // Preserve the first "Select Route" option, clear the rest
        const firstOption = dropdown.options[0];
        dropdown.innerHTML = '';
        dropdown.appendChild(firstOption);

        // Add the dynamically collected routes
        sortedRoutes.forEach(route => {
            dropdown.add(new Option(route, route));
        });
    });
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



    // Initialize customer form logic
    setupCustomerForm();

    setupCustomerAddUpdateLogic();

    // Initialize GSTIN "Unregistered" checkbox logic
    setupGstinUnregisteredLogic();

    // Initialize GSTIN to State auto-population logic
    setupGstinStatePopulation();

    // Initialize "Same as Address" checkbox logic
    setupSameAsAddress();

    // Initialize Customer Excel Import/Export
    setupCustomerExcelHandlers();

    // Initialize E-bill functionality
    setupEbillFeature();

    // Load initial data from the database
    loadCustomers();

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
                        updateSaleRouteDropdowns(); // Update routes when a sale tab is activated
                    }
                }
            } else if (text === 'Add Customer') {
                 // Hide all other sections
                document.querySelectorAll('.content-section').forEach(sec => {
                    sec.classList.remove('active');
                    sec.style.display = 'none';
                });
                // Show the add-customer section
                const addCustomerSection = document.getElementById('add-customer-section');
                if (addCustomerSection) {
                    addCustomerSection.classList.add('active');
                    addCustomerSection.style.display = 'block';
                    updateSaleRouteDropdowns(); // Also update when navigating to customer page
                }
                 // Hide the global search bar
                if (globalSearchContainer) {
                    globalSearchContainer.style.display = 'none';
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
        const hsnCodeInput = section.querySelector('.hsn-code-input');
        const mrpInput = section.querySelector('.mrp-input');

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
        const hsnCode = hsnCodeInput ? hsnCodeInput.value : '';
        const mrp = mrpInput ? mrpInput.value : '';

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
        // Store raw data on the row for easy editing
        row.dataset.itemName = itemName;
        row.dataset.barcode = barcode;
        row.dataset.quantity = quantity;
        row.dataset.salePrice = salePriceInput.value;
        row.dataset.discount = discount;
        row.dataset.discountIsValue = discountIsValue;
        row.dataset.gst = gst;
        row.dataset.cess = cess;
        row.dataset.rateBeforeGst = rateBeforeGst;
        row.dataset.perPieceChecked = perPieceChecked;
        row.dataset.hsnCode = hsnCode;
        row.dataset.mrp = mrp;

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
            const totalCell = r.cells[r.cells.length - 2]; // Second to last cell is Total
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
        gstInput.value = '';    document.body.addEventListener('keydown', function(e) {
            // This condition checks if the 'Enter' key was pressed
            // AND if the cursor was in a barcode input field.
            if (e.key === 'Enter' && e.target.matches('.barcode-input')) {
                // ... code to look up the item and add it to the invoice ...
            }
        });
        
        cessInput.value = '';
        rateBeforeGstInput.value = '';
        perPieceCheckbox.checked = false;
        discountCheckbox.checked = false;
        itemNameInput.focus(); // Move cursor back to item name
    });

    // Delegated event listener for Edit and Delete buttons
    document.body.addEventListener('click', function(e) {
        const target = e.target;

        // Handle Delete Button
        if (target.closest('.delete-item-btn')) {
            e.preventDefault();
            const row = target.closest('tr');
            if (!row) return;

            // Find the active section to update its specific totals
            const activeSection = row.closest('.content-section.active');
            if (!activeSection) return;

            // Ask for confirmation before deleting
            if (confirm('Are you sure you want to delete this item?')) {
                // Remove the row from the DOM
                row.remove();

                // Recalculate totals and sync tables for the current section
                updateTotalsAndSyncTables(activeSection);
            }
        }

        // Handle Edit Button (Full Implementation)
        if (target.closest('.edit-item-btn')) {
            e.preventDefault();
            const row = target.closest('tr');
            if (!row) return;

            const activeSection = row.closest('.content-section.active');
            if (!activeSection) return;
            
            // --- Populate form from row data attributes ---
            const itemNameInput = activeSection.querySelector('.item-name-input');
            const barcodeInput = activeSection.querySelector('.barcode-input');
            const quantityInput = activeSection.querySelector('.quantity-input');
            const salePriceInput = activeSection.querySelector('.sale-price-input');
            const discountInput = activeSection.querySelector('.discount-input');
            const discountCheckbox = activeSection.querySelector('.discount-checkbox');
            const gstInput = activeSection.querySelector('.gst-input');
            const cessInput = activeSection.querySelector('.cess-input');
            const rateBeforeGstInput = activeSection.querySelector('.rate-before-gst-input');
            const perPieceCheckbox = activeSection.querySelector('.per-piece-checkbox');
            const hsnCodeInput = activeSection.querySelector('.hsn-code-input');
            const mrpInput = activeSection.querySelector('.mrp-input');

            if (itemNameInput) itemNameInput.value = row.dataset.itemName || '';
            if (barcodeInput) barcodeInput.value = row.dataset.barcode || '';
            if (quantityInput) quantityInput.value = row.dataset.quantity || '1';
            if (salePriceInput) salePriceInput.value = row.dataset.salePrice || '';
            if (discountInput) discountInput.value = row.dataset.discount || '0';
            if (discountCheckbox) discountCheckbox.checked = (row.dataset.discountIsValue === 'true');
            if (gstInput) gstInput.value = row.dataset.gst || '';
            if (cessInput) cessInput.value = row.dataset.cess || '';
            if (rateBeforeGstInput) rateBeforeGstInput.value = row.dataset.rateBeforeGst || '';
            if (perPieceCheckbox) perPieceCheckbox.checked = (row.dataset.perPieceChecked === 'true');
            if (hsnCodeInput) hsnCodeInput.value = row.dataset.hsnCode || '';
            if (mrpInput) mrpInput.value = row.dataset.mrp || '';

            // --- Remove the row and update totals ---
            row.remove();
            updateTotalsAndSyncTables(activeSection);

            // --- Focus the first input for a good UX ---
            if (itemNameInput) itemNameInput.focus();
        }

        // Handle Customer Delete Button
        if (target.closest('.delete-customer-btn')) {
            e.preventDefault();
            const row = target.closest('tr');
            if (!row) return;

            if (confirm('Are you sure you want to delete this customer?')) {
                row.remove();
                // In a real app, you would also delete this from localStorage or a database.
            }
        }

        // Handle Customer Edit Button
        if (target.closest('.edit-customer-btn')) {
            e.preventDefault();
            const row = target.closest('tr');
            if (!row) return;

            // Get data from the row's cells
            const name = row.querySelector('[data-field="name"]')?.textContent || '';
            const address = row.querySelector('[data-field="address"]')?.textContent || '';
            const state = row.querySelector('[data-field="state"]')?.textContent || '';
            const gstin = row.querySelector('[data-field="gstin"]')?.textContent || '';
            const stateCode = row.querySelector('[data-field="stateCode"]')?.textContent || '';
            const route = row.querySelector('[data-field="route"]')?.textContent || '';
            const mobile = row.querySelector('[data-field="mobile"]')?.textContent || '';
            const email = row.querySelector('[data-field="email"]')?.textContent || '';
            const aadhar = row.querySelector('[data-field="aadhar"]')?.textContent || '';

            // Populate the form fields at the top of the page
            document.getElementById('customerName').value = name;
            document.getElementById('customerGSTIN').value = gstin;
            document.getElementById('customerAddress').value = address;
            document.getElementById('customerMobile').value = mobile;
            document.getElementById('customerAadhar').value = aadhar;
            document.getElementById('customerEmail').value = email;
            document.getElementById('customerState').value = state;
            document.getElementById('customerStateCode').value = stateCode;
            document.getElementById('customerRoute').value = route;

            // Handle checkboxes
            const unregCheckbox = document.getElementById('customerUnreg');
            if (gstin.toUpperCase() === 'UNREG') {
                unregCheckbox.checked = true;
                unregCheckbox.dispatchEvent(new Event('change')); // Trigger the logic to disable input
            } else {
                unregCheckbox.checked = false;
                unregCheckbox.dispatchEvent(new Event('change'));
            }
            // Note: 'Is Sez' checkbox logic would be added here if its state was saved.

            // Change button text to "Update" and store the row being edited
            const updateBtn = document.getElementById('updateCustomerBtn');
            updateBtn.textContent = 'Update';
            editingCustomerRow = row;

            // Scroll to the top of the page to see the form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

function setupCustomerAddUpdateLogic() {
    const updateBtn = document.getElementById('updateCustomerBtn');
    if (!updateBtn) return;

    updateBtn.addEventListener('click', function() {
        // Read all values from the form
        const name = document.getElementById('customerName').value.trim();
        const gstin = document.getElementById('customerGSTIN').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const mobile = document.getElementById('customerMobile').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const state = document.getElementById('customerState').value;
        const stateCode = document.getElementById('customerStateCode').value.trim();
        const route = document.getElementById('customerRoute').value.trim();
        const aadhar = document.getElementById('customerAadhar').value.trim();

        const isUnregistered = document.getElementById('customerUnreg').checked;

        // --- Validation Logic ---
        if (!name) {
            alert('Customer Name is mandatory.');
            return;
        }
        if (!address) {
            alert('Customer Address is mandatory.');
            return;
        }

        if (isUnregistered) {
            // For unregistered customers, name and address are already checked.
        } else {
            // For registered customers, GSTIN is also mandatory.
            if (!gstin || gstin.toUpperCase() === 'UNREG') {
                alert('GSTIN is mandatory for registered customers.');
                return;
            }
        }

        if (editingCustomerRow) {
            // --- UPDATE MODE ---
            editingCustomerRow.querySelector('[data-field="name"]').textContent = name;
            editingCustomerRow.querySelector('[data-field="gstin"]').textContent = gstin;
            editingCustomerRow.querySelector('[data-field="address"]').textContent = address;
            editingCustomerRow.querySelector('[data-field="mobile"]').textContent = mobile;
            editingCustomerRow.querySelector('[data-field="email"]').textContent = email;
            editingCustomerRow.querySelector('[data-field="state"]').textContent = state;
            editingCustomerRow.querySelector('[data-field="stateCode"]').textContent = stateCode;
            editingCustomerRow.querySelector('[data-field="route"]').textContent = route;
            editingCustomerRow.querySelector('[data-field="aadhar"]').textContent = aadhar;
            
            // In a real app, you would send a PUT/PATCH request to the server here
            // to update the customer in the database.
            alert('Customer updated on the page. Database update not yet implemented.');

        } else {
            // --- ADD MODE (Send to Server) ---
            const customerData = { name, gstin, address, mobile, email, state, stateCode, route, aadhar };

            fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    // Successfully added, now reload the customer list from the server
                    loadCustomers(); 
                }
            })
            .catch(error => console.error('Error adding customer:', error));
        }

        // --- RESET AND CLEANUP ---
        clearCustomerForm();
        updateBtn.textContent = 'Add';
        editingCustomerRow = null;
        // updateSaleRouteDropdowns(); // This will be called by loadCustomers
    });
}

/**
* Fetches customers from the server and populates the table.
*/
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const result = await response.json();

        if (result.error) {
            console.error('Failed to load customers:', result.error);
            return;
        }

        const customerTableBody = document.getElementById('customerTableBody');
        customerTableBody.innerHTML = ''; // Clear existing rows

        result.data.forEach(customer => {
            const customerTableBody = document.getElementById('customerTableBody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td data-field="name">${customer.name || ''}</td>
                <td data-field="address">${customer.address || ''}</td>
                <td data-field="state">${customer.state || ''}</td>
                <td data-field="route">${customer.route || ''}</td>
                <td data-field="stateCode">${customer.stateCode || ''}</td>
                <td data-field="gstin">${customer.gstin || ''}</td>
                <td data-field="mobile">${customer.mobile || ''}</td>
                <td data-field="email">${customer.email || ''}</td>
                <td data-field="aadhar">${customer.aadhar || ''}</td>
                <td class="actions-column">
                    <button class="edit-customer-btn" title="Edit"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1lZGl0Ij48cGF0aCBkPSJNMTIgMjBIOS41MjVDNi40OCAyMCA0IDE3LjUyIDQgMTQuNDhWOS41MkM0IDYuNDggNi40OCA0IDkuNTIgNGgxLjQ0TTguNSA2LjVMMTMuNSA2LjUiLz48cGF0aCBkPSJNMTggMTMuNzZWMTguNUMxOCAyMC40MyAxNi40MyAyMiAxNC41IDIySDkuNUM3LjU3IDIyIDYgMjAuNDMgNiAxOC41VjkuNUM2IDcuNTcgNy41NyA2IDkuNSA2SDE0Ii8+PHBhdGggZD0iTTE2IDRMMjAgOCIvPjxwYXRoIGQ9Ik0yMS4zOCA2LjYyTDE3LjM4IDExLjYyQzE3LjA0IDExLjk2IDE2LjYxIDEyLjE4IDE2LjE1IDEyLjIyTDEzIDEyLjk5TDEzLjc3IDkuODNDMTMuODEgOS4zOCAxNC4wNCA4Ljk1IDE0LjM4IDguNjJMMTguMzggMy42MkMyMC4wOSAxLjkxIDIyLjA5IDEuOTEgMjIuMzggMi4yQzIzLjA5IDIuOTEgMjMuMDkgNC45MSAyMS4zOCA2LjYyWiIvPjwvc3ZnPg==" alt="Edit"></button>
                    <button class="delete-customer-btn" title="Delete"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci10cmFzaC0yIj48cG9seWxpbmUgcG9pbnRzPSIzIDYgNSA2IDIxIDYiLz48cGF0aCBkPSJNMTkgNnYxNGExIDEgMCAwIDEtMSAxaC0xMGExIDEgMCAwIDEtMS0xVjZtMyAwViRhMSAxIDAgMCAxIDEtMWg0YTEgMSAwIDAgMSAxIDF2MiIvPjxsaW5lIHgxPSIxMCIgeTE9IjExIiB4Mj0iMTAiIHkyPSIxNyIvPjxsaW5lIHgxPSIxNCIgeTE9IjExIiB4Mj0iMTQiIHkyPSIxNyIvPjwvc3ZnPg==" alt="Delete"></button>
                </td>
            `;
            customerTableBody.appendChild(newRow);
        });

        updateSaleRouteDropdowns(); // Now that customers are loaded, update the route dropdowns
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerGSTIN').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerMobile').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerStateCode').value = '';
    document.getElementById('customerAadhar').value = '';
    document.getElementById('customerRoute').value = '';
    document.getElementById('customerUnreg').checked = false;
    document.getElementById('customerIsSez').checked = false;
    document.getElementById('customerGSTIN').readOnly = false;
    document.getElementById('customerGSTIN').style.backgroundColor = '#fff';
}

function setupCustomerExcelHandlers() {
    const downloadBtn = document.getElementById('downloadFormatBtn');
    const importBtn = document.getElementById('importCustomersBtn');
    const fileInput = document.getElementById('importFile');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Define headers for the Excel file
            const headers = [
                "Name", "Address", "State", "Route", "State Code", 
                "GSTIN", "Mobile", "Email", "Aadhar"
            ];
            
            // Create a worksheet with only the headers
            const ws = XLSX.utils.aoa_to_sheet([headers]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Customer_Format");

            // Trigger the download
            XLSX.writeFile(wb, "Customer_Import_Format.xlsx");
        });
    }

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const customerTableBody = document.getElementById('customerTableBody');
                json.forEach(customer => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td data-field="name">${customer.Name || ''}</td>
                        <td data-field="address">${customer.Address || ''}</td>
                        <td data-field="state">${customer.State || ''}</td>
                        <td data-field="route">${customer.Route || ''}</td>
                        <td data-field="stateCode">${customer['State Code'] || ''}</td>
                        <td data-field="gstin">${customer.GSTIN || ''}</td>
                        <td data-field="mobile">${customer.Mobile || ''}</td>
                        <td data-field="email">${customer.Email || ''}</td>
                        <td data-field="aadhar">${customer.Aadhar || ''}</td>
                        <td class="actions-column">
                            <button class="edit-customer-btn" title="Edit"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1lZGl0Ij48cGF0aCBkPSJNMTIgMjBIOS41MjVDNi40OCAyMCA0IDE3LjUyIDQgMTQuNDhWOS41MkM0IDYuNDggNi40OCA0IDkuNTIgNGgxLjQ0TTguNSA2LjVMMTMuNSA2LjUiLz48cGF0aCBkPSJNMTggMTMuNzZWMTguNUMxOCAyMC40MyAxNi40MyAyMiAxNC41IDIySDkuNUM3LjU3IDIyIDYgMjAuNDMgNiAxOC41VjkuNUM2IDcuNTcgNy41NyA2IDkuNSA2SDE0Ii8+PHBhdGggZD0iTTE2IDRMMjAgOCIvPjxwYXRoIGQ9Ik0yMS4zOCA2LjYyTDE3LjM4IDExLjYyQzE3LjA0IDExLjk2IDE2LjYxIDEyLjE4IDE2LjE1IDEyLjIyTDEzIDEyLjk5TDEzLjc3IDkuODNDMTMuODEgOS4zOCAxNC4wNCA4Ljk1IDE0LjM4IDguNjJMMTguMzggMy42MkMyMC4wOSAxLjkxIDIyLjA5IDEuOTEgMjIuMzggMi4yQzIzLjA5IDIuOTEgMjMuMDkgNC45MSAyMS4zOCA2LjYyWiIvPjwvc3ZnPg==" alt="Edit"></button>
                            <button class="delete-customer-btn" title="Delete"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci10cmFzaC0yIj48cG9seWxpbmUgcG9pbnRzPSIzIDYgNSA2IDIxIDYiLz48cGF0aCBkPSJNMTkgNnYxNGExIDEgMCAwIDEtMSAxaC0xMGExIDEgMCAwIDEtMS0xVjZtMyAwViRhMSAxIDAgMCAxIDEtMWg0YTEgMSAwIDAgMSAxIDF2MiIvPjxsaW5lIHgxPSIxMCIgeTE9IjExIiB4Mj0iMTAiIHkyPSIxNyIvPjxsaW5lIHgxPSIxNCIgeTE9IjExIiB4Mj0iMTQiIHkyPSIxNyIvPjwvc3ZnPg==" alt="Delete"></button>
                        </td>
                    `;
                    customerTableBody.appendChild(newRow);
                });
                updateSaleRouteDropdowns(); // Refresh routes in sale tabs
                alert(`${json.length} customers imported successfully!`);
            };
            reader.readAsArrayBuffer(file);

            // Reset file input to allow importing the same file again
            e.target.value = '';
        });
    }
}

function setupEbillFeature() {
    // Use event delegation on the body to handle all e-bill checkboxes
    document.body.addEventListener('change', function(e) {
        if (e.target.matches('.e-bill-checkbox')) {
            const checkbox = e.target;
            const activeSection = checkbox.closest('.content-section.active');
            if (!activeSection) return;

            const jsonUploadContainer = activeSection.querySelector('.json-upload-container');
            if (jsonUploadContainer) {
                jsonUploadContainer.style.display = checkbox.checked ? 'flex' : 'none';
            }
        }

        if (e.target.matches('.json-file-input')) {
            const fileInput = e.target;
            const file = fileInput.files[0];
            if (!file) return;

            const activeSection = fileInput.closest('.content-section.active');
            if (!activeSection) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    const irn = jsonContent.Irn; // Case-sensitive 'Irn'

                    const irnDisplay = activeSection.querySelector('.irn-display');
                    if (irnDisplay) {
                        irnDisplay.value = irn || 'IRN not found in file';
                    }
                } catch (error) {
                    alert('Failed to parse JSON file. Please ensure it is a valid JSON.');
                    console.error("JSON Parsing Error:", error);
                }
            };
            reader.readAsText(file);
        }
    });
}

    // --- Barcode Scanning Simulation ---
    // In a real app, this would come from a database.
    const itemDatabase = {
        '8905166471218': { name: 'Sample Item A', price: 150.00, gst: 18, cess: 0 },
        '987654321098': { name: 'Sample Item B', price: 275.50, gst: 12, cess: 0 },
        '112233445566': { name: 'Luxury Good C', price: 1200.00, gst: 28, cess: 5 },
    };

    let barcodeScanTimer = null;
    document.body.addEventListener('input', function(e) {
        if (e.target.matches('.barcode-input')) {
            clearTimeout(barcodeScanTimer); // Reset timer on each input

            barcodeScanTimer = setTimeout(() => {
                const barcodeInput = e.target;
                const barcodeValue = barcodeInput.value.trim();
                const activeSection = barcodeInput.closest('.content-section.active');

                if (barcodeValue && activeSection) {
                    const itemData = itemDatabase[barcodeValue];

                    if (itemData) {
                        // Found the item, now populate the fields in the active section
                        activeSection.querySelector('.item-name-input').value = itemData.name;
                        activeSection.querySelector('.sale-price-input').value = itemData.price.toFixed(2);
                        activeSection.querySelector('.gst-input').value = itemData.gst;
                        activeSection.querySelector('.cess-input').value = itemData.cess;

                        // Trigger calculation and then click the "Add" button
                        updateRateBeforeGst(activeSection);
                        activeSection.querySelector('.add-item-btn')?.click();
                    } else {
                        // Only show alert if the input is not empty, to avoid alerts on clear
                        if (barcodeInput.value) {
                            alert(`Item with barcode "${barcodeValue}" not found.`);
                        }
                    }
                }
            }, 1150); // Wait 250ms (1/4 sec) after the last character is typed
        }
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

        if (!itemTableBody || !grandTotalEl || !grandTotalTabAmount) return;

        let newGrandTotal = 0;
        itemTableBody.querySelectorAll('tr').forEach(r => {
            // The total cell is the second to last one (before Actions)
            const totalCell = r.cells[r.cells.length - 2];
            newGrandTotal += parseFloat(totalCell.textContent.replace('₹', '')) || 0;
        });

        // Update grand total displays
        grandTotalEl.textContent = newGrandTotal.toFixed(2);
        grandTotalTabAmount.textContent = newGrandTotal.toFixed(2);
        
        // Sync the invoice table with the main item table
        if (invoiceItemsTableBody)
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
        if (e.key === 'Enter' && e.target.matches('.sale-price-input, .rate-before-gst-input, .quantity-input, .item-name-input, .discount-input')) {
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
        // --- Customer Page Search Logic ---
    const customerSearchInput = document.getElementById('customerSearchInput');
    const customerSearchBtn = document.getElementById('customerSearchBtn');
    const customerTableBody = document.getElementById('customerTableBody');

    function filterCustomerTable() {
        if (!customerSearchInput || !customerTableBody) return;

        const searchTerm = customerSearchInput.value.toLowerCase().trim();
        const rows = customerTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const nameCell = row.querySelector('[data-field="name"]');
            const gstinCell = row.querySelector('[data-field="gstin"]');
            const mobileCell = row.querySelector('[data-field="mobile"]');

            const name = nameCell ? nameCell.textContent.toLowerCase() : '';
            const gstin = gstinCell ? gstinCell.textContent.toLowerCase() : '';
            const mobile = mobileCell ? mobileCell.textContent.toLowerCase() : '';

            if (name.includes(searchTerm) || gstin.includes(searchTerm) || mobile.includes(searchTerm)) {
                row.style.display = ''; // Show the row
            } else {
                row.style.display = 'none'; // Hide the row
            }
        });
    }

    if (customerSearchBtn) {
        customerSearchBtn.addEventListener('click', filterCustomerTable);
    }
    if (customerSearchInput) {
        customerSearchInput.addEventListener('keyup', filterCustomerTable); // Live search
    }
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
