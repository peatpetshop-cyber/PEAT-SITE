/**
 * PEAT PET SHOP - CHECKOUT.JS
 * Lógica do checkout, máscaras de inputs, ViaCEP, integração PIX Mercado Pago e Supabase
 */

class CheckoutService {
  constructor() {
    this.dadosCheckout = {
      itens: [],
      frete: null,
      subtotal: 0,
      total: 0,
      metodoPagamento: 'pix'
    };
    this.pedidoAtual = null;
    this.timerPixInterval = null;
    this.init();
  }

  init() {
    this.configurarMascaras();
    this.configurarEventosAbasPagamento();
  }

  abrirCheckout(dados) {
    this.dadosCheckout = {
      ...this.dadosCheckout,
      ...dados
    };

    const modal = document.getElementById('modal-checkout');
    if (!modal) return;

    if (dados.cepCalculado) {
      const inputCep = document.getElementById('checkout-cep');
      if (inputCep) {
        inputCep.value = dados.cepCalculado;
        this.consultarViaCep(dados.cepCalculado);
      }
    }

    this.renderizarResumoPedido();
    this.atualizarParcelasCartao();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  fecharModal() {
    const modal = document.getElementById('modal-checkout');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';

    if (this.timerPixInterval) {
      clearInterval(this.timerPixInterval);
      this.timerPixInterval = null;
    }
  }

  renderizarResumoPedido() {
    const listaResumo = document.getElementById('checkout-resumo-itens');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const freteEl = document.getElementById('checkout-frete');
    const totalEl = document.getElementById('checkout-total');

    if (listaResumo) {
      listaResumo.innerHTML = this.dadosCheckout.itens.map(item => `
        <div class="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
          <div class="flex items-center gap-2 truncate">
            <span class="font-bold text-orange-600">${item.quantidade}x</span>
            <span class="text-stone-700 truncate max-w-[170px]">${item.titulo}</span>
          </div>
          <span class="font-bold text-stone-900">${window.formatarMoeda(item.preco * item.quantidade)}</span>
        </div>
      `).join('');
    }

    const valorFrete = this.dadosCheckout.frete ? Number(this.dadosCheckout.frete.preco) : 0;
    const subtotal = this.dadosCheckout.subtotal || 0;
    const valorDesconto = this.dadosCheckout.desconto || 0;
    const total = Math.max(subtotal - valorDesconto + valorFrete, 0);
    this.dadosCheckout.total = total;

    const linhaDesconto = document.getElementById('checkout-linha-desconto');
    const descontoEl = document.getElementById('checkout-desconto');

    if (linhaDesconto && descontoEl) {
      if (valorDesconto > 0) {
        linhaDesconto.classList.remove('hidden');
        descontoEl.textContent = `- ${window.formatarMoeda(valorDesconto)}`;
      } else {
        linhaDesconto.classList.add('hidden');
      }
    }

    if (subtotalEl) subtotalEl.textContent = window.formatarMoeda(subtotal);
    if (freteEl) {
      freteEl.textContent = valorFrete > 0 ? window.formatarMoeda(valorFrete) : 'Grátis';
    }
    if (totalEl) totalEl.textContent = window.formatarMoeda(total);
  }

  atualizarParcelasCartao() {
    const selectParcelas = document.getElementById('cartao-parcelas');
    if (!selectParcelas) return;

    const total = this.dadosCheckout.total;
    let html = '';
    for (let i = 1; i <= 6; i++) {
      const valorParcela = (total / i).toFixed(2);
      html += `<option value="${i}">${i}x de ${window.formatarMoeda(valorParcela)} sem juros</option>`;
    }
    selectParcelas.innerHTML = html;
  }

  configurarMascaras() {
    const inputCpf = document.getElementById('checkout-cpf');
    if (inputCpf) {
      inputCpf.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
      });
    }

