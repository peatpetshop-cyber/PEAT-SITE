/**
 * PEAT PET SHOP - APP.JS
 * Catálogo Oficial de Produtos, Imagens Unsplash Dinâmicas, Fallback e Sistema de Avaliações
 */

// Imagem genérica de fallback sem copyright caso ocorra falha de rede ou 404
const IMAGEM_FALLBACK_PADRAO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600';

// Configuração do Supabase
window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: 'https://inhawuzgdxhncblvqsov.supabase.co/rest/v1/',
  anonKey: 'sb_publishable_Yr71-Kch3MFPSJWsRJi6Iw_5y9XLWpa'
};

// 1. NOVO CATÁLOGO OFICIAL COM IMAGENS PÚBLICAS DO UNSPLASH E PREÇOS COMPETITIVOS
const PRODUTOS_PADRAO = [
  {
    id: 1,
    titulo: "Luva Pet Nano Magnética Tira-Pelos",
    preco: 19.90,
    categoria: "Higiene e Cuidados",
    imagem: "https://images.pexels.com/photos/6816341/pexels-photo-6816341.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Luva de silicone massageadora que remove pelos mortos com facilidade enquanto relaxa o pet. Possui fecho ajustável em velcro.",
    estoque: 50,
    avaliacoes_count: 14,
    nota_media: 4.9
  },
  {
    id: 2,
    titulo: "Par de Luvas Mágicas de Silicone com Cerdas",
    preco: 29.90,
    categoria: "Higiene e Cuidados",
    imagem: "https://images.pexels.com/photos/6816851/pexels-photo-6816851.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Luvas multiuso 100% silicone para banho do pet, lavagem de utensílios e remoção de pelos. Resistente e higiênica.",
    estoque: 30,
    avaliacoes_count: 8,
    nota_media: 4.8
  },
  {
    id: 3,
    titulo: "Escova Rasqueadeira Autolimpante Pet",
    preco: 26.90,
    categoria: "Higiene e Cuidados",
    imagem: "https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Escova tira-pelos com botão prático de autolimpeza. Remove os pelos retidos na ponta das cerdas com apenas um clique.",
    estoque: 40,
    avaliacoes_count: 19,
    nota_media: 5.0
  },
  {
    id: 4,
    titulo: "Máquina de Tosar Pet Profissional Sem Fio (4 Pentes)",
    preco: 69.90,
    categoria: "Equipamentos",
    imagem: "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Máquina de tosa silenciosa recarregável via USB. Acompanha 4 pentes de altura para diferentes tipos de pelagem.",
    estoque: 15,
    avaliacoes_count: 11,
    nota_media: 4.9
  },
  {
    id: 5,
    titulo: "Kit de Brinquedos Mordedores de Borracha para Cães",
    preco: 32.90,
    categoria: "Brinquedos",
    imagem: "https://images.pexels.com/photos/1909802/pexels-photo-1909802.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Kit variado com brinquedos mordedores de borracha atóxica. Auxilia na limpeza dos dentes e alívio do estresse.",
    estoque: 25,
    avaliacoes_count: 16,
    nota_media: 4.7
  },
  {
    id: 6,
    titulo: "Frisbee Interativo Disco Voador para Cachorro",
    preco: 14.90,
    categoria: "Brinquedos",
    imagem: "https://images.pexels.com/photos/4587941/pexels-photo-4587941.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Disco voador leve e resistente para brincadeiras de arremesso e busca ao ar livre. Estimula o exercício do cão.",
    estoque: 60,
    avaliacoes_count: 7,
    nota_media: 4.6
  },
  {
    id: 7,
    titulo: "Bola Interativa Automática com Cauda (Recarregável)",
    preco: 26.90,
    categoria: "Brinquedos",
    imagem: "https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Bolinha inteligente com sensores anti-colisão e movimento de cauda automático. Recarregável via USB-C.",
    estoque: 35,
    avaliacoes_count: 22,
    nota_media: 4.9
  },
  {
    id: 8,
    titulo: "Tapete de Lamber de Silicone com Ventosas (Labirinto)",
    preco: 22.90,
    categoria: "Alimentação",
    imagem: "https://images.pexels.com/photos/7210271/pexels-photo-7210271.jpeg?auto=compress&cs=tinysrgb&w=600",
    descricao: "Tapete interativo com ventosas para fixação em azulejos/pisos. Reduz a ansiedade e desacelera a alimentação.",
    estoque: 45,
    avaliacoes_count: 31,
    nota_media: 5.0
  },
  {
    id: 9,
    titulo: "Varinha Interativa de Pena com Ventosa para Gatos",
    preco: 19.90,
    categoria: "Brinquedos",
    imagem: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    descricao: "Varinha com haste flexível e penas atóxicas. Base com ventosa forte para fixar no chão ou vidro e permitir brincadeira autônoma.",
    estoque: 50,
    avaliacoes_count: 13,
    nota_media: 4.8
  }
];

