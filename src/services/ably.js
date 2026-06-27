import * as Ably from 'ably'
import { ChatClient, LogLevel } from '@ably/chat'

let realtimeClient = null
let chatClient = null

export const initializeAbly = (clientId) => {
  console.log('Initializing Ably with clientId:', clientId)
  
  if (realtimeClient && chatClient) {
    const currentClientId = realtimeClient.auth.clientId
    console.log('Existing clientId:', currentClientId, 'New clientId:', clientId)
    
    if (currentClientId && currentClientId !== clientId) {
      console.log('ClientId mismatch detected. Closing old connection.')
      realtimeClient.connection.close()
    } else if (currentClientId && currentClientId === clientId) {
      console.log('ClientId matches, reusing existing clients')
      return { realtimeClient, chatClient }
    } else {
      console.log('Existing clients have no clientId, will recreate')
    }
    
    realtimeClient.connection.close()
    realtimeClient = null
    chatClient = null
  }

  const apiKey = import.meta.env.VITE_ABLY_API_KEY
  console.log('Ably API Key loaded:', apiKey ? 'Yes' : 'No')
  
  if (!apiKey) {
    console.error('VITE_ABLY_API_KEY environment variable is required')
    throw new Error('VITE_ABLY_API_KEY environment variable is required')
  }

  console.log('Creating Ably Realtime client with clientId:', clientId)
  realtimeClient = new Ably.Realtime({
    key: apiKey,
    clientId: clientId,
    recover: true, 
    echoMessages: false, 
    recoverKey: `recover-${clientId}` 
  })
  
  realtimeClient.connection.once('connected', () => {
    const actualClientId = realtimeClient.auth.clientId
    console.log('Ably connected with clientId:', actualClientId, 'Expected:', clientId)
    if (actualClientId !== clientId) {
      console.error('ERROR: clientId mismatch! Actual:', actualClientId, 'Expected:', clientId)
    }
  })

  realtimeClient.connection.on('connecting', () => {
    console.log('Ably: Connecting...')
  })
  
  realtimeClient.connection.on('connected', () => {
    console.log('Ably: Connected successfully!')
    setTimeout(() => {
      console.log('Ably: Triggering state change event for UI update')
      realtimeClient.connection.emit('statechange', {
        current: 'connected',
        previous: 'connecting'
      })
    }, 100)
  })
  
  realtimeClient.connection.on('disconnected', () => {
    console.log('Ably: Disconnected')
  })
  
  realtimeClient.connection.on('failed', (error) => {
    console.error('Ably: Connection failed:', error)
  })

  console.log('Creating Ably Chat client...')
  chatClient = new ChatClient(realtimeClient, {
    logLevel: LogLevel.Error
  })

  console.log('Ably clients created successfully')
  return { realtimeClient, chatClient }
}

export const getAblyClients = () => {
  if (!realtimeClient || !chatClient) {
    throw new Error('Ably clients not initialized. Call initializeAbly first.')
  }
  return { realtimeClient, chatClient }
}

export const closeAblyConnection = () => {
  if (realtimeClient) {
    realtimeClient.connection.close()
    realtimeClient = null
    chatClient = null
  }
}

export const getConnectionStatus = () => {
  if (!realtimeClient) return 'disconnected'
  return realtimeClient.connection.state
}

export const createRoomName = (participants) => {
  const sortedParticipants = [...participants].sort()
  return `chat_${sortedParticipants.join('_')}`
}

export const parseRoomName = (roomName) => {
  if (roomName.startsWith('chat_')) {
    return roomName.replace('chat_', '').split('_')
  }
  return [roomName]
}

export default {
  initializeAbly,
  getAblyClients,
  closeAblyConnection,
  getConnectionStatus,
  createRoomName,
  parseRoomName
}
