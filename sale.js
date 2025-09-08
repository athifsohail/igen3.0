/*document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.inner-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
});*/
document.addEventListener('DOMContentLoaded', () => {
  // Handle Invoice / Item Tab Switching
  const tabs = document.querySelectorAll('.tab');
  const invoiceSection = document.querySelector('.invoice-section');
  const itemSection = document.createElement('div'); // Will add dynamically for now
  itemSection.classList.add('item-section');
  itemSection.style.display = 'none';
  itemSection.innerHTML = `
    <h3>Item Details</h3>
    <table class="item-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="text" placeholder="Item"></td>
          <td><input type="number" value="1" class="qty"></td>
          <td><input type="number" value="0" class="rate"></td>
          <td><input type="number" value="0" class="amount" readonly></td>
          <td><button class="btn small red remove-item">X</button></td>
        </tr>
      </tbody>
    </table>
    <button class="btn blue add-item-btn">+ Add Item</button>
  `;
  invoiceSection.insertAdjacentElement('afterend', itemSection);

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (index === 0) {
        invoiceSection.style.display = 'flex';
        itemSection.style.display = 'none';
      } else {
        invoiceSection.style.display = 'none';
        itemSection.style.display = 'block';
      }
    });
  });

  // Item Table Logic
  const tableBody = itemSection.querySelector('tbody');

  function updateAmounts() {
    let total = 0;
    tableBody.querySelectorAll('tr').forEach(row => {
      const qty = parseFloat(row.querySelector('.qty').value) || 0;
      const rate = parseFloat(row.querySelector('.rate').value) || 0;
      const amount = qty * rate;
      row.querySelector('.amount').value = amount.toFixed(2);
      total += amount;
    });
    document.querySelector('.footer-bar').textContent = `Grand Total: ₹ ${total.toFixed(2)}`;
  }

  function attachRowEvents(row) {
    const qtyInput = row.querySelector('.qty');
    const rateInput = row.querySelector('.rate');
    const removeBtn = row.querySelector('.remove-item');

    qtyInput.addEventListener('input', updateAmounts);
    rateInput.addEventListener('input', updateAmounts);

    removeBtn.addEventListener('click', () => {
      row.remove();
      updateAmounts();
    });
  }

  // Attach events to existing row
  tableBody.querySelectorAll('tr').forEach(attachRowEvents);

  // Add new item row
  const addItemBtn = itemSection.querySelector('.add-item-btn');
  addItemBtn.addEventListener('click', () => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" placeholder="Item"></td>
      <td><input type="number" value="1" class="qty"></td>
      <td><input type="number" value="0" class="rate"></td>
      <td><input type="number" value="0" class="amount" readonly></td>
      <td><button class="btn small red remove-item">X</button></td>
    `;
    tableBody.appendChild(row);
    attachRowEvents(row);
  });

  // Initial total calculation
  updateAmounts();
});