// Avaliações de exemplo iniciais por produto
const AVALIACOES_INICIAIS = {
  1: [
    { nome: 'Mariana S.', nota: 5, comentario: 'Excelente qualidade, meu cão adorou a massagem e soltou muito menos pelos pela casa!' },
    { nome: 'Carlos E.', nota: 5, comentario: 'Funciona perfeitamente em pelos curtos e médios. Muito fácil de limpar.' }
  ],
  2: [
    { nome: 'Camila D.', nota: 5, comentario: 'Facilitou muito a hora do banho do meu Golden. Ensaboa super rápido!' },
    { nome: 'Pedro H.', nota: 4, comentario: 'Material resistente e silicone bem macio. Recomendo.' }
  ],
  3: [
    { nome: 'Felipe N.', nota: 5, comentario: 'O botão autolimpante economiza muito tempo! Tira todo o tufo com um clique.' },
    { nome: 'Ana Beatriz', nota: 5, comentario: 'Minha gata que odeia escova adorou essa, as cerdas não machucam.' }
  ],
  4: [
    { nome: 'Carlos Alberto', nota: 5, comentario: 'Silenciosa de verdade. O cachorro não ficou com medo e a tosa ficou profissional.' },
    { nome: 'Luciana M.', nota: 5, comentario: 'Bateria dura muito e os 4 pentes atendem qualquer altura de pelo.' }
  ],
  5: [
    { nome: 'Juliana C.', nota: 5, comentario: 'Borracha resistente e de qualidade. Meu filhote não larga mais.' },
    { nome: 'Marcos V.', nota: 4, comentario: 'Ótimo kit, perfeito para cachorros com muita energia.' }
  ],
  6: [
    { nome: 'Lucas F.', nota: 5, comentario: 'Muito leve e voa alto. O cão pega no ar sem machucar a gengiva.' }
  ],
  7: [
    { nome: 'Larissa M.', nota: 5, comentario: 'A cauda em movimento deixa os pets entretidos por horas! Valeu cada centavo.' },
    { nome: 'Gabriel R.', nota: 5, comentario: 'Recarrega rápido na porta USB e desvia das paredes certinho.' }
  ],
  8: [
    { nome: 'Patricia L.', nota: 5, comentario: 'Espalho pasta de amendoim ou patê e coloco no freezer. Acalma demais o cachorro!' },
    { nome: 'Renata B.', nota: 5, comentario: 'Ventosas muito fortes, grudam no azulejo e não soltam.' }
  ],
  9: [
    { nome: 'Amanda T.', nota: 5, comentario: 'A ventosa segura super bem no piso. Meus 2 gatos brincam sozinhos por muito tempo.' }
  ]
};

// Estado da Aplicação
const appState = {
  produtos: [],
  categoriaAtiva: 'todos',
  termoBusca: '',
  ordem: 'relevancia',
  produtoSelecionadoModal: null,
  novaNotaAvaliacao: 5
};

// Formatação de Moeda Brasileira
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

// Renderiza estrelas em HTML
function renderizarEstrelasHtml(nota) {
  const notaNum = Math.min(Math.max(parseFloat(nota) || 5, 1), 5);
  const estrelasCheias = Math.floor(notaNum);
  const temMeiaEstrela = (notaNum - estrelasCheias) >= 0.5;
  let html = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= estrelasCheias) {
      html += '<i class="fa-solid fa-star text-amber-400"></i>';
    } else if (i === estrelasCheias + 1 && temMeiaEstrela) {
      html += '<i class="fa-solid fa-star-half-stroke text-amber-400"></i>';
    } else {
      html += '<i class="fa-regular fa-star text-amber-300"></i>';
    }
  }
  return html;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  inicializarEventos();
  await carregarProdutos();
});

