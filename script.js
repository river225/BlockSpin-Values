// --- Section Navigation ---
const sectionButtons = document.querySelectorAll('.sections-nav button');
const sections = document.querySelectorAll('.section');

sectionButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    sectionButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach(s => s.style.display = 'none');
    sections[index].style.display = 'block';
  });
});

// Show first section by default
sections.forEach((s, i) => s.style.display = i === 0 ? 'block' : 'none');

// --- Search Functionality ---
const searchInput = document.getElementById('search');

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  sections.forEach(section => {
    const cards = section.querySelectorAll('.card');
    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(term) ? 'block' : 'none';
    });
  });
});

// --- Tax Calculator ---
const priceInput = document.getElementById('price');
const taxInput = document.getElementById('tax');
const taxResult = document.getElementById('taxResult');

function calculateTax() {
  const price = parseFloat(priceInput.value) || 0;
  const tax = parseFloat(taxInput.value) || 0;
  const total = price + (price * tax / 100);
  taxResult.textContent = `Total: ${total.toFixed(2)}`;
}

priceInput.addEventListener('input', calculateTax);
taxInput.addEventListener('input', calculateTax);

// --- Floating Buttons (Optional JS if needed for animations) ---
const bottomButtons = document.querySelector('.bottom-buttons');
// Currently static, but you can add hover effects or animations if desired
