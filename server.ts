import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initializer for Gemini
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Search Grounding endpoint with Google Search
app.post('/api/ai/search-drills', async (req, res) => {
  try {
    const { category, modality, theme, ageGroup } = req.body;
    const ai = getAI();
    
    const prompt = `Você é um coordenador pedagógico e treinador de futebol/futsal de base credenciado pela CBF/FIFA.
Pesquise e sugira um plano de treino prático detalhado com exercícios modernos para:
- Modalidade: ${modality || 'Futebol de Campo / Futsal'}
- Categoria / Faixa etária: ${category || ageGroup || 'Sub-11'}
- Foco técnico/tático da aula: ${theme || 'Passe, Domínio orientado e Tomada de Decisão em espaço reduzido'}

Retorne uma estrutura clara com:
1. Aquecimento lúdico / Ativação motora (10 min)
2. Exercício 1: Fundamento analítico/global (15 min)
3. Exercício 2: Jogo reduzido com regras condicionadas / enfrentamento (20 min)
4. Jogo livre com aplicação do tema (15 min)
5. Dicas pedagógicas para o treinador e feedbacks para correção de erros comuns.

Inclua referências e boas práticas metodológicas recentes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || 'Nenhum plano gerado.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    res.json({ 
      plan: text,
      sources: searchChunks.map((c: any) => c.web?.title || c.web?.uri).filter(Boolean)
    });
  } catch (error: any) {
    console.error('Error generating drill plan:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar plano pedagógico com IA' });
  }
});

// Image analysis endpoint (for receipts or player technique photo analysis)
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, type, extraContext } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem em base64 não fornecida.' });
    }

    const ai = getAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let prompt = '';
    if (type === 'receipt') {
      prompt = `Analise este comprovante de pagamento / PIX de mensalidade de escolinha de futebol.
Identifique e extraia em formato estruturado:
- É um comprovante PIX ou bancário válido? (Sim/Não)
- Valor transferido (ex: R$ 150,00)
- Data e Hora do pagamento
- Nome do pagador / titular
- Nome do recebedor / favorecido
- ID da transação / Autenticação
- Status da transação (Concluído/Agendado/Falha)
- Resumo de validação: se parece autêntico e legível.`;
    } else {
      prompt = `Analise esta foto do atleta/treino de futebol/futsal.
Contexto adicional: ${extraContext || 'Avaliação de postura, biomecânica do chute/passe ou gesto esportivo.'}
Forneça:
1. Análise da postura corporal, pé de apoio, alinhamento do tronco e equilíbrio.
2. Pontos fortes observados.
3. Correções técnicas recomendadas para o treinador e para o atleta.
4. Exercício recomendado para aprimorar esse fundamento.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ],
        },
      ],
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Erro na análise visual por IA' });
  }
});

// AI Feedback Generator for Parent Report Card
app.post('/api/ai/generate-athlete-feedback', async (req, res) => {
  try {
    const { athleteName, age, modality, scores, physicalTests, coachNotes } = req.body;
    const ai = getAI();

    const prompt = `Você é o Coordenador Técnico de uma prestigiada Escola de Futebol e Futsal de Base.
Escreva uma mensagem construtiva, motivadora e detalhada para o boletim de avaliação técnica do jovem atleta ${athleteName} (Modalidade: ${modality}).

Dados da avaliação técnica (escala 1 a 5):
${JSON.stringify(scores, null, 2)}

Testes Físicos:
${JSON.stringify(physicalTests, null, 2)}

Anotações do Treinador:
"${coachNotes || 'Demonstrou muita dedicação nos treinos.'}"

Escreva um relatório em tom acolhedor, profissional e pedagógico para os pais e para o aluno, destacando:
1. Saudação personalizada e destaque dos pontos mais fortes do atleta.
2. Áreas de desenvolvimento prioritárias para as próximas semanas.
3. Uma mensagem de incentivo sobre trabalho em equipe, disciplina e paixão pelo esporte.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ feedback: response.text });
  } catch (error: any) {
    console.error('Error generating athlete feedback:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar feedback pedagógico' });
  }
});

// Text-to-Speech endpoint (Using Web Speech API client-side with text enhancement or preview)
app.post('/api/ai/generate-speech-script', async (req, res) => {
  try {
    const { text, targetAudience } = req.body;
    const ai = getAI();

    const prompt = `Converta e adapte o seguinte comunicado da escolinha de futebol para ser lido em áudio de forma clara, enérgica e profissional como um locutor/comunicador oficial de clube de futebol para ${targetAudience || 'pais e atletas'}:
"${text}"
Retorne apenas o texto adaptado para locução falada sem emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ script: response.text });
  } catch (error: any) {
    console.error('Error preparing speech:', error);
    res.status(500).json({ script: req.body.text || '' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ Servidor Escola de Futebol rodando na porta ${PORT}`);
  });
}

startServer();