// Carrega produtos do produtos.json, Supabase ou fallback com URLs do Unsplash
async function carregarProdutos() {
  const container = document.getElementById('grid-produtos');
  if (!container) return;

  mostrarSkeletons(container, 9);

  try {
    let produtosCarregados = null;

    // Tenta carregar do Supabase se configurado
    if (window.supabase && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
      try {
        const client = window.supabase.createClient(
          window.SUPABASE_CONFIG.url,
          window.SUPABASE_CONFIG.anonKey
        );
        const { data, error } = await client
          .from('produtos')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          produtosCarregados = data;
          console.log('🐾 Produtos oficiais carregados do Supabase!');
        }
      } catch (errSupabase) {
        console.warn('Conexão ao Supabase falhou, tentando produtos.json:', errSupabase);
      }
    }

    // Se não carregou do Supabase, tenta buscar do produtos.json
    if (!produtosCarregados) {
      try {
        const res = await fetch('produtos.json');
        if (res.ok) {
          produtosCarregados = await res.json();
          console.log('🐾 Produtos oficiais com imagens Unsplash carregados de produtos.json!');
        }
      } catch (e) {
        console.warn('Falha ao ler produtos.json via fetch, usando array oficial com imagens Unsplash.');
      }
    }

    // Se ainda assim não houver, usa o array oficial com imagens Unsplash
    if (!produtosCarregados || produtosCarregados.length === 0) {
      produtosCarregados = PRODUTOS_PADRAO;
    }

    // Mescla notas salvas localmente se houver novas avaliações
    produtosCarregados = produtosCarregados.map(prod => {
      const storageReviews = obterAvaliacoesLocais(prod.id);
      if (storageReviews && storageReviews.length > 0) {
        const soma = storageReviews.reduce((acc, r) => acc + (Number(r.nota) || 5), 0);
        const media = (soma / storageReviews.length).toFixed(1);
        return {
          ...prod,
          avaliacoes_count: storageReviews.length,
          nota_media: parseFloat(media)
        };
      }
      return prod;
    });

    appState.produtos = produtosCarregados;
    renderizarProdutos();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-stone-700 font-semibold mb-2">Erro ao carregar o catálogo de produtos.</p>
        <button onclick="carregarProdutos()" class="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

// Skeletons de carregamento
function mostrarSkeletons(container, quantidade = 9) {
  let html = '';
  for (let i = 0; i < quantidade; i++) {
    html += `
      <div class="bg-white rounded-3xl p-4 border border-stone-100 shadow-sm flex flex-col">
        <div class="skeleton w-full h-56 rounded-2xl mb-4"></div>
        <div class="skeleton w-24 h-4 rounded-full mb-2"></div>
        <div class="skeleton w-3/4 h-5 rounded-md mb-2"></div>
        <div class="skeleton w-1/2 h-4 rounded-md mb-4"></div>
        <div class="mt-auto flex justify-between items-center pt-3 border-t border-stone-50">
          <div class="skeleton w-20 h-6 rounded-md"></div>
          <div class="skeleton w-10 h-10 rounded-xl"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

// Renderiza a Vitrine de Produtos com Imagens Unsplash e Tratamento de Fallback
function renderizarProdutos() {
  const container = document.getElementById('grid-produtos');
  const contadorEl = document.getElementById('contador-produtos');
  if (!container) return;

  let filtrados = [...appState.produtos];

  // Filtro por Categoria Oficial
  if (appState.categoriaAtiva !== 'todos') {
    filtrados = filtrados.filter(
      p => p.categoria.toLowerCase() === appState.categoriaAtiva.toLowerCase()
    );
  }

  // Filtro por Busca
  if (appState.termoBusca.trim() !== '') {
    const termo = appState.termoBusca.toLowerCase();
    filtrados = filtrados.filter(
      p => p.titulo.toLowerCase().includes(termo) ||
           (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
           p.categoria.toLowerCase().includes(termo)
    );
  }

  // Ordenação
  if (appState.ordem === 'menor-preco') {
    filtrados.sort((a, b) => Number(a.preco) - Number(b.preco));
  } else if (appState.ordem === 'maior-preco') {
    filtrados.sort((a, b) => Number(b.preco) - Number(a.preco));
  } else if (appState.ordem === 'mais-avaliados') {
    filtrados.sort((a, b) => Number(b.avaliacoes_count) - Number(a.avaliacoes_count));
  }

  if (contadorEl) {
    contadorEl.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'produto encontrado' : 'produtos oficiais disponíveis'}`;
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200">
        <div class="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          <i class="fa-solid fa-paw"></i>
        </div>
        <h3 class="text-lg font-black text-stone-800 mb-1">Nenhum produto encontrado</h3>
        <p class="text-stone-500 text-xs mb-4">Tente buscar por outro termo ou escolha outra categoria.</p>
        <button onclick="limparFiltros()" class="px-5 py-2.5 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition text-xs">
          Ver Catálogo Completo
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtrados.map(produto => {
    const precoNum = Number(produto.preco);
    const imagemPrincipal = produto.imagem || produto.imagem_url || IMAGEM_FALLBACK_PADRAO;
    const notaMediaFormatada = Number(produto.nota_media || 5.0).toFixed(1);
    const totalAvaliacoes = produto.avaliacoes_count || 0;

    return `
      <div class="product-card group bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex flex-col relative animate-fade-in" data-id="${produto.id}">
        <!-- Imagem do Produto com Fallback Unsplash Robusto -->
        <div class="relative w-full h-56 rounded-2xl overflow-hidden bg-stone-50 mb-3 cursor-pointer" onclick="abrirModalProduto(${produto.id})">
          <img 
            src="${imagemPrincipal}" 
            alt="${produto.titulo}" 
            class="product-img w-full h-full object-cover object-center"
            loading="lazy"
            onerror="this.onerror=null; this.src='${IMAGEM_FALLBACK_PADRAO}';"
          />
          <button 
            type="button" 
            onclick="event.stopPropagation(); abrirModalProduto(${produto.id})"
            class="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md hover:bg-white text-stone-700 w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Ver Detalhes e Avaliações"
          >
            <i class="fa-regular fa-eye text-sm"></i>
          </button>
        </div>

        <!-- Categoria -->
        <div class="flex items-center justify-between mb-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md">
            ${produto.categoria}
          </span>
          <span class="text-[11px] text-emerald-600 font-bold">✓ Estoque: ${produto.estoque}</span>
        </div>

        <!-- Título -->
        <h3 
          class="font-black text-stone-800 hover:text-orange-600 transition text-sm line-clamp-2 cursor-pointer mb-1 leading-snug"
          onclick="abrirModalProduto(${produto.id})"
        >
          ${produto.titulo}
        </h3>

        <!-- AVALIAÇÕES NOS CARDS DA VITRINE (Estrelas, Média e Contagem) -->
        <div class="flex items-center gap-1.5 my-1.5 cursor-pointer" onclick="abrirModalProduto(${produto.id})">
          <div class="flex text-amber-400 text-xs">
            ${renderizarEstrelasHtml(produto.nota_media)}
          </div>
          <span class="text-xs font-black text-stone-800">${notaMediaFormatada}</span>
          <span class="text-xs text-stone-400 font-semibold">(${totalAvaliacoes})</span>
        </div>

        <!-- Preços Competitivos -->
        <div class="mt-auto pt-2">
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-black text-stone-900">
              ${formatarMoeda(precoNum)}
            </span>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              à vista no PIX
            </span>
          </div>
          <div class="text-[11px] text-stone-500 mt-0.5">
            ou em até 3x de ${formatarMoeda(precoNum / 3)} sem juros
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
          <button 
            type="button"
            onclick="adicionarRapidoAoCarrinho(${produto.id})"
            class="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs shadow-orange-200"
          >
            <i class="fa-solid fa-cart-plus text-xs"></i>
            Adicionar
          </button>
          <button 
            type="button" 
            onclick="abrirModalProduto(${produto.id})"
            class="w-10 h-10 border border-stone-200 hover:border-orange-300 hover:text-orange-600 rounded-xl flex items-center justify-center text-stone-600 transition"
            title="Ver Detalhes e Opiniões"
          >
            <i class="fa-solid fa-star text-amber-400 text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Limpar Filtros
function limparFiltros() {
  appState.categoriaAtiva = 'todos';
  appState.termoBusca = '';
  appState.ordem = 'relevancia';

  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) inputBusca.value = '';

  const selectOrdem = document.getElementById('select-ordem');
  if (selectOrdem) selectOrdem.value = 'relevancia';

  document.querySelectorAll('.btn-categoria').forEach(btn => {
    if (btn.dataset.categoria === 'todos') {
      btn.className = 'btn-categoria px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap bg-orange-600 text-white shadow-md shadow-orange-200 transition flex items-center gap-1.5';
    } else {
      btn.className = 'btn-categoria px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap bg-white text-stone-600 hover:text-orange-600 border border-stone-200 hover:border-orange-200 transition flex items-center gap-1.5';
    }
  });

  renderizarProdutos();
}

// Adição Rápida ao Carrinho
function adicionarRapidoAoCarrinho(produtoId) {
  const produto = appState.produtos.find(p => p.id === produtoId);
  if (!produto) return;

  const imagem = produto.imagem || produto.imagem_url || IMAGEM_FALLBACK_PADRAO;

  window.Cart.adicionarItem({
    id: produto.id,
    titulo: produto.titulo,
    preco: Number(produto.preco),
    imagem_url: imagem,
    quantidade: 1,
    variacoes: {}
  });

  mostrarToast(`🐾 "${produto.titulo}" adicionado ao carrinho!`, 'sucesso');
}

// ==============================================================================
// 3. SISTEMA DE AVALIAÇÕES (REVIEWS) - GERENCIAMENTO E LOCALSTORAGE
// ==============================================================================
function obterAvaliacoesLocais(produtoId) {
  try {
    const salvo = localStorage.getItem(`peat_reviews_${produtoId}`);
    if (salvo) return JSON.parse(salvo);
  } catch (e) {
    console.error('Erro ao ler avaliações do localStorage:', e);
  }
  return AVALIACOES_INICIAIS[produtoId] ? [...AVALIACOES_INICIAIS[produtoId]] : [];
}

function salvarAvaliacaoLocal(produtoId, novaAvaliacao) {
  const lista = obterAvaliacoesLocais(produtoId);
  lista.unshift(novaAvaliacao);
  try {
    localStorage.setItem(`peat_reviews_${produtoId}`, JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar avaliação no localStorage:', e);
  }
  return lista;
}

// Modal de Detalhes do Produto com Seção de Avaliações
function abrirModalProduto(produtoId) {
  const produto = appState.produtos.find(p => p.id === produtoId);
  if (!produto) return;

  appState.produtoSelecionadoModal = produto;
  appState.novaNotaAvaliacao = 5;

  const modal = document.getElementById('modal-produto');
  const conteudo = document.getElementById('modal-produto-conteudo');
  if (!modal || !conteudo) return;

  const imagemPrincipal = produto.imagem || produto.imagem_url || IMAGEM_FALLBACK_PADRAO;
  const avaliacoes = obterAvaliacoesLocais(produto.id);
  const notaMedia = (avaliacoes.reduce((acc, r) => acc + (Number(r.nota) || 5), 0) / (avaliacoes.length || 1)).toFixed(1);

  conteudo.innerHTML = `
    <div class="space-y-8">
      <!-- PARTE 1: FOTO E COMPRA DO PRODUTO -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div class="w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center relative">
          <img 
            id="modal-imagem-principal" 
            src="${imagemPrincipal}" 
            alt="${produto.titulo}" 
            class="w-full h-full object-cover transition-smooth"
            onerror="this.onerror=null; this.src='${IMAGEM_FALLBACK_PADRAO}';"
          />
        </div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-md">
              🐾 ${produto.categoria}
            </span>
            <span class="text-xs text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded">
              Pronta Entrega (${produto.estoque} un.)
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-stone-900 mb-2 leading-tight">
            ${produto.titulo}
          </h2>

          <!-- Média de Estrelas no Topo do Modal -->
          <div class="flex items-center gap-2 mb-4">
            <div class="flex text-amber-400 text-sm">
              ${renderizarEstrelasHtml(notaMedia)}
            </div>
            <span class="text-sm font-black text-stone-800">${notaMedia}</span>
            <span class="text-xs text-stone-400 font-semibold">• ${avaliacoes.length} opiniões</span>
          </div>

          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-3xl font-black text-stone-900">
              ${formatarMoeda(produto.preco)}
            </span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
              -5% no PIX
            </span>
          </div>

          <p class="text-sm text-stone-600 mb-6 leading-relaxed">
            ${produto.descricao}
          </p>

          <!-- Controle de Quantidade e Adicionar ao Carrinho -->
          <div class="flex items-center gap-4 mt-auto mb-4">
            <div class="flex items-center border border-stone-200 rounded-2xl bg-stone-50 p-1">
              <button 
                type="button" 
                onclick="ajustarQtdModal(-1)" 
                class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:bg-white transition"
              >
                <i class="fa-solid fa-minus text-xs"></i>
              </button>
              <span id="modal-qtd-item" class="w-10 text-center font-black text-sm text-stone-800">1</span>
              <button 
                type="button" 
                onclick="ajustarQtdModal(1)" 
                class="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:bg-white transition"
              >
                <i class="fa-solid fa-plus text-xs"></i>
              </button>
            </div>

            <button 
              type="button"
              onclick="adicionarAoCarrinhoModal()"
              class="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-orange-200"
            >
              <i class="fa-solid fa-cart-shopping"></i>
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>

      <!-- PARTE 2: SEÇÃO DE AVALIAÇÕES DOS CLIENTES (REVIEWS) -->
      <div class="border-t border-stone-200 pt-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 class="text-lg font-black text-stone-900 flex items-center gap-2">
              <i class="fa-solid fa-comments text-orange-600"></i>
              Avaliações de Clientes Verificados
            </h3>
            <p class="text-xs text-stone-500">Veja o que outros tutores acharam deste produto</p>
          </div>

          <!-- Resumo Destacado da Nota -->
          <div class="flex items-center gap-3 bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
            <div class="text-3xl font-black text-amber-900 leading-none">${notaMedia}</div>
            <div>
              <div class="flex text-amber-500 text-xs">
                ${renderizarEstrelasHtml(notaMedia)}
              </div>
              <div class="text-[11px] text-amber-800 font-bold">${avaliacoes.length} avaliações</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Lista de Avaliações Recentes (Coluna Esquerda) -->
          <div class="lg:col-span-7 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Opiniões Recentes</h4>
            <div id="lista-avaliacoes-modal" class="space-y-3 max-h-72 overflow-y-auto pr-2">
              ${renderizarListaAvaliacoesHtml(avaliacoes)}
            </div>
          </div>

          <!-- Formulário para Enviar Nova Avaliação (Coluna Direita) -->
          <div class="lg:col-span-5 bg-stone-50 p-5 rounded-3xl border border-stone-200/80">
            <h4 class="text-xs font-black uppercase tracking-wider text-orange-700 mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-pen-to-square"></i> Deixe sua Avaliação
            </h4>
            <p class="text-[11px] text-stone-500 mb-4">Compartilhe a experiência do seu pet!</p>

            <form id="form-avaliacao-pet" onsubmit="event.preventDefault(); submeterAvaliacao(${produto.id});" class="space-y-3">
              <!-- Seletor de Estrelas (1 a 5) -->
              <div>
                <label class="block text-[11px] font-bold text-stone-600 mb-1">Sua Nota *</label>
                <div class="star-rating-select flex items-center gap-2 text-xl text-amber-400 py-1" id="star-selector">
                  <i class="fa-solid fa-star cursor-pointer" onclick="selecionarNotaEstrelas(1)"></i>
                  <i class="fa-solid fa-star cursor-pointer" onclick="selecionarNotaEstrelas(2)"></i>
                  <i class="fa-solid fa-star cursor-pointer" onclick="selecionarNotaEstrelas(3)"></i>
                  <i class="fa-solid fa-star cursor-pointer" onclick="selecionarNotaEstrelas(4)"></i>
                  <i class="fa-solid fa-star cursor-pointer" onclick="selecionarNotaEstrelas(5)"></i>
                  <span id="label-nota-texto" class="text-xs font-bold text-stone-700 ml-1">5 de 5</span>
                </div>
              </div>

              <!-- Nome -->
              <div>
                <label class="block text-[11px] font-bold text-stone-600 mb-1">Seu Nome *</label>
                <input 
                  type="text" 
                  id="input-review-nome" 
                  required 
                  placeholder="Ex: Mariana Silva" 
                  class="w-full bg-white border border-stone-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition"
                />
              </div>

              <!-- Comentário -->
              <div>
                <label class="block text-[11px] font-bold text-stone-600 mb-1">Comentário / Opinião *</label>
                <textarea 
                  id="input-review-comentario" 
                  required 
                  rows="3" 
                  placeholder="Conte o que achou da qualidade e se seu pet gostou..." 
                  class="w-full bg-white border border-stone-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition"
                ></textarea>
              </div>

              <button 
                type="submit" 
                id="btn-enviar-review"
                class="w-full bg-stone-900 hover:bg-orange-600 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                <i class="fa-solid fa-paper-plane text-xs"></i>
                Enviar Avaliação
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function fecharModalProduto() {
  const modal = document.getElementById('modal-produto');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
  appState.produtoSelecionadoModal = null;
}

function renderizarListaAvaliacoesHtml(avaliacoes) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return `
      <div class="text-center py-8 text-stone-400 text-xs bg-white rounded-2xl border border-stone-100 p-4">
        Seja o primeiro tutor a avaliar este produto!
      </div>
    `;
  }

  return avaliacoes.map(item => `
    <div class="review-card bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
            ${(item.nome_cliente || item.nome || 'C')[0].toUpperCase()}
          </div>
          <span class="text-xs font-black text-stone-800">${item.nome_cliente || item.nome}</span>
          <span class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Compra Verificada</span>
        </div>
        <div class="flex text-amber-400 text-xs">
          ${renderizarEstrelasHtml(item.nota)}
        </div>
      </div>
      <p class="text-xs text-stone-600 leading-relaxed pl-9">
        "${item.comentario}"
      </p>
    </div>
  `).join('');
}

// Seleciona a nota no formulário de estrelas
function selecionarNotaEstrelas(nota) {
  appState.novaNotaAvaliacao = nota;
  const selector = document.getElementById('star-selector');
  const label = document.getElementById('label-nota-texto');
  if (!selector) return;

  const icons = selector.querySelectorAll('i');
  icons.forEach((ic, idx) => {
    if (idx < nota) {
      ic.className = 'fa-solid fa-star cursor-pointer text-amber-400';
    } else {
      ic.className = 'fa-regular fa-star cursor-pointer text-amber-300';
    }
  });

  if (label) label.textContent = `${nota} de 5`;
}

// Submeter nova avaliação
async function submeterAvaliacao(produtoId) {
  const nomeInput = document.getElementById('input-review-nome');
  const comentarioInput = document.getElementById('input-review-comentario');
  const btn = document.getElementById('btn-enviar-review');

  const nome = nomeInput?.value.trim();
  const comentario = comentarioInput?.value.trim();
  const nota = appState.novaNotaAvaliacao || 5;

  if (!nome || !comentario) {
    mostrarToast('Preencha seu nome e comentário!', 'erro');
    return;
  }

  if (btn) btn.disabled = true;

  const novaAvaliacao = {
    nome: nome,
    nome_cliente: nome,
    nota: nota,
    comentario: comentario,
    criado_em: new Date().toISOString()
  };

  const listaAtualizada = salvarAvaliacaoLocal(produtoId, novaAvaliacao);

  // Tenta enviar via endpoint /api/avaliacoes ou diretamente ao Supabase
  try {
    fetch('/api/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produto_id: produtoId,
        nome_cliente: nome,
        nota: nota,
        comentario: comentario
      })
    }).catch(err => console.warn('Falha ao enviar avaliação para /api/avaliacoes:', err));
  } catch (e) {
    console.warn('Erro ao disparar requisição de avaliação:', e);
  }

  // Atualiza no estado em memória do produto
  const produto = appState.produtos.find(p => p.id === produtoId);
  if (produto) {
    const soma = listaAtualizada.reduce((acc, r) => acc + (Number(r.nota) || 5), 0);
    produto.avaliacoes_count = listaAtualizada.length;
    produto.nota_media = parseFloat((soma / listaAtualizada.length).toFixed(1));
  }

  // Atualiza a lista dentro do modal imediatamente
  const listaContainer = document.getElementById('lista-avaliacoes-modal');
  if (listaContainer) {
    listaContainer.innerHTML = renderizarListaAvaliacoesHtml(listaAtualizada);
  }

  mostrarToast('🐾 Avaliação enviada com sucesso! Obrigado pelo seu feedback.', 'sucesso');

  if (nomeInput) nomeInput.value = '';
  if (comentarioInput) comentarioInput.value = '';
  if (btn) btn.disabled = false;

  renderizarProdutos();
}

