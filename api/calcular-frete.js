/**
 * Serverless Function (Vercel) para Cálculo de Frete com a API do Melhor Envio.
 * Rota: /api/calcular-frete
 * Método: POST
 */

export default async function handler(req, res) {
  // Configuração de cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido. Utilize POST.' });
  }

  try {
    const { cep_destino, itens = [] } = req.body || {};

    if (!cep_destino) {
      return res.status(400).json({ success: false, message: 'O CEP de destino é obrigatório.' });
    }

    const cepLimpo = String(cep_destino).replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return res.status(400).json({ success: false, message: 'CEP inválido. Deve conter 8 dígitos numéricos.' });
    }

    // Variáveis de ambiente configuráveis na Vercel
    const tokenMelhorEnvio = process.env.MELHOR_ENVIO_TOKEN;
    const cepOrigem = (process.env.MELHOR_ENVIO_CEP_ORIGEM || '01001000').replace(/\D/g, ''); // Padrão: Sé / SP
    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true';

    // Se houver token do Melhor Envio configurado, consome a API oficial
    if (tokenMelhorEnvio) {
      const baseUrl = isSandbox 
        ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate' 
        : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

      // Calcula dimensões e peso aproximados com base nos itens
      const quantidadeTotal = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0) || 1;
      const pesoEstimado = Math.min(Math.max(0.3 * quantidadeTotal, 0.5), 30.0); // em kg

      const payload = {
        from: { postal_code: cepOrigem },
        to: { postal_code: cepLimpo },
        package: {
          height: 15, // cm
          width: 20,  // cm
          length: 25, // cm
          weight: pesoEstimado
        },
        options: {
          receipt: false,
          own_hand: false
        }
      };

      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenMelhorEnvio}`,
            'User-Agent': 'PeatStore/1.0 (suporte@peatstore.com)'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const cotacoes = await response.json();
          // Filtra serviços válidos sem erro de cálculo
          const opcoesValidas = cotacoes
            .filter(c => !c.error && c.price && Number(c.price) > 0)
            .map(c => ({
              id: c.id,
              nome: c.name,
              empresa: c.company?.name || 'Transportadora',
              logo: c.company?.picture || '',
              preco: Number(c.price),
              prazo_dias: c.delivery_time || 5,
              descricao: `Entrega em até ${c.delivery_time} dias úteis`
            }));

          if (opcoesValidas.length > 0) {
            return res.status(200).json({
              success: true,
              origem: 'melhor_envio_api',
              opcoes: opcoesValidas
            });
          }
        }
      } catch (apiError) {
        console.warn('Erro ao conectar com Melhor Envio, recorrendo ao cálculo inteligente local:', apiError.message);
      }
    }

    // FALLBACK INTELIGENTE (Simulação realista caso o token do Melhor Envio não esteja cadastrado)
    // Calcula com base na região postal do Brasil (primeiro dígito do CEP):
    const primeiroDigito = parseInt(cepLimpo[0], 10);
    
    // Tabela regional aproximada (Base SP - 01001-000)
    let multiplicador = 1.0;
    let diasBasePac = 6;
    let diasBaseSedex = 2;

    switch (primeiroDigito) {
      case 0:
      case 1: // Grande SP e Interior SP
        multiplicador = 1.0;
        diasBasePac = 4;
        diasBaseSedex = 1;
        break;
      case 2: // RJ e ES
        multiplicador = 1.25;
        diasBasePac = 6;
        diasBaseSedex = 2;
        break;
      case 3: // MG
        multiplicador = 1.2;
        diasBasePac = 5;
        diasBaseSedex = 2;
        break;
      case 8:
      case 9: // PR, SC, RS (Sul)
        multiplicador = 1.35;
        diasBasePac = 7;
        diasBaseSedex = 3;
        break;
      case 7: // DF, GO, TO, MT, MS (Centro-Oeste)
        multiplicador = 1.45;
        diasBasePac = 8;
        diasBaseSedex = 3;
        break;
      case 4:
      case 5:
      case 6: // Nordeste e Norte
        multiplicador = 1.8;
        diasBasePac = 11;
        diasBaseSedex = 4;
        break;
      default:
        multiplicador = 1.3;
    }

    const valorPac = Number((18.90 * multiplicador).toFixed(2));
    const valorSedex = Number((34.50 * multiplicador).toFixed(2));

    const opcoesLocais = [
      {
        id: 'pac_correios',
        nome: 'PAC Econômico',
        empresa: 'Correios',
        logo: 'https://assets.melhorenvio.com.br/companies/correios.png',
        preco: valorPac,
        prazo_dias: diasBasePac,
        descricao: `Entrega econômica em até ${diasBasePac} dias úteis`
      },
      {
        id: 'sedex_correios',
        nome: 'SEDEX Expresso',
        empresa: 'Correios',
        logo: 'https://assets.melhorenvio.com.br/companies/correios.png',
        preco: valorSedex,
        prazo_dias: diasBaseSedex,
        descricao: `Entrega rápida em até ${diasBaseSedex} dias úteis`
      }
    ];

    return res.status(200).json({
      success: true,
      origem: tokenMelhorEnvio ? 'fallback_temporario' : 'simulacao_inteligente',
      aviso: !tokenMelhorEnvio ? 'Modo de teste: defina MELHOR_ENVIO_TOKEN nas variáveis de ambiente da Vercel para fretes oficiais.' : undefined,
      opcoes: opcoesLocais
    });

  } catch (error) {
    console.error('Erro na função de cálculo de frete:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao calcular o frete. Tente novamente mais tarde.',
      erro: error.message
    });
  }
}
