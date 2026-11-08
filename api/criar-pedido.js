/**
 * Serverless Function (Vercel) para Salvar Pedido no Supabase
 * Rota: /api/criar-pedido
 * Método: POST
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Cabeçalhos CORS
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
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const pedido = req.body;

    if (!pedido || !pedido.cliente_email || !pedido.itens || !pedido.total) {
      return res.status(400).json({ success: false, message: 'Dados do pedido incompletos.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('pedidos')
        .insert([{
          numero_pedido: pedido.numero_pedido || `PEAT-${Date.now().toString().slice(-6)}`,
          cliente_nome: pedido.cliente_nome,
          cliente_email: pedido.cliente_email,
          cliente_cpf: pedido.cliente_cpf,
          cliente_telefone: pedido.cliente_telefone || '',
          endereco: pedido.endereco,
          itens: pedido.itens,
          subtotal: pedido.subtotal,
          valor_frete: pedido.valor_frete || 0,
          total: pedido.total,
          metodo_pagamento: pedido.metodo_pagamento,
          status_pagamento: pedido.status_pagamento || 'pendente',
          payment_id: pedido.payment_id || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar pedido no Supabase:', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        pedido: data
      });
    }

    // Se Supabase ainda não estiver configurado nas variáveis de ambiente, retorna sucesso simulado
    return res.status(201).json({
      success: true,
      pedido: {
        id: `mock-${Date.now()}`,
        numero_pedido: pedido.numero_pedido,
        ...pedido,
        criado_em: new Date().toISOString()
      },
      aviso: 'Configuração do Supabase pendente no .env da Vercel. Pedido simulado com sucesso.'
    });

  } catch (err) {
    console.error('Erro interno em criar-pedido:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
