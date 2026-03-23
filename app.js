// Precios Definidos Default
const defaultPrices = {
    cat1: {
        "32": 19.00, "36": 19.00, "40": 20.00, "48": 23.00,
        "60": 25.00, "70": 17.00, "84": 14.00
    },
    cat2: {
        "36": 11.00, "40": 11.00, "48": 11.00,
        "60": 11.00, "70": 9.00, "84": 5.00
    },
    others: {
        "LACRADO": 4.00, "TERCERA": 1.00, "ODD": 17.00,
        "PAREJO": 5.00, "MEDIANO": 5.00, "DESECHO": 0.00, "PICADO": 1.00
    }
};

const mainCalibersCat1 = ["32", "36", "40", "48", "60", "70", "84"];
const mainCalibersCat2 = ["36", "40", "48", "60", "70", "84"];
const otherConcepts = ["LACRADO", "TERCERA", "ODD", "PAREJO", "MEDIANO", "DESECHO", "PICADO"];

let currentPrices = JSON.parse(JSON.stringify(defaultPrices));
let isModeB = false;

// DOM Elements - General
const modeSwitch = document.getElementById("modeSwitch");
const labelPercent = document.getElementById("labelPercent");
const labelKg = document.getElementById("labelKg");
const modeDesc = document.getElementById("modeDescription");
const dynamicFormArea = document.getElementById("dynamicFormArea");

const btnCalculate = document.getElementById("btnCalculate");
const finalPriceEl = document.getElementById("finalPrice");
const totalMoneyValueEl = document.getElementById("totalMoneyValue");
const totalDivisorValueEl = document.getElementById("totalDivisorValue");
const baseDivisorTypeEl = document.getElementById("baseDivisorType");
const thAmountEl = document.getElementById("thAmount");
const resultsBody = document.getElementById("resultsBody");

// DOM Elements - Manual Price Modal
const modal = document.getElementById("priceModal");
const btnEditPrices = document.getElementById("btnEditPrices");
const spanClose = document.getElementsByClassName("close-btn")[0];
const btnSavePrices = document.getElementById("btnSavePrices");
const priceEditorDiv = document.getElementById("priceEditor");

// DOM Elements - Excel Modal
const excelModal = document.getElementById("excelModal");
const btnUploadExcel = document.getElementById("btnUploadExcel");
const excelCloseBtn = document.getElementsByClassName("excel-close-btn")[0];
const excelFileInput = document.getElementById("excelFileInput");
const fileNameDisplay = document.getElementById("fileNameDisplay");
const btnProcessExcel = document.getElementById("btnProcessExcel");

let loadedExcelData = null;

function init() {
    renderForm();
    buildPriceEditor();
    setupEventListeners();
}

function renderForm() {
    let html = "";
    if (!isModeB) {
        // MODO A: Porcentajes
        html += `
            <div class="form-group highlight-group">
                <label for="globalCat2">Porcentaje Global Categoría 2 (%):</label>
                <input type="number" id="globalCat2" step="any" placeholder="Ej: 15">
                <small>Categoría 1 será calculado automáticamente.</small>
            </div>
            <hr>
            <h2>Distribución de Calibres (%)</h2>
            <div class="calibers-grid">
        `;
        mainCalibersCat1.forEach(c => {
            html += `
                <div class="form-group">
                    <label>Calibre ${c}</label>
                    <input type="number" id="cal_${c}" step="any" placeholder="0">
                </div>
            `;
        });
        html += `</div><hr><h2>Otros Conceptos (%)</h2><div class="calibers-grid">`;
        otherConcepts.forEach(o => {
            html += `
                <div class="form-group">
                    <label>${o}</label>
                    <input type="number" id="oth_${o}" step="any" placeholder="0">
                </div>
            `;
        });
        html += `</div>`;
    } else {
        // MODO B: Kg exactos
        html += `
            <h2>Kilos Exactos (Categoría 1)</h2>
            <div class="calibers-grid">
        `;
        mainCalibersCat1.forEach(c => {
            html += `
                <div class="form-group">
                    <label>${c} CAT 1 USA</label>
                    <input type="number" id="cat1_${c}" step="any" placeholder="0">
                </div>
            `;
        });
        html += `</div><hr><h2>Kilos Exactos (Categoría 2)</h2><div class="calibers-grid">`;
        mainCalibersCat2.forEach(c => {
            html += `
                <div class="form-group">
                    <label>${c} CAT 2 USA</label>
                    <input type="number" id="cat2_${c}" step="any" placeholder="0">
                </div>
            `;
        });
        html += `</div><hr><h2>Otros Conceptos (Kg)</h2><div class="calibers-grid">`;
        otherConcepts.forEach(o => {
            html += `
                <div class="form-group">
                    <label>${o}</label>
                    <input type="number" id="oth_${o}" step="any" placeholder="0">
                </div>
            `;
        });
        html += `</div>`;
    }

    dynamicFormArea.innerHTML = html;
}

