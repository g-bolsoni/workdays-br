/**
 * Date utility functions for Brazilian date format
 */
const DateUtils = {
  /**
   * Converts Brazilian date format (dd/mm/yyyy) to ISO format (yyyy-mm-dd)
   * @param {string} brazilianDate - Date in dd/mm/yyyy format
   * @returns {string} Date in yyyy-mm-dd format
   */
  brazilianToISO(brazilianDate) {
    const [day, month, year] = brazilianDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },

  /**
   * Converts ISO date format (yyyy-mm-dd) to Brazilian format (dd/mm/yyyy)
   * @param {string} isoDate - Date in yyyy-mm-dd format
   * @returns {string} Date in dd/mm/yyyy format
   */
  isoToBrazilian(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  },

  /**
   * Gets today's date in ISO format (yyyy-mm-dd) for input[type="date"]
   * @returns {string} Today's date in yyyy-mm-dd format
   */
  getTodayISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Gets today's date in Brazilian format
   * @returns {string} Today's date in dd/mm/yyyy format
   */
  getTodayBrazilian() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

const app = document.getElementById('app');
app.innerHTML = `
  <h1>Calculadora de Dias Úteis</h1>
  <p>Calcule datas finais considerando dias úteis e feriados nacionais brasileiros</p>
  <form id="calculatorForm">
    <div class="form-group">
      <label for="startDate">Data Inicial:</label>
      <input type="date" id="startDate" required>
      <div id="dateDisplay" style="margin-top: 8px; font-size: 14px; color: #666;">
        <strong>Data selecionada:</strong> <span id="selectedDate">-</span>
      </div>
    </div>
    <div class="form-group">
      <label for="businessDays">Dias Úteis:</label>
      <input type="number" id="businessDays" min="1" max="500" required>
    </div>
    <button type="submit">Calcular</button>
  </form>
  <div id="result"></div>
  <div id="api-info">
    <h3>Informações da API</h3>
    <p>Status: <span id="api-status">Verificando...</span></p>
  </div>
`;

// Get references to elements
const startDateInput = document.getElementById('startDate');
const selectedDateSpan = document.getElementById('selectedDate');

// Set today's date as default
startDateInput.value = DateUtils.getTodayISO();

// Update display with Brazilian format when date changes
function updateDateDisplay() {
  const isoDate = startDateInput.value;
  if (isoDate) {
    const brazilianDate = DateUtils.isoToBrazilian(isoDate);
    selectedDateSpan.textContent = brazilianDate;
  } else {
    selectedDateSpan.textContent = '-';
  }
}

// Listen for date changes
startDateInput.addEventListener('change', updateDateDisplay);
startDateInput.addEventListener('input', updateDateDisplay);

// Initialize display
updateDateDisplay();

// Check API health on load
async function checkAPIHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    document.getElementById('api-status').textContent = `${data.status} - ${data.service}`;
    document.getElementById('api-status').style.color = 'green';
  } catch (error) {
    document.getElementById('api-status').textContent = 'API Indisponível';
    document.getElementById('api-status').style.color = 'red';
  }
}

// Form submission handler
document.getElementById('calculatorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const isoDate = document.getElementById('startDate').value;
  const businessDays = parseInt(document.getElementById('businessDays').value);
  const resultDiv = document.getElementById('result');

  // Validate that a date was selected
  if (!isoDate) {
    resultDiv.innerHTML = `
      <div class="result-error">
        <h3>Erro de Validação</h3>
        <p>Por favor, selecione uma data inicial</p>
      </div>
    `;
    return;
  }

  // Show loading state
  resultDiv.innerHTML = '<p>Calculando...</p>';

  try {
    const response = await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: isoDate, businessDays })
    });

    const data = await response.json();

    if (data.success) {
      // Convert result to Brazilian format for display
      const brazilianStartDate = DateUtils.isoToBrazilian(data.data.startDate);
      const brazilianEndDate = DateUtils.isoToBrazilian(data.data.endDate);

      resultDiv.innerHTML = `
        <div class="result-success">
          <h3>Resultado do Cálculo</h3>
          <div class="result-fields">
            <div class="field-row">
              <span class="field-label">Data Inicial:</span>
              <span class="field-value">${brazilianStartDate}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Dias Úteis:</span>
              <span class="field-value">${data.data.businessDays}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Data Final:</span>
              <span class="field-value">${brazilianEndDate}</span>
            </div>
          </div>
          <hr style="margin: 15px 0; border: 1px solid #ddd;">
          <p style="font-size: 14px; color: #666;">
            <strong>Observação:</strong> O cálculo considera apenas dias úteis (segunda a sexta-feira)
            e exclui automaticamente os feriados nacionais brasileiros.
          </p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="result-error">
          <h3>Erro</h3>
          <p>${data.message || 'Ocorreu um erro no cálculo'}</p>
        </div>
      `;
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="result-error">
        <h3>Erro de Conexão</h3>
        <p>Falha ao conectar com a API. Tente novamente.</p>
      </div>
    `;
  }
});

// Initialize
checkAPIHealth();
