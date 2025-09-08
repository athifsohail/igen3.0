document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.getElementById('contentArea');
  const links = document.querySelectorAll('.tab-link');
  // Existing click handler for loading tabs
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Remove active class from all links
      links.forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.menu > li > a').forEach(parent => parent.classList.remove('active'));

      // Add active class to clicked link
      link.classList.add('active');

      // Add active to parent dropdown if exists
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        parentDropdown.querySelector('a').classList.add('active');
      }

      const page = link.getAttribute('data-tab');
      loadTabContent(page);
    });
  });

  async function loadTabContent(page) {
  try {
    contentArea.innerHTML = "<p>Loading...</p>";
    let htmlFile = page === 'b2b' ? 'b2b' : page;
    const response = await fetch(`${htmlFile}.html`);
    if (!response.ok) throw new Error(`Failed to load ${htmlFile}.html (Status: ${response.status})`);
    const html = await response.text();
    contentArea.innerHTML = html;

    // Remove old CSS and JS
    document.querySelectorAll('link[data-dynamic]').forEach(el => el.remove());
    document.querySelectorAll('script[data-dynamic]').forEach(el => el.remove());

    // Load CSS and JS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${htmlFile}.css`;
    cssLink.setAttribute('data-dynamic', 'true');
    document.head.appendChild(cssLink);

    const scriptEl = document.createElement('script');
    scriptEl.src = `${htmlFile}.js`;
    scriptEl.setAttribute('data-dynamic', 'true');
    document.body.appendChild(scriptEl);
  } catch (err) {
    console.error(err);
    contentArea.innerHTML = `<p>Error loading ${page}. Check console for details.</p>`;
  }
}

  // Load default page (Sale B2B)
  loadTabContent('home/home');

});
document.addEventListener("DOMContentLoaded", function () {
    const shippingToggle = document.getElementById("shippingToggle");
    const shippingSection = document.getElementById("shippingAddressSection");

    if (shippingToggle) {
        shippingToggle.addEventListener("change", function () {
            shippingSection.style.display = this.checked ? "block" : "none";
        });
    }
});