function buildPriceEditor() {
    let html = "";
    html += `<div class="price-section"><h3>Categoría 1</h3><div class="price-grid">`;
    mainCalibersCat1.forEach(c => {
        let val = currentPrices.cat1[c] || 0;
        html += `<div class="form-group"><label>Cal ${c}</label><input type="number" id="edit_cat1_${c}" step="any" value="${val}"></div>`;
    });
    html += `</div></div>`;
    
    html += `<div class="price-section"><h3>Categoría 2</h3><div class="price-grid">`;
    mainCalibersCat2.forEach(c => {
        let val = currentPrices.cat2[c] || 0;
        html += `<div class="form-group"><label>Cal ${c}</label><input type="number" id="edit_cat2_${c}" step="any" value="${val}"></div>`;
    });
    html += `</div></div>`;
    
    html += `<div class="price-section"><h3>Otros Conceptos</h3><div class="price-grid">`;
    otherConcepts.forEach(o => {
        let val = currentPrices.others[o] || 0;
        html += `<div class="form-group"><label>${o}</label><input type="number" id="edit_oth_${o}" step="any" value="${val}"></div>`;
    });
    html += `</div></div>`;

    priceEditorDiv.innerHTML = html;
}

function setupEventListeners() {
    modeSwitch.addEventListener("change", (e) => {
        isModeB = e.target.checked;
        if (isModeB) {
            labelPercent.classList.remove("active");
            labelKg.classList.add("active");
            modeDesc.innerText = "Kilos exactos obtenidos tras muestra directa (sumatoria como base).";
            thAmountEl.innerText = "Cantidad (Kg)";
            baseDivisorTypeEl.innerText = "Kg";
        } else {
            labelPercent.classList.add("active");
            labelKg.classList.remove("active");
            modeDesc.innerText = "Porcentajes generales por calibre (división automática).";
            thAmountEl.innerText = "Cantidad (%)";
            baseDivisorTypeEl.innerText = "%";
        }
        renderForm();
    });

    btnCalculate.addEventListener("click", calculateEstimate);

    // Manual Modal Events
    btnEditPrices.addEventListener("click", () => {
        buildPriceEditor();
        modal.style.display = "block";
    });
    spanClose.addEventListener("click", () => { modal.style.display = "none"; });
    
    // Excel Modal Events
    btnUploadExcel.addEventListener("click", () => {
        fileNameDisplay.innerText = "Ej. Precios_Semana.xlsx";
        excelFileInput.value = "";
        btnProcessExcel.disabled = true;
        excelModal.style.display = "block";
    });
    excelCloseBtn.addEventListener("click", () => { excelModal.style.display = "none"; });
    
    window.addEventListener("click", (event) => {
        if (event.target == modal) modal.style.display = "none";
        if (event.target == excelModal) excelModal.style.display = "none";
    });

    // Save Manual Prices
    btnSavePrices.addEventListener("click", () => {
        mainCalibersCat1.forEach(c => {
            currentPrices.cat1[c] = parseFloat(document.getElementById(`edit_cat1_${c}`).value) || 0;
        });
        mainCalibersCat2.forEach(c => {
            currentPrices.cat2[c] = parseFloat(document.getElementById(`edit_cat2_${c}`).value) || 0;
        });
        otherConcepts.forEach(o => {
            currentPrices.others[o] = parseFloat(document.getElementById(`edit_oth_${o}`).value) || 0;
        });
        modal.style.display = "none";
        alert("Precios guardados.");
    });

    // Excel File Change
    excelFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.innerText = `Archivo seleccionado: ${file.name}`;
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            loadedExcelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            btnProcessExcel.disabled = false;
        }
    });

    // Process Excel Data
    btnProcessExcel.addEventListener("click", () => {
        if (!loadedExcelData || loadedExcelData.length === 0) {
            alert("No se pudieron leer datos del archivo Excel.");
            return;
        }

        let actualizados = 0;
        loadedExcelData.forEach(row => {
            let keys = Object.keys(row);
            let conceptoKey = keys.find(k => k.toLowerCase().includes("concepto"));
            let precioKey = keys.find(k => k.toLowerCase().includes("precio"));

            if (!conceptoKey || !precioKey) return; 

            let concepto = String(row[conceptoKey]).trim().toUpperCase();
            let precio = parseFloat(row[precioKey]);

            if (isNaN(precio)) return;

            // Match Logic Map
            if (concepto.includes("CAT 1")) {
                let cal = concepto.split(" ")[0];
                if (currentPrices.cat1[cal] !== undefined) {
                    currentPrices.cat1[cal] = precio;
                    actualizados++;
                }
            } else if (concepto.includes("CAT 2")) {
                let cal = concepto.split(" ")[0];
                if (currentPrices.cat2[cal] !== undefined) {
                    currentPrices.cat2[cal] = precio;
                    actualizados++;
                }
            } else {
                let matched = false;
                otherConcepts.forEach(o => {
                    if (concepto.includes(o)) {
                        currentPrices.others[o] = precio;
                        matched = true;
                    }
                });
                if(matched) actualizados++;
            }
        });

        alert(`¡Éxito! Se actualizaron ${actualizados} precios basado en el archivo Excel.`);
        excelModal.style.display = "none";
    });
}