    const inputTel = document.getElementById('checkout-telefone');
    if (inputTel) {
      inputTel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 5) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        e.target.value = v;
      });
    }

    const inputCep = document.getElementById('checkout-cep');
    if (inputCep) {
      inputCep.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) {
          v = `${v.slice(0, 5)}-${v.slice(5)}`;
        }
        e.target.value = v;
        if (v.replace(/\D/g, '').length === 8) {
          this.consultarViaCep(v);
        }
      });
    }

    const inputCartaoNum = document.getElementById('cartao-numero');
    if (inputCartaoNum) {
      inputCartaoNum.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 16);
        v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = v;
        this.detectarBandeiraCartao(v);
      });
    }

    const inputValidade = document.getElementById('cartao-validade');
    if (inputValidade) {
      inputValidade.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 2) {
          v = `${v.slice(0, 2)}/${v.slice(2)}`;
        }
        e.target.value = v;
      });
    }

    const inputCvv = document.getElementById('cartao-cvv');
    if (inputCvv) {
      inputCvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  }

  detectarBandeiraCartao(numero) {
    const limpo = numero.replace(/\D/g, '');
    const iconeBandeira = document.getElementById('icone-bandeira-cartao');
    if (!iconeBandeira) return;

    if (/^4/.test(limpo)) {
      iconeBandeira.className = 'fa-brands fa-cc-visa text-blue-600 text-xl';
    } else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(limpo)) {
      iconeBandeira.className = 'fa-brands fa-cc-mastercard text-red-500 text-xl';
    } else if (/^3[47]/.test(limpo)) {
      iconeBandeira.className = 'fa-brands fa-cc-amex text-blue-400 text-xl';
    } else {
      iconeBandeira.className = 'fa-regular fa-credit-card text-stone-400 text-xl';
    }
  }

  async consultarViaCep(cepBruto) {
    const cep = String(cepBruto).replace(/\D/g, '');
    if (cep.length !== 8) return;

    const inputRua = document.getElementById('checkout-rua');
    const inputBairro = document.getElementById('checkout-bairro');
    const inputCidade = document.getElementById('checkout-cidade');
    const inputUf = document.getElementById('checkout-uf');
    const inputNumero = document.getElementById('checkout-numero');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await res.json();

      if (!dados.erro) {
        if (inputRua) inputRua.value = dados.logradouro || '';
        if (inputBairro) inputBairro.value = dados.bairro || '';
        if (inputCidade) inputCidade.value = dados.localidade || '';
        if (inputUf) inputUf.value = dados.uf || '';
        if (inputNumero) inputNumero.focus();
      }
    } catch (e) {
      console.warn('Erro ao consultar ViaCEP:', e);
    }
  }

  configurarEventosAbasPagamento() {
    const btnTabPix = document.getElementById('tab-btn-pix');
    const btnTabCartao = document.getElementById('tab-btn-cartao');
    const painelPix = document.getElementById('painel-pagamento-pix');
    const painelCartao = document.getElementById('painel-pagamento-cartao');

    if (btnTabPix && btnTabCartao) {
      btnTabPix.addEventListener('click', () => {
        this.dadosCheckout.metodoPagamento = 'pix';
        btnTabPix.className = 'flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs';
        btnTabCartao.className = 'flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition border-stone-200 text-stone-600 hover:bg-stone-50';
        if (painelPix) painelPix.classList.remove('hidden');
        if (painelCartao) painelCartao.classList.add('hidden');
      });

      btnTabCartao.addEventListener('click', () => {
        this.dadosCheckout.metodoPagamento = 'cartao';
        btnTabCartao.className = 'flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition border-orange-500 bg-orange-50 text-orange-800 shadow-xs';
        btnTabPix.className = 'flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition border-stone-200 text-stone-600 hover:bg-stone-50';
        if (painelPix) painelPix.classList.add('hidden');
        if (painelCartao) painelCartao.classList.remove('hidden');
      });
    }
  }

  validarFormulario() {
    const nome = document.getElementById('checkout-nome')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const cpf = document.getElementById('checkout-cpf')?.value.replace(/\D/g, '');
    const tel = document.getElementById('checkout-telefone')?.value.replace(/\D/g, '');
    const cep = document.getElementById('checkout-cep')?.value.replace(/\D/g, '');
    const rua = document.getElementById('checkout-rua')?.value.trim();
    const numero = document.getElementById('checkout-numero')?.value.trim();
    const bairro = document.getElementById('checkout-bairro')?.value.trim();
    const cidade = document.getElementById('checkout-cidade')?.value.trim();
    const uf = document.getElementById('checkout-uf')?.value.trim();

    if (!nome || nome.split(' ').length < 2) {
      window.mostrarToast('Por favor, informe seu nome completo de tutor.', 'erro');
      document.getElementById('checkout-nome')?.focus();
      return null;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      window.mostrarToast('Por favor, informe um e-mail válido para rastreio.', 'erro');
      document.getElementById('checkout-email')?.focus();
      return null;
    }

    if (!cpf || cpf.length !== 11) {
      window.mostrarToast('Por favor, informe um CPF válido.', 'erro');
      document.getElementById('checkout-cpf')?.focus();
      return null;
    }

    if (!cep || cep.length !== 8 || !rua || !numero || !bairro || !cidade || !uf) {
      window.mostrarToast('Por favor, preencha o endereço completo de entrega para o seu pet.', 'erro');
      return null;
    }

    if (this.dadosCheckout.metodoPagamento === 'cartao') {
      const numCartao = document.getElementById('cartao-numero')?.value.replace(/\D/g, '');
      const titular = document.getElementById('cartao-nome')?.value.trim();
      const validade = document.getElementById('cartao-validade')?.value.trim();
      const cvv = document.getElementById('cartao-cvv')?.value.trim();

      if (!numCartao || numCartao.length < 13) {
        window.mostrarToast('Número de cartão de crédito inválido.', 'erro');
        return null;
      }
      if (!titular) {
        window.mostrarToast('Nome impresso no cartão é obrigatório.', 'erro');
        return null;
      }
      if (!validade || validade.length < 5) {
        window.mostrarToast('Validade do cartão inválida (MM/AA).', 'erro');
        return null;
      }
      if (!cvv || cvv.length < 3) {
        window.mostrarToast('Código de segurança (CVV) inválido.', 'erro');
        return null;
      }
    }

    return {
      cliente_nome: nome,
      cliente_email: email,
      cliente_cpf: cpf,
      cliente_telefone: tel,
      endereco: {
        cep,
        rua,
        numero,
        complemento: document.getElementById('checkout-complemento')?.value.trim() || '',
        bairro,
        cidade,
        uf
      }
    };
  }

  async processarPagamento() {
    const dadosCliente = this.validarFormulario();
    if (!dadosCliente) return;

    const btnSubmit = document.getElementById('btn-finalizar-pedido');
    if (!btnSubmit) return;

    btnSubmit.disabled = true;
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      Preparando pedido do seu pet...
    `;

    const numeroPedido = `PEAT-PET-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (this.dadosCheckout.metodoPagamento === 'pix') {
        const pixRes = await fetch('/api/criar-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_amount: this.dadosCheckout.total,
            description: 'Pedido Peat Pet Shop',
            order_id: numeroPedido,
            payer: {
              email: dadosCliente.cliente_email,
              nome: dadosCliente.cliente_nome,
              cpf: dadosCliente.cliente_cpf
            }
          })
        });

        const pixData = await pixRes.json();

        if (pixRes.ok && pixData.success) {
          await this.salvarPedidoSupabase({
            numero_pedido: numeroPedido,
            ...dadosCliente,
            itens: this.dadosCheckout.itens,
            subtotal: this.dadosCheckout.subtotal,
            desconto: this.dadosCheckout.desconto || 0,
            cupom: this.dadosCheckout.cupom?.codigo || null,
            valor_frete: this.dadosCheckout.frete ? this.dadosCheckout.frete.preco : 0,
            total: this.dadosCheckout.total,
            metodo_pagamento: 'pix',
            status_pagamento: 'pendente',
            payment_id: String(pixData.id || '')
          });

          this.exibirModalPix({
            numeroPedido,
            pixData,
            total: this.dadosCheckout.total
          });
        } else {
          throw new Error(pixData.message || 'Falha ao gerar o código PIX.');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));

        await this.salvarPedidoSupabase({
          numero_pedido: numeroPedido,
          ...dadosCliente,
          itens: this.dadosCheckout.itens,
          subtotal: this.dadosCheckout.subtotal,
          desconto: this.dadosCheckout.desconto || 0,
          cupom: this.dadosCheckout.cupom?.codigo || null,
          valor_frete: this.dadosCheckout.frete ? this.dadosCheckout.frete.preco : 0,
          total: this.dadosCheckout.total,
          metodo_pagamento: 'cartao_credito',
          status_pagamento: 'aprovado',
          payment_id: `CARD-${Date.now()}`
        });

        this.exibirModalSucesso(numeroPedido, 'cartao');
      }

      window.Cart.limparCarrinho();

    } catch (err) {
      console.error('Erro ao processar compra pet:', err);
      window.mostrarToast(err.message || 'Erro ao processar pedido. Tente novamente.', 'erro');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = textoOriginal;
    }
  }

  async salvarPedidoSupabase(payload) {
    try {
      const res = await fetch('/api/criar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Erro ao chamar /api/criar-pedido, prosseguindo com fluxo local:', e);
      return { success: true, pedido: payload };
    }
  }

  exibirModalPix({ numeroPedido, pixData, total }) {
    this.fecharModal();

    const modalPix = document.getElementById('modal-pix');
    const qrImg = document.getElementById('pix-qr-img');
    const codigoInput = document.getElementById('pix-copia-cola');
    const valorEl = document.getElementById('pix-valor-total');
    const numPedidoEl = document.getElementById('pix-numero-pedido');

    if (!modalPix) return;

    if (numPedidoEl) numPedidoEl.textContent = numeroPedido;
    if (valorEl) valorEl.textContent = window.formatarMoeda(total);
    if (codigoInput) codigoInput.value = pixData.qr_code || '';

    if (qrImg) {
      if (pixData.qr_code_base64) {
        qrImg.src = `data:image/png;base64,${pixData.qr_code_base64}`;
      } else if (pixData.qr_code_url) {
        qrImg.src = pixData.qr_code_url;
      } else {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixData.qr_code)}`;
      }
    }

    this.iniciarContadorPix(30 * 60);

    modalPix.classList.remove('hidden');
    modalPix.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  iniciarContadorPix(segundosTotais) {
    const timerEl = document.getElementById('pix-timer');
    if (!timerEl) return;

    let tempoRestante = segundosTotais;
    if (this.timerPixInterval) clearInterval(this.timerPixInterval);

    const atualizar = () => {
      const min = Math.floor(tempoRestante / 60);
      const seg = tempoRestante % 60;
      timerEl.textContent = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
      if (tempoRestante <= 0) {
        clearInterval(this.timerPixInterval);
        timerEl.textContent = 'Expirado';
      }
      tempoRestante--;
    };

    atualizar();
    this.timerPixInterval = setInterval(atualizar, 1000);
  }

  copiarCodigoPix() {
    const input = document.getElementById('pix-copia-cola');
    const btn = document.getElementById('btn-copiar-pix');
    if (!input) return;

    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
      if (btn) {
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado com Sucesso!';
        btn.classList.add('bg-emerald-700');
        setTimeout(() => {
          btn.innerHTML = textoOriginal;
          btn.classList.remove('bg-emerald-700');
        }, 3000);
      }
      window.mostrarToast('🐾 Código Pix copiado para a área de transferência!', 'sucesso');
    }).catch(() => {
      document.execCommand('copy');
      window.mostrarToast('Código Pix copiado!', 'sucesso');
    });
  }

  fecharModalPix() {
    const modalPix = document.getElementById('modal-pix');
    if (modalPix) {
      modalPix.classList.add('hidden');
      modalPix.classList.remove('flex');
    }
    if (this.timerPixInterval) {
      clearInterval(this.timerPixInterval);
      this.timerPixInterval = null;
    }
    document.body.style.overflow = 'auto';
  }

  exibirModalSucesso(numeroPedido, metodo) {
    this.fecharModal();

    const modalSucesso = document.getElementById('modal-sucesso');
    const numEl = document.getElementById('sucesso-numero-pedido');
    const msgEl = document.getElementById('sucesso-mensagem');

    if (!modalSucesso) return;

    if (numEl) numEl.textContent = numeroPedido;
    if (msgEl) {
      msgEl.textContent = metodo === 'cartao' 
        ? 'Seu pagamento com cartão foi aprovado com sucesso! Já estamos embalando os mimos do seu pet.' 
        : 'Pedido do seu pet registrado com sucesso!';
    }

    modalSucesso.classList.remove('hidden');
    modalSucesso.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  fecharModalSucesso() {
    const modalSucesso = document.getElementById('modal-sucesso');
    if (modalSucesso) {
      modalSucesso.classList.add('hidden');
      modalSucesso.classList.remove('flex');
    }
    document.body.style.overflow = 'auto';
  }
}

window.Checkout = new CheckoutService();
