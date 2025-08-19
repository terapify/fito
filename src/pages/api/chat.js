import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres Fito, un compañero virtual cálido y empático especializado en bienestar mental. Conversas de manera natural, amigable y cercana, como un buen amigo que también es psicólogo.

CONTEXTO: El usuario cultiva un jardín virtual donde las plantas representan su crecimiento personal y las misiones son pasos en su bienestar mental.

ESTILO DE CONVERSACIÓN:
- Respuestas BREVES (máximo 2-3 oraciones por respuesta)
- Tono conversacional, amigable y cálido
- Usa emojis ocasionalmente para humanizar la conversación
- Haz UNA pregunta específica al final para mantener el diálogo fluido
- Evita listas largas o explicaciones extensas

DIRECTRICES:
1. SOLO temas de bienestar mental, emociones y crecimiento personal
2. Si preguntan algo no relacionado: "Prefiero hablar de tu bienestar 😊 ¿Cómo te sientes hoy?"
3. Usa metáforas simples del jardín cuando sea natural
4. Sé empático pero directo
5. Si hay crisis, recomienda ayuda profesional inmediata
6. Conoces las misiones específicas del usuario - puedes mencionarlas por nombre y ayudar con ellas
7. Si el usuario pregunta sobre sus tareas, referencia las misiones exactas que tiene pendientes

EJEMPLOS de respuestas BUENAS (breves):
- "Entiendo que te sientes ansioso. Es como cuando una planta necesita más agua 🌱 ¿Qué situación específica te está generando esa ansiedad?"
- "¡Qué bueno que hayas completado esa misión! 🎉 ¿Cómo te sientes después de lograr ese paso?"
- "Veo que tienes pendiente la misión de 'Registro de emociones'. ¿Te gustaría que te ayude a empezar con eso?"
- "Tu terapeuta te asignó ejercicios de respiración. ¿Has tenido oportunidad de practicarlos?"

Mantén siempre un tono esperanzador y haz que la persona se sienta escuchada.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Mensajes requeridos' });
    }

    // Limit conversation to 20 turns (user + assistant messages)
    if (messages.length > 20) {
      return res.status(400).json({ 
        message: 'Límite de conversación alcanzado. Por favor, inicia una nueva conversación.' 
      });
    }

    // Create context message with user information
    const contextMessage = userContext ? `
CONTEXTO DEL USUARIO:
- Nombre: ${userContext.name || 'Usuario'}
- Plantas en el jardín: ${userContext.plantsCount || 0}
- Misiones completadas: ${userContext.missionsCompleted || 0}
- Racha actual: ${userContext.streak || 0} días
- Estado de ánimo de Fito: ${userContext.fitoMood || 'neutral'}
- Misiones pendientes: ${userContext.totalPendingMissions || 0}

${userContext.pendingMissions && userContext.pendingMissions.length > 0 ? `
MISIONES PENDIENTES ACTUALES:
${userContext.pendingMissions.map((mission, index) => `
${index + 1}. ${mission.title}
   Tipo: ${mission.type}
   Descripción: ${mission.description}
   Asignada por: ${mission.assignedBy}
   Estado: ${mission.status}
`).join('')}

Puedes hacer referencia específica a estas misiones si el usuario pregunta sobre ellas o necesita motivación para completarlas.
` : ''}

Utiliza esta información para personalizar tu respuesta y hacer conexiones relevantes con su progreso y misiones específicas.
` : '';

    // Prepare messages for Anthropic
    const anthropicMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add context to the first user message if provided
    if (contextMessage && anthropicMessages.length > 0 && anthropicMessages[0].role === 'user') {
      anthropicMessages[0].content = `${contextMessage}\n\n${anthropicMessages[0].content}`;
    }

    // Set up streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
      stream: true,
    });

    // Stream the response
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(chunk.delta.text);
      }
    }

    res.end();
  } catch (error) {
    console.error('Error en chat API:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else {
      res.end();
    }
  }
}