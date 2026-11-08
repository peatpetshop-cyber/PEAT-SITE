/**
 * PEAT PET SHOP - WEBHOOK MERCADO PAGO
 * Rota: /api/webhook-mercadopago
 * Método: POST
 * Recebe notificações instantâneas de pagamento (IPN/Webhooks) e atualiza o Supabase
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Webhook Mercado Pago ativo e operacional.');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  }

  try {
    const { type, data, action } = req.body || {};
    const query = req.query || {};

    // O Mercado Pago pode enviar o ID do pagamento via body.data.id ou query.id / query['data.id']
    const paymentId = data?.id || query.id || query['data.id'];
    const eventType = type || action || query.type || query.topic;

    console.log(`[Webhook Mercado Pago] Evento recebido: ${eventType}, ID: ${paymentId}`);

    if (!paymentId || (eventType && !eventType.includes('payment'))) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!mpAccessToken) {
      console.warn('MERCADO_PAGO_ACCESS_TOKEN não definido. Webhook processado em modo simulação.');
      return res.status(200).json({ received: true, simulated: true });
    }

    // Consulta os detalhes reais do pagamento na API do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!mpRes.ok) {
      console.error(`Erro ao consultar pagamento ${paymentId} no Mercado Pago.`);
      return res.status(200).json({ received: true, error: 'Mercado Pago request failed' });
    }

    const paymentData = await mpRes.json();
    const mpStatus = paymentData.status; // 'approved', 'pending', 'rejected', 'cancelled'
    const orderRef = paymentData.external_reference || paymentData.description;

    console.log(`[Mercado Pago] Pagamento ${paymentId} está: ${mpStatus}`);

    // Mapeamento de status para o banco do Supabase
    let novoStatus = 'pendente';
    if (mpStatus === 'approved') novoStatus = 'aprovado';
    else if (mpStatus === 'rejected') novoStatus = 'recusado';
    else if (mpStatus === 'cancelled') novoStatus = 'cancelado';

    // Atualiza a tabela 'pedidos' no Supabase
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Tenta atualizar pelo payment_id ou pelo número do pedido
      const { data: updateData, error } = await supabase
        .from('pedidos')
        .update({
          status_pagamento: novoStatus,
          payment_id: String(paymentId)
        })
        .or(`payment_id.eq.${paymentId},numero_pedido.ilike.%${orderRef || ''}%`);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error.message);
      } else {
        console.log(`✅ Pedido atualizado no Supabase com status: ${novoStatus}`);
      }
    }

    return res.status(200).json({
      success: true,
      paymentId,
      status: novoStatus
    });

  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
