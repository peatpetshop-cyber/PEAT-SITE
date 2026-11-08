/**
 * PEAT PET SHOP - API SERVERLESS DE AVALIAÇÕES (REVIEWS)
 * Rota: /api/avaliacoes
 * Métodos: GET (obter avaliações de um produto) | POST (enviar nova avaliação)
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  // GET: Retorna as avaliações de um produto específico
  if (req.method === 'GET') {
    const { produto_id } = req.query;

    if (!produto_id) {
      return res.status(400).json({ success: false, message: 'O ID do produto é obrigatório.' });
    }

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from('avaliacoes')
          .select('*')
          .eq('produto_id', parseInt(produto_id, 10))
          .order('criado_em', { ascending: false });

        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, avaliacoes: data || [] });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      origem: 'simulacao',
      avaliacoes: []
    });
  }

  // POST: Cadastra uma nova avaliação de cliente
  if (req.method === 'POST') {
    const { produto_id, nome_cliente, nota, comentario } = req.body || {};

    if (!produto_id || !nome_cliente || !nota || !comentario) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const notaNum = parseInt(nota, 10);
    if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ success: false, message: 'A nota deve ser um número entre 1 e 5.' });
    }

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Insere a avaliação na tabela 'avaliacoes'
        const { data: novaAvaliacao, error: errInsert } = await supabase
          .from('avaliacoes')
          .insert([{
            produto_id: parseInt(produto_id, 10),
            nome_cliente: String(nome_cliente).trim(),
            nota: notaNum,
            comentario: String(comentario).trim()
          }])
          .select()
          .single();

        if (errInsert) {
          return res.status(500).json({ success: false, error: errInsert.message });
        }

        // Recalcula e atualiza a média do produto na tabela 'produtos'
        const { data: todasAvaliacoes } = await supabase
          .from('avaliacoes')
          .select('nota')
          .eq('produto_id', parseInt(produto_id, 10));

        if (todasAvaliacoes && todasAvaliacoes.length > 0) {
          const totalCount = todasAvaliacoes.length;
          const somaNotas = todasAvaliacoes.reduce((acc, a) => acc + a.nota, 0);
          const novaMedia = parseFloat((somaNotas / totalCount).toFixed(1));

          await supabase
            .from('produtos')
            .update({
              avaliacoes_count: totalCount,
              nota_media: novaMedia
            })
            .eq('id', parseInt(produto_id, 10));
        }

        return res.status(201).json({
          success: true,
          avaliacao: novaAvaliacao
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    // Modo simulação caso o Supabase não esteja conectado
    return res.status(201).json({
      success: true,
      origem: 'simulacao',
      avaliacao: {
        id: Date.now(),
        produto_id,
        nome_cliente,
        nota: notaNum,
        comentario,
        criado_em: new Date().toISOString()
      }
    });
  }

  return res.status(405).json({ success: false, message: 'Método não permitido.' });
}