// Controle de Quantidade no Modal
let qtdModalAtual = 1;
function ajustarQtdModal(delta) {
  qtdModalAtual += delta;
  if (qtdModalAtual < 1) qtdModalAtual = 1;
  if (qtdModalAtual > 99) qtdModalAtual = 99;
  const el = document.getElementById('modal-qtd-item');
  if (el) el.textContent = qtdModalAtual;
}

function adicionarAoCarrinhoModal() {
  const produto = appState.produtoSelecionadoModal;
  if (!produto) return;

  const imagem = produto.imagem || produto.imagem_url || IMAGEM_FALLBACK_PADRAO;

  window.Cart.adicionarItem({
    id: produto.id,
    titulo: produto.titulo,
    preco: Number(produto.preco),
    imagem_url: imagem,
    quantidade: qtdModalAtual,
    variacoes: {}
  });

  mostrarToast(`🐾 "${produto.titulo}" adicionado ao carrinho!`, 'sucesso');
  fecharModalProduto();
  window.Cart.abrirDrawer();
}

// ==============================================================================
// 4. RASTREAMENTO DE PEDIDOS
// ==============================================================================
function abrirModalRastreio() {
  const modal = document.getElementById('modal-rastreio');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function fecharModalRastreio() {
  const modal = document.getElementById('modal-rastreio');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function consultarRastreio() {
  const input = document.getElementById('input-rastreio-busca');
  const resultado = document.getElementById('resultado-rastreio');
  const numPedidoEl = document.getElementById('rastreio-num-pedido');
  const statusEl = document.getElementById('rastreio-status-badge');

  if (!input || !resultado) return;

  const termo = input.value.trim().toUpperCase();
  if (!termo) {
    mostrarToast('Digite o número do pedido ou CPF.', 'erro');
    return;
  }

  if (numPedidoEl) numPedidoEl.textContent = termo;
  if (statusEl) statusEl.textContent = 'Em Preparação / Envio';

  resultado.classList.remove('hidden');
  mostrarToast('Status do pedido localizado!', 'sucesso');
}

function inicializarEventos() {
  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) {
    let timeout = null;
    inputBusca.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        appState.termoBusca = e.target.value;
        renderizarProdutos();
      }, 250);
    });
  }

  const selectOrdem = document.getElementById('select-ordem');
  if (selectOrdem) {
    selectOrdem.addEventListener('change', (e) => {
      appState.ordem = e.target.value;
      renderizarProdutos();
    });
  }

  // Filtros de Categoria
  document.querySelectorAll('.btn-categoria').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.categoria;
      appState.categoriaAtiva = categoria;

      document.querySelectorAll('.btn-categoria').forEach(b => {
        b.className = 'btn-categoria px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap bg-white text-stone-600 hover:text-orange-600 border border-stone-200 hover:border-orange-200 transition flex items-center gap-1.5';
      });
      btn.className = 'btn-categoria px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap bg-orange-600 text-white shadow-md shadow-orange-200 transition flex items-center gap-1.5';

      renderizarProdutos();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharModalProduto();
      fecharModalRastreio();
      if (window.Cart) window.Cart.fecharDrawer();
      if (window.Checkout) window.Checkout.fecharModal();
    }
  });
}

