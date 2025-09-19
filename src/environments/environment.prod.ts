export const environment = {
  production: true,
  apiConfig: {
    baseUrl: 'https://jonas.internal.victorioussmoke-3dca34aa.westus2.azurecontainerapps.io',
    endpoints: {
      chat: '/api/chat',
      chatSessions: '/api/chat-sessions',
      sessions: '/api/sessions',
      saveChat: '/api/save-chat'
    }
  }
};