function formatCurrency(val) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
}

function formatNumber(val) {
    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(val);
}

function calculateEstimate() {
    let resultsHtml = "";
    let sumaTotalValores = 0;
    let totalKgMuestreados = 0;

    if (!isModeB) {
        // MODO A
        let globalCat2 = parseFloat(document.getElementById("globalCat2").value) || 0;
        let factorCat2 = globalCat2 / 100;
        let factorCat1 = 1 - factorCat2;
        let totalAccounted = 0;

        mainCalibersCat1.forEach(c => {
            let pVal = parseFloat(document.getElementById(`cal_${c}`).value) || 0;
            if (pVal !== 0) {
                totalAccounted += pVal;
                // Cat 1
                let vCat1 = pVal * factorCat1;
                let pCat1 = currentPrices.cat1[c] || 0;
                let totalC1 = vCat1 * pCat1;
                sumaTotalValores += totalC1;
                resultsHtml += `<tr><td>${c} CAT 1 USA</td><td>${formatNumber(vCat1)}%</td><td>${formatCurrency(pCat1)}</td><td>${formatCurrency(totalC1)}</td></tr>`;
                
                // Cat 2
                if (mainCalibersCat2.includes(c)) {
                    let vCat2 = pVal * factorCat2;
                    let pCat2 = currentPrices.cat2[c] || 0;
                    let totalC2 = vCat2 * pCat2;
                    sumaTotalValores += totalC2;
                    resultsHtml += `<tr><td>${c} CAT 2 USA</td><td>${formatNumber(vCat2)}%</td><td>${formatCurrency(pCat2)}</td><td>${formatCurrency(totalC2)}</td></tr>`;
                }
            }
        });

        otherConcepts.forEach(o => {
            let val = parseFloat(document.getElementById(`oth_${o}`).value) || 0;
            if (val !== 0) {
                totalAccounted += val;
                let priceOther = currentPrices.others[o] || 0;
                let totalO = val * priceOther;
                sumaTotalValores += totalO;
                resultsHtml += `<tr><td>${o}</td><td>${formatNumber(val)}%</td><td>${formatCurrency(priceOther)}</td><td>${formatCurrency(totalO)}</td></tr>`;
            }
        });

        let baseDivisor = 100.00;
        let resultado = sumaTotalValores / baseDivisor;

        resultsBody.innerHTML = resultsHtml;
        totalMoneyValueEl.innerText = formatCurrency(sumaTotalValores);
        totalDivisorValueEl.innerText = formatNumber(baseDivisor);
        finalPriceEl.innerText = formatCurrency(resultado);
    } else {
        // MODO B
        mainCalibersCat1.forEach(c => {
            let kg = parseFloat(document.getElementById(`cat1_${c}`).value) || 0;
            if (kg !== 0) {
                totalKgMuestreados += kg;
                let price = currentPrices.cat1[c] || 0;
                let total = kg * price;
                sumaTotalValores += total;
                resultsHtml += `<tr><td>${c} CAT 1 USA</td><td>${formatNumber(kg)} Kg</td><td>${formatCurrency(price)}</td><td>${formatCurrency(total)}</td></tr>`;
            }
        });

        mainCalibersCat2.forEach(c => {
            let kg = parseFloat(document.getElementById(`cat2_${c}`).value) || 0;
            if (kg !== 0) {
                totalKgMuestreados += kg;
                let price = currentPrices.cat2[c] || 0;
                let total = kg * price;
                sumaTotalValores += total;
                resultsHtml += `<tr><td>${c} CAT 2 USA</td><td>${formatNumber(kg)} Kg</td><td>${formatCurrency(price)}</td><td>${formatCurrency(total)}</td></tr>`;
            }
        });

        otherConcepts.forEach(o => {
            let kg = parseFloat(document.getElementById(`oth_${o}`).value) || 0;
            if (kg !== 0) {
                totalKgMuestreados += kg;
                let price = currentPrices.others[o] || 0;
                let total = kg * price;
                sumaTotalValores += total;
                resultsHtml += `<tr><td>${o}</td><td>${formatNumber(kg)} Kg</td><td>${formatCurrency(price)}</td><td>${formatCurrency(total)}</td></tr>`;
            }
        });

        let baseDivisor = totalKgMuestreados === 0 ? 1 : totalKgMuestreados; // Evitar división por 0
        let resultado = sumaTotalValores / baseDivisor;

        resultsBody.innerHTML = resultsHtml;
        totalMoneyValueEl.innerText = formatCurrency(sumaTotalValores);
        totalDivisorValueEl.innerText = formatNumber(totalKgMuestreados);
        finalPriceEl.innerText = formatCurrency(resultado);
    }
}

init();