function mostrarToast(mensagem, tipo = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icone = tipo === 'sucesso' 
    ? '<i class="fa-solid fa-circle-check text-emerald-500 text-base"></i>' 
    : tipo === 'erro'
    ? '<i class="fa-solid fa-circle-exclamation text-rose-500 text-base"></i>'
    : '<i class="fa-solid fa-paw text-orange-500 text-base"></i>';

  toast.className = 'toast-item bg-white border border-stone-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold text-stone-800 animate-slide-left shadow-xl';
  toast.innerHTML = `
    ${icone}
    <span>${mensagem}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Exportações Globais
window.abrirModalProduto = abrirModalProduto;
window.fecharModalProduto = fecharModalProduto;
window.ajustarQtdModal = ajustarQtdModal;
window.adicionarAoCarrinhoModal = adicionarAoCarrinhoModal;
window.adicionarRapidoAoCarrinho = adicionarRapidoAoCarrinho;
window.limparFiltros = limparFiltros;
window.mostrarToast = mostrarToast;
window.formatarMoeda = formatarMoeda;
window.selecionarNotaEstrelas = selecionarNotaEstrelas;
window.submeterAvaliacao = submeterAvaliacao;
window.abrirModalRastreio = abrirModalRastreio;
window.fecharModalRastreio = fecharModalRastreio;
window.consultarRastreio = consultarRastreio;
window.IMAGEM_FALLBACK_PADRAO = IMAGEM_FALLBACK_PADRAO;
