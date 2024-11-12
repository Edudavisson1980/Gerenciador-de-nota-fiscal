let nfData = [];
let currentNFIndex = 0;

function loadFromLocalStorage() {
    const storedData = localStorage.getItem('nfData');
    nfData = storedData ? JSON.parse(storedData) : [];
    updateRegistroNumero();
}

function saveToLocalStorage() {
    localStorage.setItem('nfData', JSON.stringify(nfData));
}

function showScreen(screenId) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    clearInputs(screenId);
    updateRegistroNumero();
    if (screenId === 'excluirNF') showExclusionList();
    if (screenId === 'imprimirNF') showPrintableList();
}

function closeModal(screenId) {
    document.getElementById(screenId).classList.add('hidden');
}

function clearInputs(screenId) {
    const inputs = document.querySelectorAll(`#${screenId} input`);
    inputs.forEach(input => input.value = '');
    if (screenId === 'pesquisarNF') {
        document.getElementById('resultadoPesquisa').innerHTML = '';
    }
}

function saveNF() {
    const numeroNF = document.getElementById('numeroNF').value.trim();
    const numeroCaixa = document.getElementById('numeroCaixa').value.trim();

    if (!numeroNF || !numeroCaixa) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (nfData.some(nf => nf.numeroNF === numeroNF)) {
        alert('Erro: Número de NF já cadastrado. Insira um número único.');
        return;
    }

    nfData.push({
        registro: nfData.length + 1,
        data: new Date().toLocaleDateString(),
        numeroNF,
        numeroCaixa
    });

    alert('Nota Fiscal cadastrada com sucesso!');
    clearInputs('cadastrarNF');
    updateRegistroNumero();
    saveToLocalStorage();
}

function navigateNF(direction) {
    if (direction === 'next' && currentNFIndex < nfData.length - 1) {
        currentNFIndex++;
    } else if (direction === 'prev' && currentNFIndex > 0) {
        currentNFIndex--;
    }

    const nf = nfData[currentNFIndex];
    document.getElementById('registroNumero').textContent = nf.registro;
    document.getElementById('dataCadastro').value = nf.data;
    document.getElementById('numeroNF').value = nf.numeroNF;
    document.getElementById('numeroCaixa').value = nf.numeroCaixa;
}

function updateRegistroNumero() {
    document.getElementById('registroNumero').textContent = nfData.length + 1;
    document.getElementById('dataCadastro').value = new Date().toLocaleDateString();
}

function searchNF() {
    const searchTerms = document.getElementById('pesquisaNF').value.split(',').map(term => term.trim());
    const results = nfData.filter(nf => searchTerms.includes(nf.numeroNF));
    const resultDiv = document.getElementById('resultadoPesquisa');
    resultDiv.innerHTML = results.map(nf => `NF: ${nf.numeroNF}, Caixa: ${nf.numeroCaixa}`).join('<br>');
    document.getElementById('pesquisaNF').value = ''; // Limpa o campo de pesquisa
}

function showAllNFs() {
    const resultDiv = document.getElementById('resultadoPesquisa');
    resultDiv.innerHTML = nfData.map(nf => `NF: ${nf.numeroNF}, Caixa: ${nf.numeroCaixa}`).join('<br>');
}

function searchNFForEdit() {
    const numeroNFInput = document.getElementById('editarPesquisaNF').value.trim();
    const nfNumero = document.getElementById('editarNumeroNF').value.trim();
    const nfCaixa = document.getElementById('editarNumeroCaixa').value.trim();

    if (!numeroNFInput) {
        alert('Digite a nota fiscal no 1º campo da tela por favor...');
        return;
    }

    if (nfNumero || nfCaixa) {
        alert('Por favor, digite o número da nota fiscal no 1º campo acima para fazer a busca.');
        return;
    }

    const nf = nfData.find(nf => nf.numeroNF === numeroNFInput);
    if (nf) {
        document.getElementById('editarNumeroNF').value = nf.numeroNF;
        document.getElementById('editarNumeroCaixa').value = nf.numeroCaixa;
    } else {
        alert('Nota Fiscal não encontrada.');
    }
}

function updateNF() {
    const numeroNF = document.getElementById('editarNumeroNF').value.trim();
    const numeroCaixa = document.getElementById('editarNumeroCaixa').value.trim();

    if (!numeroNF || !numeroCaixa) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const nfIndex = nfData.findIndex(nf => nf.numeroNF === numeroNF);
    if (nfIndex !== -1) {
        nfData[nfIndex].numeroCaixa = numeroCaixa;
        alert('Nota Fiscal atualizada com sucesso!');
        saveToLocalStorage();
    } else {
        alert('Nota Fiscal não encontrada.');
    }
}

function deleteNF(nfNumber) {
    const index = nfData.findIndex(nf => nf.numeroNF === nfNumber);
    if (index !== -1) {
        nfData.splice(index, 1);
        alert('Nota Fiscal excluída com sucesso!');
        saveToLocalStorage();
        showExclusionList();
    }
}

function showExclusionList() {
    const exclusionDiv = document.getElementById('excluirLista');
    exclusionDiv.innerHTML = nfData.map(nf => `
        <div class="checkbox">
            <span>NF: ${nf.numeroNF} - Caixa: ${nf.numeroCaixa}</span>
            <button onclick="deleteNF('${nf.numeroNF}')">Excluir</button>
        </div>`).join('');
}

function showPrintableList() {
    const printDiv = document.getElementById('imprimirLista');
    printDiv.innerHTML = nfData.map(nf => `
        <div class="checkbox">
            <span>NF: ${nf.numeroNF} - Caixa: ${nf.numeroCaixa}</span>
            <input type="checkbox" class="print-checkbox" value="${nf.numeroNF}">
        </div>`).join('');
}

function printSelectedNFs() {
    const selectedNFs = Array.from(document.querySelectorAll('.print-checkbox:checked')).map(input => input.value);
    const printData = nfData.filter(nf => selectedNFs.includes(nf.numeroNF));

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.text("Notas Fiscais Selecionadas:", 10, 10);

    printData.forEach((nf, index) => {
        pdf.text(`NF: ${nf.numeroNF} - Caixa: ${nf.numeroCaixa}`, 10, 20 + (index * 10));
    });

    pdf.save("NotasFiscaisSelecionadas.pdf");
}

function exportToTxt() {
    let txtContent = "Registro Geral de Notas Fiscais\n\n";
    nfData.forEach(nf => {
        txtContent += `Registro: ${nf.registro}, Data: ${nf.data}, NF: ${nf.numeroNF}, Caixa: ${nf.numeroCaixa}\n`;
    });

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "RegistroNotasFiscais.txt";
    link.click();
}

// Função para importar dados de um arquivo .txt
function importFromTxt(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split("\n").filter(line => line.trim() !== "");

        nfData = []; // Limpa dados atuais
        for (const line of lines.slice(1)) { // Ignora a primeira linha
            const parts = line.match(/NF:\s(\d+),\sCaixa:\s([A-Za-z0-9]+)/);
            if (parts) {
                const [ , numeroNF, numeroCaixa ] = parts;
                const newNF = {
                    registro: nfData.length + 1,
                    data: new Date().toLocaleDateString(),
                    numeroNF: numeroNF.trim(),
                    numeroCaixa: numeroCaixa.trim()
                };
                nfData.push(newNF);
            }
        }
        alert("Dados importados com sucesso!");
        updateRegistroNumero();
    };
    reader.readAsText(file);
}


function exitProgram() {
    window.close(); // Fecha a janela sem exibir aviso
}

window.onload = loadFromLocalStorage;
