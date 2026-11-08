/**
 * PEAT PET SHOP - CART.JS
 * Gerenciamento do carrinho do pet, cupons de desconto, cálculo de frete e persistência
 */

const CART_STORAGE_KEY = 'peat_pet_cart_v1';

// Cupons ativos da loja
const CUPONS_ATIVOS = {
  'PRIMEIRACOMPRA': { percentual: 10, descricao: '10% OFF na Primeira Compra' },
  'PEATPET': { percentual: 5, descricao: '5% OFF Especial Pet' },
  'MEUPET15': { percentual: 15, descricao: '15% OFF Super Tutor' }
};

class CarrinhoService {
  constructor() {
    this.itens = this.carregarLocalStorage();
    this.freteSelecionado = null;
    this.opcoesFrete = [];
    this.cepCalculado = '';
    this.cupomAplicado = null; // { codigo, percentual, descricao }
    this.init();
  }

  init() {
    this.atualizarBadgeContador();
    this.aplicarMascaraCep();
  }

  carregarLocalStorage() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erro ao ler carrinho do LocalStorage:', e);
      return [];
    }
  }

  salvarLocalStorage() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.itens));
      this.atualizarBadgeContador();
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
  }

  adicionarItem(item) {
    const indexExistente = this.itens.findIndex(i => i.id === item.id);

    if (indexExistente > -1) {
      this.itens[indexExistente].quantidade += (item.quantidade || 1);
    } else {
      this.itens.push({
        id: item.id,
        titulo: item.titulo,
        preco: Number(item.preco),
        imagem_url: item.imagem_url,
        quantidade: item.quantidade || 1,
        variacoes: item.variacoes || {}
      });
    }

    this.salvarLocalStorage();
    this.renderizarDrawer();
  }

  removerItem(index) {
    if (index >= 0 && index < this.itens.length) {
      const itemRemovido = this.itens.splice(index, 1)[0];
      this.salvarLocalStorage();
      this.renderizarDrawer();
      if (window.mostrarToast) {
        window.mostrarToast(`🐾 "${itemRemovido.titulo}" removido do carrinho.`);
      }
    }
  }

  alterarQuantidade(index, delta) {
    if (this.itens[index]) {
      this.itens[index].quantidade += delta;
      if (this.itens[index].quantidade <= 0) {
        this.removerItem(index);
        return;
      }
      this.salvarLocalStorage();
      this.renderizarDrawer();
    }
  }

  limparCarrinho() {
    this.itens = [];
    this.freteSelecionado = null;
    this.opcoesFrete = [];
    this.cepCalculado = '';
    this.cupomAplicado = null;
    this.salvarLocalStorage();
    this.renderizarDrawer();
  }

  getSubtotal() {
    return this.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  }

  getValorDesconto() {
    if (!this.cupomAplicado) return 0;
    const subtotal = this.getSubtotal();
    return (subtotal * (this.cupomAplicado.percentual / 100));
  }

  getValorFrete() {
    return this.freteSelecionado ? Number(this.freteSelecionado.preco) : 0;
  }

  getTotal() {
    const total = this.getSubtotal() - this.getValorDesconto() + this.getValorFrete();
    return Math.max(total, 0);
  }

  getQuantidadeTotalItens() {
    return this.itens.reduce((acc, item) => acc + item.quantidade, 0);
  }

  aplicarCupom(codigo) {
    const codigoFormatado = String(codigo || '').trim().toUpperCase();

    if (!codigoFormatado) {
      if (window.mostrarToast) window.mostrarToast('Digite o código do cupom.', 'erro');
      return;
    }

    if (CUPONS_ATIVOS[codigoFormatado]) {
      this.cupomAplicado = {
        codigo: codigoFormatado,
        ...CUPONS_ATIVOS[codigoFormatado]
      };
      this.renderizarDrawer();
      if (window.mostrarToast) {
        window.mostrarToast(`🎉 Cupom "${codigoFormatado}" aplicado! ${this.cupomAplicado.descricao}`, 'sucesso');
      }
    } else {
      if (window.mostrarToast) {
        window.mostrarToast('Cupom inválido ou expirado. Tente: PRIMEIRACOMPRA', 'erro');
      }
    }
  }

  removerCupom() {
    this.cupomAplicado = null;
    this.renderizarDrawer();
    if (window.mostrarToast) {
      window.mostrarToast('Cupom de desconto removido.', 'info');
    }
  }

  atualizarBadgeContador() {
    const badges = document.querySelectorAll('.cart-badge-count');
    const totalItens = this.getQuantidadeTotalItens();

    badges.forEach(badge => {
      badge.textContent = totalItens;
      if (totalItens > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('animate-badge-pop');
        setTimeout(() => badge.classList.remove('animate-badge-pop'), 300);
      } else {
        badge.classList.add('hidden');
      }
    });
  }

  abrirDrawer() {
    const drawer = document.getElementById('drawer-carrinho');
    const overlay = document.getElementById('overlay-carrinho');
    if (!drawer || !overlay) return;

    this.renderizarDrawer();
    overlay.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  }

  fecharDrawer() {
    const drawer = document.getElementById('drawer-carrinho');
    const overlay = document.getElementById('overlay-carrinho');
    if (!drawer || !overlay) return;

    drawer.classList.add('translate-x-full');
    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 250);
  }

  renderizarDrawer() {
    const listaContainer = document.getElementById('carrinho-itens-lista');
    const subtotalEl = document.getElementById('carrinho-subtotal');
    const descontoLinha = document.getElementById('carrinho-linha-desconto');
    const descontoEl = document.getElementById('carrinho-desconto-valor');
    const freteEl = document.getElementById('carrinho-frete-valor');
    const totalEl = document.getElementById('carrinho-total');
    const footerContainer = document.getElementById('carrinho-footer');
    const cepSecao = document.getElementById('carrinho-secao-frete');
    const cupomContainer = document.getElementById('carrinho-secao-cupom');

    if (!listaContainer) return;

    if (this.itens.length === 0) {
      listaContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
          <div class="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-3xl text-orange-400 mb-4">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h4 class="font-black text-stone-800 text-lg mb-1">O carrinho do seu pet está vazio</h4>
          <p class="text-xs text-stone-500 mb-6 max-w-xs">Encontre luvas tira-pelos, escovas e brinquedos para o seu melhor amigo!</p>
          <button 
            type="button" 
            onclick="window.Cart.fecharDrawer()" 
            class="px-6 py-3 bg-orange-600 text-white rounded-2xl text-xs font-black hover:bg-orange-700 transition shadow-md shadow-orange-200"
          >
            Ver Produtos Oficiais
          </button>
        </div>
      `;
      if (footerContainer) footerContainer.classList.add('hidden');
      if (cepSecao) cepSecao.classList.add('hidden');
      if (cupomContainer) cupomContainer.classList.add('hidden');
      return;
    }

    if (footerContainer) footerContainer.classList.remove('hidden');
    if (cepSecao) cepSecao.classList.remove('hidden');
    if (cupomContainer) cupomContainer.classList.remove('hidden');

    listaContainer.innerHTML = this.itens.map((item, idx) => `
      <div class="flex items-center gap-3 p-3 bg-stone-50/90 rounded-2xl border border-stone-200/70 hover:border-orange-200 transition">
        <img 
          src="${item.imagem_url}" 
          alt="${item.titulo}" 
          class="w-16 h-16 rounded-xl object-cover bg-white border border-stone-200/60 flex-shrink-0" 
          onerror="this.src='https://via.placeholder.com/400x400?text=Produto+Pet'"
        />
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-stone-800 truncate mb-1 leading-snug" title="${item.titulo}">
            ${item.titulo}
          </h5>
          <div class="text-xs font-black text-orange-600">
            ${window.formatarMoeda(item.preco * item.quantidade)}
          </div>
        </div>

        <!-- Controles -->
        <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button 
            type="button" 
            onclick="window.Cart.removerItem(${idx})"
            class="text-stone-400 hover:text-rose-500 p-1 text-xs transition" 
            title="Remover item"
          >
            <i class="fa-regular fa-trash-can"></i>
          </button>
          <div class="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-xs">
            <button 
              type="button" 
              onclick="window.Cart.alterarQuantidade(${idx}, -1)" 
              class="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 transition text-xs"
            >
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="w-6 text-center text-xs font-bold text-stone-800">${item.quantidade}</span>
            <button 
              type="button" 
              onclick="window.Cart.alterarQuantidade(${idx}, 1)" 
              class="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 transition text-xs"
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Atualiza valores monetários e cupom
    if (subtotalEl) subtotalEl.textContent = window.formatarMoeda(this.getSubtotal());

    const valorDesc = this.getValorDesconto();
    if (descontoLinha && descontoEl) {
      if (this.cupomAplicado && valorDesc > 0) {
        descontoLinha.classList.remove('hidden');
        descontoEl.textContent = `- ${window.formatarMoeda(valorDesc)} (${this.cupomAplicado.percentual}% OFF)`;
      } else {
        descontoLinha.classList.add('hidden');
      }
    }

    if (freteEl) {
      freteEl.textContent = this.freteSelecionado 
        ? window.formatarMoeda(this.getValorFrete()) 
        : 'A calcular';
    }
    if (totalEl) totalEl.textContent = window.formatarMoeda(this.getTotal());

    // Atualiza badge de cupom no input
    this.renderizarBadgeCupom();
  }

  renderizarBadgeCupom() {
    const badgeCupom = document.getElementById('carrinho-badge-cupom');
    const inputCupom = document.getElementById('carrinho-cupom-input');
    const btnCupom = document.getElementById('btn-aplicar-cupom');

    if (!badgeCupom) return;

    if (this.cupomAplicado) {
      badgeCupom.innerHTML = `
        <div class="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 mt-2">
          <span class="font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-tag text-emerald-600"></i>
            ${this.cupomAplicado.codigo} (${this.cupomAplicado.percentual}% OFF)
          </span>
          <button type="button" onclick="window.Cart.removerCupom()" class="text-emerald-700 hover:text-rose-600 font-bold ml-2">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
      badgeCupom.classList.remove('hidden');
      if (inputCupom) inputCupom.disabled = true;
      if (btnCupom) btnCupom.disabled = true;
    } else {
      badgeCupom.innerHTML = '';
      badgeCupom.classList.add('hidden');
      if (inputCupom) {
        inputCupom.disabled = false;
        inputCupom.value = '';
      }
      if (btnCupom) btnCupom.disabled = false;
    }
  }

  aplicarMascaraCep() {
    const inputCep = document.getElementById('carrinho-cep-input');
    if (!inputCep) return;

    inputCep.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 5) {
        v = `${v.slice(0, 5)}-${v.slice(5)}`;
      }
      e.target.value = v;
    });

    inputCep.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.calcularFrete();
      }
    });
  }

  async calcularFrete() {
    const inputCep = document.getElementById('carrinho-cep-input');
    const btnCalcular = document.getElementById('btn-calcular-frete');
    const containerOpcoes = document.getElementById('opcoes-frete-container');
    if (!inputCep || !btnCalcular) return;

    const cep = inputCep.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      if (window.mostrarToast) window.mostrarToast('Digite um CEP válido com 8 dígitos.', 'erro');
      inputCep.focus();
      return;
    }

    btnCalcular.disabled = true;
    const textoOriginal = btnCalcular.innerHTML;
    btnCalcular.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-xs"></i>';

    try {
      const response = await fetch('/api/calcular-frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: cep,
          itens: this.itens
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.opcoes && data.opcoes.length > 0) {
        this.opcoesFrete = data.opcoes;
        this.cepCalculado = cep;
        this.selecionarFrete(this.opcoesFrete[0]);
        this.renderizarOpcoesFrete();
        if (window.mostrarToast) window.mostrarToast('Opções de entrega calculadas!', 'sucesso');
      } else {
        throw new Error(data.message || 'Erro ao calcular frete');
      }
    } catch (err) {
      console.warn('Falha no endpoint /api/calcular-frete, aplicando cálculo regional de contingência:', err);
      const primeiroDigito = parseInt(cep[0], 10);
      const precoPac = (primeiroDigito <= 3) ? 16.90 : 26.50;
      const precoSedex = (primeiroDigito <= 3) ? 29.90 : 44.90;
      
      this.opcoesFrete = [
        {
          id: 'pac_correios',
          nome: 'Entrega Econômica Pet (PAC)',
          empresa: 'Correios',
          preco: precoPac,
          prazo_dias: primeiroDigito <= 3 ? 4 : 8,
          descricao: `Chega em até ${primeiroDigito <= 3 ? 4 : 8} dias úteis com carinho`
        },
        {
          id: 'sedex_correios',
          nome: 'Entrega Expressa Pet (SEDEX)',
          empresa: 'Correios',
          preco: precoSedex,
          prazo_dias: primeiroDigito <= 3 ? 2 : 3,
          descricao: `Chega rápido em até ${primeiroDigito <= 3 ? 2 : 3} dias úteis`
        }
      ];
      this.cepCalculado = cep;
      this.selecionarFrete(this.opcoesFrete[0]);
      this.renderizarOpcoesFrete();
    } finally {
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = textoOriginal;
    }
  }

  selecionarFrete(opcao) {
    this.freteSelecionado = opcao;
    const freteEl = document.getElementById('carrinho-frete-valor');
    const totalEl = document.getElementById('carrinho-total');

    if (freteEl) freteEl.textContent = window.formatarMoeda(this.getValorFrete());
    if (totalEl) totalEl.textContent = window.formatarMoeda(this.getTotal());

    document.querySelectorAll('.shipping-option').forEach(el => {
      if (el.dataset.id === opcao.id) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  renderizarOpcoesFrete() {
    const container = document.getElementById('opcoes-frete-container');
    if (!container) return;

    container.innerHTML = this.opcoesFrete.map(opcao => {
      const isSelected = this.freteSelecionado && this.freteSelecionado.id === opcao.id;
      return `
        <div 
          onclick="window.Cart.selecionarFretePorId('${opcao.id}')"
          data-id="${opcao.id}"
          class="shipping-option flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer ${isSelected ? 'selected border-orange-500 bg-orange-50/70' : 'border-stone-200 bg-white'}"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-orange-600 bg-orange-600 text-white' : 'border-stone-300'}">
              ${isSelected ? '<i class="fa-solid fa-check text-[9px]"></i>' : ''}
            </div>
            <div>
              <div class="text-xs font-bold text-stone-800">${opcao.nome}</div>
              <div class="text-[11px] text-stone-500">${opcao.descricao}</div>
            </div>
          </div>
          <div class="text-xs font-black text-stone-900">
            ${window.formatarMoeda(opcao.preco)}
          </div>
        </div>
      `;
    }).join('');

    container.classList.remove('hidden');
  }

  selecionarFretePorId(id) {
    const opcao = this.opcoesFrete.find(o => o.id === id);
    if (opcao) {
      this.selecionarFrete(opcao);
    }
  }

  finalizarCompra() {
    if (this.itens.length === 0) {
      if (window.mostrarToast) window.mostrarToast('O carrinho do seu pet está vazio!', 'erro');
      return;
    }

    this.fecharDrawer();

    if (window.Checkout) {
      window.Checkout.abrirCheckout({
        itens: this.itens,
        frete: this.freteSelecionado,
        cupom: this.cupomAplicado,
        desconto: this.getValorDesconto(),
        subtotal: this.getSubtotal(),
        total: this.getTotal(),
        cepCalculado: this.cepCalculado
      });
    }
  }
}

window.Cart = new CarrinhoService();
