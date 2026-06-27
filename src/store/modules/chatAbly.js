import { 
  initializeAbly, 
  getAblyClients, 
  closeAblyConnection, 
  getConnectionStatus,
  createRoomName,
  parseRoomName 
} from '../../services/ably'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../../firebase/config'

const autoSubscribeToAllRooms = async ({ commit, state, dispatch }, userId) => {
  try {
    const { chatClient } = getAblyClients()
    const subscribedRooms = new Set()

    for (const room of state.chatRooms) {
      const roomName = room.roomName || room.id

      if (state.rooms.has(roomName) || subscribedRooms.has(roomName)) {
        continue
      }
      
      try {
        const ablyRoom = await chatClient.rooms.get(roomName)
        
        await ablyRoom.attach()
        
        state.rooms.set(roomName, ablyRoom)
        subscribedRooms.add(roomName)
        
          ablyRoom.messages.subscribe((messageEvent) => {
            const msg = messageEvent.message
            
            dispatch('ensureRoomExistsFromMessage', { roomName, message: msg }).then(() => {
              commit('ADD_MESSAGE', {
                roomName,
                message: msg
              })
            }).catch(err => {
              console.error('Error ensuring room exists:', err)
              commit('ADD_MESSAGE', {
                roomName,
                message: msg
              })
            })
          })
        const isReactivated = state.reactivatedRooms && 
                             (state.reactivatedRooms.has(roomName) || state.reactivatedRooms.has(room.id))
        const wasDeleted = room.deletedFor && room.deletedFor.includes(userId)
        const shouldSkipHistory = isReactivated || wasDeleted
        
        if (shouldSkipHistory) {
          const reactivationTime = new Date().getTime()
          if (!state.reactivatedAt) {
            state.reactivatedAt = new Map()
          }
          if (!state.reactivatedAt.has(roomName)) {
            state.reactivatedAt.set(roomName, reactivationTime)
          }
          
          const storedReactivationTime = state.reactivatedAt.get(roomName) || reactivationTime
          const cutoffTime = storedReactivationTime - 300000 
          
          if (state.messages.has(roomName)) {
            const messages = state.messages.get(roomName)
            const filteredMessages = messages.filter(msg => {
              const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
              return msgTime >= cutoffTime
            })
            
            if (filteredMessages.length < messages.length) {
              state.messages.set(roomName, filteredMessages)
            }
          }
        } else {
          try {
            const deletedAt = room.deletedAt?.[userId]
            let deletionTime = null
            if (deletedAt) {
              if (deletedAt.toDate && typeof deletedAt.toDate === 'function') {
                deletionTime = deletedAt.toDate().getTime()
              } else if (deletedAt.seconds) {
                deletionTime = deletedAt.seconds * 1000 + (deletedAt.nanoseconds || 0) / 1000000
              } else if (deletedAt instanceof Date) {
                deletionTime = deletedAt.getTime()
              } else {
                deletionTime = new Date(deletedAt).getTime()
                if (isNaN(deletionTime)) {
                  deletionTime = null
                }
              }
            }
            const history = await ablyRoom.messages.history({ limit: 100 }) 
            if (history.items.length > 0) {
              let filteredHistory = history.items
              if (deletionTime) {
                filteredHistory = history.items.filter(msg => {
                  const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
                  return msgTime > deletionTime 
                })
              }
              
              if (filteredHistory.length > 0) {
                const sortedHistory = filteredHistory.sort((a, b) => {
                  const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                  const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                  return timeA - timeB
                })
                
                sortedHistory.forEach(msg => {
                  commit('ADD_MESSAGE', { roomName, message: msg })
                })
              }
            }
          } catch (err) {
            console.error('Error loading message history in autoSubscribe for room', roomName, ':', err)
          }
        }
      } catch (error) {
        console.error('Error auto-subscribing to room', roomName, ':', error)
      }
    }
  } catch (error) {
    console.error('Error in autoSubscribeToAllRooms:', error)
  }
}

const subscribeToNewRoom = async ({ commit, state, dispatch }, { roomData, roomId, userId, skipHistory = false }) => {
  try {
    const { chatClient } = getAblyClients()
    const roomName = roomData.roomName || roomId
    
    const deletedFor = Array.isArray(roomData.deletedFor) ? roomData.deletedFor : []
    const wasInReactivatedRooms = state.reactivatedRooms && 
                                   (state.reactivatedRooms.has(roomName) || state.reactivatedRooms.has(roomId))
    const isReactivated = wasInReactivatedRooms || skipHistory || (deletedFor.includes(userId))
    
    const ablyRoom = await chatClient.rooms.get(roomName)
    
    await ablyRoom.attach()

    state.rooms.set(roomName, ablyRoom)
    
    if (skipHistory || isReactivated) {

      const reactivationTime = new Date().getTime()
      if (!state.reactivatedAt) {
        state.reactivatedAt = new Map()
      }

      if (!state.reactivatedAt.has(roomName)) {
        state.reactivatedAt.set(roomName, reactivationTime)
      }

      const storedReactivationTime = state.reactivatedAt.get(roomName) || reactivationTime
      const cutoffTime = storedReactivationTime - 300000 
      
      if (state.messages.has(roomName)) {
        const messages = state.messages.get(roomName)
        const filteredMessages = messages.filter(msg => {
          const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
          return msgTime >= cutoffTime
        })
        
        if (filteredMessages.length < messages.length) {
          state.messages.set(roomName, filteredMessages)
        }
      }
    } else {
      try {
        const deletedAt = roomData.deletedAt?.[userId]
        let deletionTime = null
        if (deletedAt) {
          if (deletedAt.toDate && typeof deletedAt.toDate === 'function') {
            deletionTime = deletedAt.toDate().getTime()
          } else if (deletedAt.seconds) {
            deletionTime = deletedAt.seconds * 1000 + (deletedAt.nanoseconds || 0) / 1000000
          } else if (deletedAt instanceof Date) {
            deletionTime = deletedAt.getTime()
          } else {
            deletionTime = new Date(deletedAt).getTime()
            if (isNaN(deletionTime)) {
              deletionTime = null
            }
          }
        }

        const history = await ablyRoom.messages.history({ limit: 100 }) 

        let filteredHistory = history.items
        if (deletionTime) {
          filteredHistory = history.items.filter(msg => {
            const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
            return msgTime > deletionTime 
          })
        }
        
        if (filteredHistory.length > 0) {
          const sortedHistory = filteredHistory.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
            return timeA - timeB
          })
          
          sortedHistory.forEach(msg => {
            commit('ADD_MESSAGE', { roomName, message: msg })
          })
        }
      } catch (err) {
        console.warn('⚠️ Error loading message history:', err)
      }
    }

    ablyRoom.messages.subscribe((messageEvent) => {
      const msg = messageEvent.message
      
      dispatch('ensureRoomExistsFromMessage', { roomName, message: msg }).then(() => {
        commit('ADD_MESSAGE', {
          roomName,
          message: msg
        })
        console.log('[消息检查] 消息已添加:', roomName, msg.text?.substring(0, 30))
      }).catch(err => {
        console.error('[消息检查] 确保房间存在时出错:', err)
        commit('ADD_MESSAGE', {
          roomName,
          message: msg
        })
        console.log('[消息检查] 消息已添加(错误后):', roomName, msg.text?.substring(0, 30))
      })
    })
  } catch (error) {
    console.error('❌ Error auto-subscribing to new room:', error)
  }
}

const startAutoCreateRoomsListener = ({ commit, state, dispatch }, userId) => {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId)
  )
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const roomData = change.doc.data()
        const roomId = change.doc.id
        const deletedFor = roomData.deletedFor || []
      const roomName = roomData.roomName || roomId
      const isDeleted = deletedFor.includes(userId)
      
      const existingRoom = state.chatRooms.find(r => r.id === roomId)
      const wasDeleted = existingRoom?.deletedFor?.includes(userId)
      
      if (change.type === 'added') {

        if (!isDeleted) {
        const exists = state.chatRooms.find(r => r.id === roomId)
        if (!exists) {

          const newRoom = {
            id: roomId,
            ...roomData,
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            deletedFor: deletedFor,
            roomName: roomData.roomName,
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          }
          

          commit('ADD_CHAT_ROOM', newRoom)
          

            subscribeToNewRoom({ commit, state, dispatch }, { roomData, roomId, userId }).catch(err => {
            console.error('Error in background subscription:', err)
          })
          
          }
        }
      } else if (change.type === 'modified') {

        const hasNewMessage = roomData.lastMessage && 
                              roomData.lastMessageSender !== userId &&
                              (!existingRoom || existingRoom.lastMessage !== roomData.lastMessage)
        
        if (wasDeleted && hasNewMessage && !isDeleted) {
          
          const reactivatedRoom = {
            id: roomId,
            ...roomData,
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            deletedFor: deletedFor,
            roomName: roomData.roomName,
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          }
          
          if (existingRoom) {
            const roomIndex = state.chatRooms.findIndex(r => r.id === roomId)
            if (roomIndex !== -1) {
              state.chatRooms[roomIndex] = reactivatedRoom
            }
          } else {
            commit('ADD_CHAT_ROOM', reactivatedRoom)
          }

          if (!state.rooms.has(roomName)) {
            subscribeToNewRoom({ commit, state, dispatch }, { roomData, roomId, userId, skipHistory: true }).catch(err => {
              console.error('Error subscribing to reactivated room:', err)
            })
          }
          
        } else if (wasDeleted && hasNewMessage && isDeleted) {
          if (!state.rooms.has(roomName)) {
            subscribeToNewRoom({ commit, state, dispatch }, { roomData, roomId, userId, skipHistory: true }).catch(err => {
              console.error('Error subscribing to deleted room with new message:', err)
            })
          }
        }
      }
    })
  })
  
  return unsubscribe
}

export default {
  namespaced: true,
  
  state: {
    isConnected: false,
    connectionStatus: 'disconnected',
    clientId: null,
    
    rooms: new Map(), 
    messages: new Map(), 
    activeRoom: null,

    presence: new Map(),
    typing: new Map(), 
    onlineUsers: new Set(),
    
    loading: false,
    error: null,

    chatRooms: [],
    
    reactivatedRooms: new Set(),
    reactivatedAt: new Map(),

    unreadCounts: new Map(), 
    lastViewedAt: new Map(), 

    chatRoomListenerUnsubscribe: null, 
  },
  
  mutations: {
    SET_CONNECTION_STATUS(state, { status, isConnected }) {
      state.connectionStatus = status
      state.isConnected = isConnected
    },
    
    SET_CLIENT_ID(state, clientId) {
      state.clientId = clientId
    },
    
    SET_ACTIVE_ROOM(state, roomName) {
      state.activeRoom = roomName
    },
    
    ADD_MESSAGE(state, { roomName, message }) {
      console.log('[消息检查] ADD_MESSAGE被调用:', roomName, {
        text: message.text?.substring(0, 30),
        clientId: message.clientId,
        serial: message.serial,
        timestamp: message.timestamp
      })
      
      if (!state.messages.has(roomName)) {
        state.messages.set(roomName, [])
        console.log('[消息检查] 创建新消息数组:', roomName)
      }
      const messages = state.messages.get(roomName)
      const beforeCount = messages.length
      

      let exists = false
      
      if (message.serial) {
        // Primary: check by serial (most reliable)
        exists = messages.some(msg => msg.serial === message.serial)
      } else {
        // Fallback: check by timestamp + text + clientId (for messages without serial yet)
        // BUT: Be more lenient - only consider it a duplicate if:
        // 1. Timestamp matches within 500ms (very strict)
        // 2. Text matches exactly
        // 3. ClientId matches exactly
        // This prevents false positives for messages sent in quick succession
        const msgTime = message.timestamp ? new Date(message.timestamp).getTime() : 0
        const msgText = message.text || ''
        const msgClientId = message.clientId || ''
        
        exists = messages.some(msg => {
          const existingTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
          const existingText = msg.text || ''
          const existingClientId = msg.clientId || ''
          
          // Consider it a duplicate ONLY if timestamp is very close (within 500ms), text matches exactly, and clientId matches
          // This is stricter than before to prevent false duplicates
          return msgTime > 0 && 
                 Math.abs(existingTime - msgTime) < 500 && // Reduced from 1000ms to 500ms for stricter matching
                 existingText === msgText && 
                 existingClientId === msgClientId &&
                 msgText.length > 0 // Only check if message has actual text
        })
      }
      
      // CRITICAL: Handle the case where sendMessage added a message without serial,
      // but subscription callback received the same message with serial
      // In this case, replace the message without serial with the one that has serial
      if (!exists && message.serial) {
        // New message has serial - check if there's an old message without serial that matches
        const msgTime = message.timestamp ? new Date(message.timestamp).getTime() : 0
        const msgText = message.text || ''
        const msgClientId = message.clientId || ''
        
        // Find potential duplicate message without serial (same text + clientId, within 2 seconds)
        const potentialDuplicate = messages.find(msg => {
          // Look for messages WITHOUT serial that match
          if (msg.serial) return false // Skip messages that already have serial
          
          const existingTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
          const existingText = msg.text || ''
          const existingClientId = msg.clientId || ''
          
          return msgTime > 0 && 
                 Math.abs(existingTime - msgTime) < 2000 && 
                 existingText === msgText && 
                 existingClientId === msgClientId &&
                 msgText.length > 0
        })
        
        // If we found an old message without serial, replace it with the new one that has serial
        if (potentialDuplicate) {
          // Remove the old message (without serial) and add the new one (with serial)
          const index = messages.findIndex(msg => msg === potentialDuplicate)
          if (index !== -1) {
            messages.splice(index, 1)
          }
          // Don't set exists = true, let it add the new message below
        }
      }
      
      if (exists) {
        // Don't add duplicate message - just return
        console.log('[消息检查] 消息已存在，跳过:', roomName, message.text?.substring(0, 30))
        return
      }
      
      // Add the message (only reached if !exists)
      messages.push(message)
      console.log('[消息检查] 消息已推入数组:', roomName, '当前数量:', messages.length)
      
      // Sort messages by timestamp to maintain chronological order
      messages.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
        return timeA - timeB // Oldest first, newest last
      })
      
      // Keep only last 100 messages per room
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100)
      }
      
      // Force reactivity update by creating a new array reference
      state.messages.set(roomName, [...messages])
      console.log('[消息检查] 消息已保存到state:', roomName, '最终数量:', messages.length, '之前数量:', beforeCount)
      
      // Update the chat room's last message in local state
      const room = state.chatRooms.find(r => r.id === roomName || r.roomName === roomName)
      if (room) {
        room.lastMessage = message.text
        room.lastMessageSender = message.clientId
        room.lastMessageAt = new Date(message.timestamp)
      }
      
      // Update unread count based on actual unread messages
      // Find the room in local state by roomName or id
      // Also try to find by roomName if not found by id (for new rooms)
      let targetRoom = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)
      
      // If room not found, try to find by roomId extracted from roomName
      // roomName format: chat_userId1_userId2
      if (!targetRoom && roomName.startsWith('chat_')) {
        const parts = roomName.split('_')
        if (parts.length >= 3) {
          // Try to find room by participants
          targetRoom = state.chatRooms.find(r => {
            if (!r.participants || !Array.isArray(r.participants)) return false
            const roomParticipants = new Set(r.participants)
            const currentUserId = state.clientId
            return roomParticipants.has(currentUserId) && 
                   (roomParticipants.has(parts[1]) || roomParticipants.has(parts[2]))
          })
        }
      }
      
      if (targetRoom) {
        // Check if this is the active room - if so, mark as viewed
        const activeRoomId = state.chatRooms.find(r => state.activeRoom === (r.roomName || r.id))?.id
        if (targetRoom.id === activeRoomId) {
          // User is viewing this room, update last viewed time
          state.lastViewedAt.set(targetRoom.id, new Date().getTime())
          // Clear unread count for active room
          state.unreadCounts.set(targetRoom.id, 0)
          // Force reactivity by creating a new Map instance
          state.unreadCounts = new Map(state.unreadCounts)
        } else {
          // Room is not active, calculate unread count based on messages after last viewed time
          const lastViewed = state.lastViewedAt.get(targetRoom.id) || 0
          const roomMessages = state.messages.get(roomName) || []
          
          // Count messages that are:
          // 1. Not from current user
          // 2. After last viewed time
          const unreadCount = roomMessages.filter(msg => {
            const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
            return msg.clientId !== state.clientId && msgTime > lastViewed
          }).length
          
          state.unreadCounts.set(targetRoom.id, unreadCount)
          // Force reactivity by creating a new Map instance
          state.unreadCounts = new Map(state.unreadCounts)
        }
      } else {
        // Room not in chatRooms yet (may be creating)
        // Store a temporary unread count that will be applied when room is added
        // Use roomName as key temporarily
        const roomMessages = state.messages.get(roomName) || []
        const lastViewed = 0 // No last viewed time for new rooms
        const unreadCount = roomMessages.filter(msg => {
          const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
          return msg.clientId !== state.clientId && msgTime > lastViewed
        }).length
        
        // Store temporary unread count with roomName as key
        // This will be moved to room.id when room is added to chatRooms
        if (unreadCount > 0) {
          state.unreadCounts.set(roomName, unreadCount)
          state.unreadCounts = new Map(state.unreadCounts)
        }
      }
    },
    
    UPDATE_MESSAGE(state, { roomName, message }) {
      if (!state.messages.has(roomName)) return
      
      const messages = state.messages.get(roomName)
      const index = messages.findIndex(msg => msg.serial === message.serial)
      if (index !== -1) {
        messages[index] = message
      }
    },
    
    DELETE_MESSAGE(state, { roomName, messageSerial }) {
      if (!state.messages.has(roomName)) return
      
      const messages = state.messages.get(roomName)
      const index = messages.findIndex(msg => msg.serial === messageSerial)
      if (index !== -1) {
        messages.splice(index, 1)
      }
    },
    
    SET_PRESENCE(state, { roomName, presenceData }) {
      state.presence.set(roomName, presenceData)
    },
    
    SET_TYPING(state, { roomName, typingUsers }) {
      state.typing.set(roomName, typingUsers)
    },
    
    SET_ONLINE_USERS(state, users) {
      state.onlineUsers = new Set(users)
    },
    
    SET_CHAT_ROOMS(state, rooms) {
      state.chatRooms = rooms
    },
    
    ADD_CHAT_ROOM(state, room) {
      const exists = state.chatRooms.some(r => r.id === room.id)
      if (!exists) {
        state.chatRooms.push(room)
        
        // If there's a temporary unread count stored with roomName, move it to room.id
        const roomName = room.roomName || room.id
        if (state.unreadCounts.has(roomName) && roomName !== room.id) {
          const tempUnreadCount = state.unreadCounts.get(roomName)
          state.unreadCounts.set(room.id, tempUnreadCount)
          state.unreadCounts.delete(roomName)
          state.unreadCounts = new Map(state.unreadCounts)
        }
      }
    },
    
    REMOVE_CHAT_ROOM(state, roomId) {
      state.chatRooms = state.chatRooms.filter(room => room.id !== roomId)
      // Also remove unread count when room is deleted
      state.unreadCounts.delete(roomId)
    },
    
    INCREMENT_UNREAD(state, roomId) {
      const currentCount = state.unreadCounts.get(roomId) || 0
      state.unreadCounts.set(roomId, currentCount + 1)
      // Force reactivity by creating a new Map instance
      state.unreadCounts = new Map(state.unreadCounts)
    },
    
    CLEAR_UNREAD(state, roomId) {
      state.unreadCounts.set(roomId, 0)
      // Update last viewed time when clearing unread
      const timestamp = new Date().getTime()
      state.lastViewedAt.set(roomId, timestamp)
      // Force reactivity by creating new Map instances
      state.unreadCounts = new Map(state.unreadCounts)
      state.lastViewedAt = new Map(state.lastViewedAt)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    // Initialize Ably connection
    async initializeConnection({ commit, state }, { clientId }) {
      try {
        // Check if already initialized with the same clientId
        if (state.clientId === clientId && state.isConnected) {
          return
        }
        
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const { realtimeClient, chatClient } = initializeAbly(clientId)
        
        commit('SET_CLIENT_ID', clientId)
        
        // Listen for connection status changes
        realtimeClient.connection.on('statechange', (stateChange) => {
          const isConnected = stateChange.current === 'connected'
          
          // Verify clientId on connect
          if (stateChange.current === 'connected') {
            const actualClientId = realtimeClient.auth.clientId
            if (actualClientId !== clientId) {
              console.error('❌ CRITICAL: clientId mismatch!', {
                actual: actualClientId,
                expected: clientId
              })
            }
          }
          
          commit('SET_CONNECTION_STATUS', {
            status: stateChange.current,
            isConnected
          })
        })
        
        // Set initial connection status
        const currentStatus = realtimeClient.connection.state
        commit('SET_CONNECTION_STATUS', {
          status: currentStatus,
          isConnected: currentStatus === 'connected'
        })
        
        commit('SET_LOADING', false)
        
        // Force update connection status after initialization
        setTimeout(() => {
          const currentStatus = realtimeClient.connection.state
          commit('SET_CONNECTION_STATUS', {
            status: currentStatus,
            isConnected: currentStatus === 'connected'
          })
        }, 500)
        
        return { realtimeClient, chatClient }
        
      } catch (error) {
        console.error('Store: Error initializing Ably connection:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    // Load user's chat rooms from Firebase
    async loadChatRooms({ commit, state, dispatch }, { userId }) {
      try {
        // Query Firebase for chat rooms where user is a participant
        const q = query(
          collection(db, 'chatRooms'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        
        const rooms = []
        
        querySnapshot.forEach((doc) => {
          const roomData = doc.data()
          // Handle deletedFor field - it can be undefined, null, or an array
          const deletedFor = Array.isArray(roomData.deletedFor) ? roomData.deletedFor : []
          
          // Skip rooms that are deleted for this user
          if (deletedFor.includes(userId)) {
            return
          }
          
          const roomId = doc.id
          const roomName = roomData.roomName || roomId
          
          // Check if this room was previously deleted (reactivated)
          // This happens when a user deleted a room but it's been reactivated
          // We need to mark it as reactivated to avoid loading old messages
          const existingRoom = state.chatRooms.find(r => r.id === roomId)
          const wasDeletedLocally = existingRoom?.deletedFor?.includes(userId)
          const isNowActive = !deletedFor.includes(userId)
          
          // Mark as reactivated ONLY if it was deleted locally but now active in Firestore
          // CRITICAL: On page refresh, existingRoom will be undefined, so we should NOT mark rooms as reactivated
          // Only mark as reactivated if we have an existing room in state that was deleted locally
          // This ensures that on refresh, all rooms load their history normally
          const existingRoomWasDeleted = existingRoom?.deletedFor?.includes(userId)
          
          // Only mark as reactivated if:
          // 1. It was deleted locally (in existing room state) but now active in Firestore
          // This is the ONLY case where we want to skip history - when a user deleted a room
          // and it's being reactivated by a new message
          const shouldMarkAsReactivated = existingRoomWasDeleted && isNowActive
          
          if (shouldMarkAsReactivated) {
            // This is a reactivated room - mark it and record reactivation time
            if (!state.reactivatedRooms) {
              state.reactivatedRooms = new Set()
            }
                    state.reactivatedRooms.add(roomName)
                    state.reactivatedRooms.add(roomId)
            
            // Record reactivation time
            const reactivationTime = new Date().getTime()
            if (!state.reactivatedAt) {
              state.reactivatedAt = new Map()
            }
            // Only set if not already set (keep earliest reactivation time)
            if (!state.reactivatedAt.has(roomName)) {
              state.reactivatedAt.set(roomName, reactivationTime)
            }
            
            // Use the stored reactivation time (or current if just set)
            const storedReactivationTime = state.reactivatedAt.get(roomName) || reactivationTime
            const cutoffTime = storedReactivationTime - 30000 // 30 seconds before reactivation
            
            // Clear only old messages (before cutoff time), keep new ones
            if (state.messages.has(roomName)) {
              const messages = state.messages.get(roomName)
              const filteredMessages = messages.filter(msg => {
                const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
                // Keep messages that arrived after cutoff time (likely new messages)
                return msgTime >= cutoffTime
              })
              
                      if (filteredMessages.length < messages.length) {
                        state.messages.set(roomName, filteredMessages)
                      }
            }
          }
          
          rooms.push({
            id: roomId,
            ...roomData,
            // Ensure we have all required fields
            participants: roomData.participants || [],
            participantNames: roomData.participantNames || [],
            participantRoles: roomData.participantRoles || [],
            deletedFor: deletedFor,
            deletedAt: roomData.deletedAt || {}, // Store deletion timestamps per user
            roomName: roomData.roomName, // Ensure roomName is included
            lastMessage: roomData.lastMessage || '',
            lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
            createdAt: roomData.createdAt?.toDate() || new Date()
          })
          
          // Load lastViewedAt from Firebase for this room
          if (roomData.lastViewedAt && roomData.lastViewedAt[userId]) {
            state.lastViewedAt.set(roomId, roomData.lastViewedAt[userId])
          }
        })
        
        commit('SET_CHAT_ROOMS', rooms)
        
        // Auto-subscribe to all rooms to receive messages even when not viewing them
        // Pass dispatch to enable auto-room creation
        await autoSubscribeToAllRooms({ commit, state, dispatch }, userId)
        
        // Recalculate unread counts after loading messages from history
        // This ensures counts are based on lastViewedAt timestamps from Firebase
        dispatch('recalculateUnreadCounts')
        
        // Note: Real-time updates for new rooms are handled by listenToChatRoomUpdates
        // (called from the Vue component). This avoids duplicate listeners.
        
        return rooms
        
      } catch (error) {
        console.error('Error loading chat rooms:', error)
        
        // If it's a permissions error, show helpful message
        if (error.code === 'permission-denied') {
          console.warn('Firebase permissions not set up yet. Please deploy firestore.rules')
          commit('SET_ERROR', 'Chat rooms permissions not configured. Please deploy Firebase rules.')
        } else {
          commit('SET_ERROR', error.message)
        }
        
        return []
      }
    },
    
    // Listen for real-time chat room updates
    async listenToChatRoomUpdates({ commit, state, dispatch }, { userId }) {
      try {
        // Check if listener is already set up
        if (state.chatRoomListenerUnsubscribe) {
          return state.chatRoomListenerUnsubscribe
        }
        
        const q = query(
          collection(db, 'chatRooms'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageAt', 'desc')
        )
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const rooms = []
          let skippedCount = 0
          let newRooms = 0
          
          querySnapshot.forEach((doc) => {
            const roomData = doc.data()
            // Handle deletedFor field - it can be undefined, null, or an array
            const deletedFor = Array.isArray(roomData.deletedFor) ? roomData.deletedFor : []
            const roomId = doc.id
            const roomName = roomData.roomName || roomId
            const isDeleted = deletedFor.includes(userId)
            
            // Check if deleted room has a new message (even if deleted, we need to receive messages)
            if (isDeleted) {
              const existingRoom = state.chatRooms.find(r => r.id === roomId)
              const hasNewMessage = roomData.lastMessage && 
                                   roomData.lastMessageSender !== userId &&
                                   (!existingRoom || existingRoom.lastMessage !== roomData.lastMessage)
              
              // If deleted room has a new message, subscribe to Ably to receive it
              // Check if we're already subscribing or subscribed to avoid duplicate subscriptions
              const isAlreadySubscribing = state.rooms.has(roomName)
              
              if (hasNewMessage && !isAlreadySubscribing) {
                // Subscribe to Ably to receive the message (room will be reactivated when message arrives via Ably)
                // Skip history loading for deleted rooms - we only want new messages
                subscribeToNewRoom({ commit, state, dispatch }, { roomData, roomId, userId, skipHistory: true }).catch(err => {
                  console.error('Error subscribing to deleted room with new message:', err)
                })
              }
              
              skippedCount++
              return
            }
            
            // Check if this is a new room that wasn't in local state OR
            // if it's a room that was previously deleted but now reactivated
            const existingRoom = state.chatRooms.find(r => r.id === roomId)
            const wasDeletedInLocal = existingRoom?.deletedFor?.includes(userId)
            
            // Check if room was previously deleted (in local state's deletedFor)
            // but is no longer deleted in Firestore (not in current deletedFor)
            // This indicates the room was reactivated
            const wasDeletedButNowActive = wasDeletedInLocal && !deletedFor.includes(userId)
            
            // Check if room is marked in reactivatedRooms Set (from previous operations)
            const wasInReactivatedRooms = state.reactivatedRooms && 
                                          (state.reactivatedRooms.has(roomName) || state.reactivatedRooms.has(roomId))
            
            // A room is reactivated if it was deleted locally but now active in Firestore
            // OR it's already marked as reactivated
            const isReactivated = wasDeletedButNowActive || wasInReactivatedRooms
            const isNewRoom = !existingRoom
            
            // Also check if room exists but is not subscribed to Ably
            const isSubscribedToAbly = state.rooms.has(roomName)
            
            // If room is reactivated, mark it in reactivatedRooms Set BEFORE subscribing
            if (isReactivated) {
              if (!state.reactivatedRooms) {
                state.reactivatedRooms = new Set()
              }
              state.reactivatedRooms.add(roomName)
              state.reactivatedRooms.add(roomId)
              
              // Record reactivation time
              const reactivationTime = new Date().getTime()
              if (!state.reactivatedAt) {
                state.reactivatedAt = new Map()
              }
              // Only set if not already set (keep earliest reactivation time)
              if (!state.reactivatedAt.has(roomName)) {
                state.reactivatedAt.set(roomName, reactivationTime)
              }
              
              // Use the stored reactivation time (or current if just set)
              const storedReactivationTime = state.reactivatedAt.get(roomName) || reactivationTime
              const cutoffTime = storedReactivationTime - 30000 // 30 seconds before reactivation
              
              // Clear only old messages (before cutoff time), keep new ones
              if (state.messages.has(roomName)) {
                const messages = state.messages.get(roomName)
                const filteredMessages = messages.filter(msg => {
                  const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
                  // Keep messages that arrived after cutoff time (likely new messages)
                  return msgTime >= cutoffTime
                })
                
                      if (filteredMessages.length < messages.length) {
                        state.messages.set(roomName, filteredMessages)
                      }
                    }
                  }
            
            if (isNewRoom || isReactivated || (!isSubscribedToAbly && existingRoom)) {
              if (isNewRoom || isReactivated) {
                newRooms++
              }
              
              // CRITICAL: Subscribe to this new/reactivated/unsubscribed room to receive messages
              // If it's a reactivated room, skip history loading
              // Double-check if room is in reactivatedRooms Set (may have been marked above)
              const definitelyReactivated = state.reactivatedRooms && 
                                            (state.reactivatedRooms.has(roomName) || state.reactivatedRooms.has(roomId))
              const shouldSkipHistory = isReactivated || definitelyReactivated
              subscribeToNewRoom({ commit, state, dispatch }, { roomData, roomId, userId, skipHistory: shouldSkipHistory }).catch(err => {
                console.error('Error subscribing to new room in listener:', err)
              })
            }
            
            rooms.push({
              id: roomId,
              ...roomData,
              participants: roomData.participants || [],
              participantNames: roomData.participantNames || [],
              participantRoles: roomData.participantRoles || [],
              deletedFor: deletedFor,
              deletedAt: roomData.deletedAt || {}, // Store deletion timestamps per user
              roomName: roomData.roomName, // Ensure roomName is included
              lastMessage: roomData.lastMessage || '',
              lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
              createdAt: roomData.createdAt?.toDate() || new Date()
            })
            
            // Load lastViewedAt from Firebase for this room
            if (roomData.lastViewedAt && roomData.lastViewedAt[userId]) {
              state.lastViewedAt.set(roomId, roomData.lastViewedAt[userId])
            }
          })
          
          commit('SET_CHAT_ROOMS', rooms)
        })
        
        // Store unsubscribe function in state
        state.chatRoomListenerUnsubscribe = unsubscribe
        
        return unsubscribe
        
      } catch (error) {
        console.error('Error setting up chat room listener:', error)
        commit('SET_ERROR', error.message)
        return null
      }
    },
    
    // Save chat room to Firebase
    async saveChatRoom({ commit }, { participants, participantNames = [], participantRoles = [], roomName = null }) {
      try {
        const roomData = {
          participants,
          participantNames,
          participantRoles,
          roomName: roomName || createRoomName(participants),
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessage: '',
          lastMessageSender: null
        }
        
        const docRef = await addDoc(collection(db, 'chatRooms'), roomData)
        
        // Add to local state
        const newRoom = {
          id: docRef.id,
          ...roomData,
          createdAt: new Date(),
          lastMessageAt: new Date()
        }
        
        commit('ADD_CHAT_ROOM', newRoom)
        return docRef.id
        
      } catch (error) {
        console.error('Error saving chat room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Update chat room last message
    async updateChatRoomLastMessage({ commit, state }, { roomId, message, senderId }) {
      try {
        const roomRef = doc(db, 'chatRooms', roomId)
        await updateDoc(roomRef, {
          lastMessage: message,
          lastMessageSender: senderId,
          lastMessageAt: serverTimestamp()
        })
        
        // Update local state
        const rooms = [...state.chatRooms]
        const roomIndex = rooms.findIndex(r => r.id === roomId)
        if (roomIndex !== -1) {
          rooms[roomIndex].lastMessage = message
          rooms[roomIndex].lastMessageSender = senderId
          rooms[roomIndex].lastMessageAt = new Date()
          commit('SET_CHAT_ROOMS', rooms)
        }
        
      } catch (error) {
        console.error('Error updating chat room:', error)
      }
    },
    
    // Delete chat room for a specific user (doesn't affect other party)
    async deleteChatRoomForUser({ commit, state }, { roomId, userId }) {
      try {
        // Get the current room document to update deletedFor array
        const roomRef = doc(db, 'chatRooms', roomId)
        
        // Read current state to get deletedFor array and roomName
        const roomData = state.chatRooms.find(r => r.id === roomId)
        if (!roomData) {
          console.warn('Room not found in local state:', roomId)
          return
        }
        
        const deletedFor = roomData?.deletedFor || []
        const roomName = roomData?.roomName || roomId // Use roomName from Firebase if available
        
        // Add userId to deletedFor array if not already present
        if (!deletedFor.includes(userId)) {
          const updatedDeletedFor = [...deletedFor, userId]
          
          // Get existing deletedAt object or create new one
          const roomDoc = await getDoc(roomRef)
          const currentDeletedAt = roomDoc.data()?.deletedAt || {}
          
          // Record deletion time for this user
          const updatedDeletedAt = {
            ...currentDeletedAt,
            [userId]: serverTimestamp()
          }
          
          // Update Firebase to mark room as deleted for this user and record deletion time
          await updateDoc(roomRef, {
            deletedFor: updatedDeletedFor,
            deletedAt: updatedDeletedAt
          })
          
          // Wait a moment to ensure Firebase sync
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // Update local state - remove room from chatRooms array immediately
        commit('REMOVE_CHAT_ROOM', roomId)
        
        // Also clear messages for this room locally
        if (state.messages.has(roomName)) {
          state.messages.delete(roomName)
        }
        
        // Leave the Ably room
        const room = state.rooms.get(roomName)
        if (room) {
          await room.detach()
          state.rooms.delete(roomName)
        }
        
        // Clear active room if it's the deleted room
        if (state.activeRoom === roomName || state.activeRoom === roomId) {
          commit('SET_ACTIVE_ROOM', null)
        }
        
      } catch (error) {
        console.error('❌ Error deleting chat room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Create or get a room
    async createRoom({ commit, state, dispatch }, { participants, participantNames = [], participantRoles = [], roomName = null }) {
      try {
        // First check local state
        let existingRooms = state.chatRooms.filter(room => {
          if (room.participants.length !== participants.length) return false
          return participants.every(p => room.participants.includes(p))
        })
        
        // If not found locally, query Firebase to find any room with these participants
        if (existingRooms.length === 0) {
          const q = query(
            collection(db, 'chatRooms'),
            where('participants', 'array-contains', participants[0])
          )
          const querySnapshot = await getDocs(q)
          
          querySnapshot.forEach((doc) => {
            const roomData = doc.data()
            // Check if all participants match
            if (roomData.participants && roomData.participants.length === participants.length &&
                participants.every(p => roomData.participants.includes(p))) {
              existingRooms.push({
                id: doc.id,
                ...roomData,
                participants: roomData.participants || [],
                participantNames: roomData.participantNames || [],
                participantRoles: roomData.participantRoles || [],
                deletedFor: roomData.deletedFor || [],
                roomName: roomData.roomName,
                lastMessage: roomData.lastMessage || '',
                lastMessageAt: roomData.lastMessageAt?.toDate() || new Date(),
                createdAt: roomData.createdAt?.toDate() || new Date()
              })
            }
          })
        }
        
        if (existingRooms.length > 0) {
          const existingRoom = existingRooms[0]
          
          // If current user has deleted this room, remove them from deletedFor array
          const currentUserId = state.clientId
          if (existingRoom.deletedFor && existingRoom.deletedFor.includes(currentUserId)) {
            const updatedDeletedFor = existingRoom.deletedFor.filter(id => id !== currentUserId)
            
            // Update Firebase to remove user from deletedFor and clear message preview
            const roomRef = doc(db, 'chatRooms', existingRoom.id)
            await updateDoc(roomRef, {
              deletedFor: updatedDeletedFor,
              lastMessage: '',
              lastMessageSender: null
            })
            
            // Update local state - add room back if it was removed
            let rooms = [...state.chatRooms]
            const roomIndex = rooms.findIndex(r => r.id === existingRoom.id)
            if (roomIndex === -1) {
              // Room was removed from local state, add it back with cleared lastMessage
              rooms.push({
                ...existingRoom,
                deletedFor: updatedDeletedFor,
                lastMessage: '', // Clear the message preview
                lastMessageSender: null
              })
            } else {
              // Room exists, just update deletedFor and clear lastMessage
              rooms[roomIndex] = { 
                ...rooms[roomIndex], 
                deletedFor: updatedDeletedFor,
                lastMessage: '', // Clear the message preview
                lastMessageSender: null
              }
            }
            commit('SET_CHAT_ROOMS', rooms)
            
            // Clear any existing messages for this room to start fresh
            const ablyRoomName = existingRoom.roomName || existingRoom.id
            if (state.messages.has(ablyRoomName)) {
              state.messages.delete(ablyRoomName)
            }
            
            // Mark this room as reactivated to skip loading history
            if (!state.reactivatedRooms) {
              state.reactivatedRooms = new Set()
            }
            state.reactivatedRooms.add(ablyRoomName)
            
            // Also mark by room ID for lookup
            state.reactivatedRooms.add(existingRoom.id)
          }
          
          return existingRoom.id
        }
        
        // Create new room in Firebase
        const roomId = await dispatch('saveChatRoom', {
          participants,
          participantNames,
          participantRoles,
          roomName
        })
        
        // Create Ably room
        const { chatClient } = getAblyClients()
        const ablyRoomName = roomName || createRoomName(participants)
        const room = await chatClient.rooms.get(ablyRoomName)
        await room.attach()
        
        // Store room reference in state
        state.rooms.set(ablyRoomName, room)
        
        return roomId
        
      } catch (error) {
        console.error('Error creating room:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Join a room
    async joinRoom({ commit, state, dispatch }, { roomName, skipHistory = false }) {
      try {
        // Clear unread count and update last viewed time when joining a room (do this first!)
        const roomId = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)?.id
        if (roomId) {
          commit('CLEAR_UNREAD', roomId)
          // Persist lastViewedAt to Firebase
          await dispatch('persistLastViewedAt', roomId)
        }
        
        // Check if already subscribed to this room
        if (state.rooms.has(roomName)) {
          // Already subscribed, just set as active room
          commit('SET_ACTIVE_ROOM', roomName)
          return
        }
        
        // Check if this is a reactivated room
        const isReactivatedRoom = state.reactivatedRooms && 
                                 (state.reactivatedRooms.has(roomName) || 
                                  state.chatRooms.find(r => (r.roomName === roomName || r.id === roomName) && 
                                                           r.deletedFor?.includes(state.clientId)))
        
        if (isReactivatedRoom) {
          // Don't load history for reactivated rooms (messages are already filtered in autoSubscribe/subscribeToNewRoom)
          skipHistory = true
        }
        
        const { chatClient } = getAblyClients()
        
        // Get room instance
        const room = await chatClient.rooms.get(roomName)
        
        // Attach to room
        await room.attach()
        
        // Store room reference
        state.rooms.set(roomName, room)
        
        // Subscribe to messages with auto-room creation
        room.messages.subscribe((messageEvent) => {
          const msg = messageEvent.message
          
          
          // CRITICAL: Ensure room exists BEFORE adding message
          // This ensures the room is in chatRooms when ADD_MESSAGE tries to update unread counts
          dispatch('ensureRoomExistsFromMessage', { roomName, message: msg }).then(() => {
            // Add message after room is ensured to exist
            commit('ADD_MESSAGE', {
              roomName,
              message: msg
            })
          }).catch(err => {
            console.error('Error ensuring room exists:', err)
            // Still add message even if room creation fails
            commit('ADD_MESSAGE', {
              roomName,
              message: msg
            })
          })
        })
        
        // Subscribe to presence
        room.presence.subscribe((presenceEvent) => {
          const presenceData = Array.from(room.presence.members.values())
          commit('SET_PRESENCE', { roomName, presenceData })
        })
        
        // Subscribe to typing indicators
        room.typing.subscribe((typingEvent) => {
          const typingUsers = Array.from(typingEvent.currentlyTyping)
          commit('SET_TYPING', { roomName, typingUsers })
        })
        
        // Check if this room was just reactivated
        const isReactivated = Array.from(state.reactivatedRooms).some(roomId => {
          const r = state.chatRooms.find(rm => rm.id === roomId && (rm.roomName === roomName || rm.id === roomName))
          return r !== undefined
        })
        
        // Load message history only if not skipping and not reactivated
        // Note: For reactivated rooms, messages are already filtered in autoSubscribeToAllRooms/subscribeToNewRoom
        if (!skipHistory && !isReactivated) {
          // Get deletion time for this user (if room was previously deleted)
          // Handle Firestore Timestamp conversion
          const chatRoom = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)
          const deletedAt = chatRoom?.deletedAt?.[state.clientId]
          let deletionTime = null
          if (deletedAt) {
            if (deletedAt.toDate && typeof deletedAt.toDate === 'function') {
              // Firestore Timestamp object
              deletionTime = deletedAt.toDate().getTime()
            } else if (deletedAt.seconds) {
              // Firestore Timestamp in serialized format
              deletionTime = deletedAt.seconds * 1000 + (deletedAt.nanoseconds || 0) / 1000000
            } else if (deletedAt instanceof Date) {
              // Date object
              deletionTime = deletedAt.getTime()
            } else {
              // Try to parse as date string or timestamp
              deletionTime = new Date(deletedAt).getTime()
              if (isNaN(deletionTime)) {
                deletionTime = null
              }
            }
          }
          
          // Load all history first, then filter by deletion time
          const history = await room.messages.history({ limit: 100 }) // Load more to account for filtering
          
          // Filter messages: only include messages after deletion time (if room was deleted)
          let filteredHistory = history.items
          if (deletionTime) {
            filteredHistory = history.items.filter(msg => {
              const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
              return msgTime > deletionTime // Only messages after deletion
            })
          }
          
          // Sort history messages by timestamp (oldest first)
          const sortedHistory = filteredHistory.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
            return timeA - timeB
          })
          
          sortedHistory.forEach(message => {
            commit('ADD_MESSAGE', { roomName, message })
          })
        }
        
        commit('SET_ACTIVE_ROOM', roomName)
        
        // Recalculate unread count for all rooms to ensure accuracy
        // This ensures unread counts are always based on actual message counts
        dispatch('recalculateUnreadCounts')
        
        return room
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Leave a room
    async leaveRoom({ commit, state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (room) {
          await room.detach()
          state.rooms.delete(roomName)
        }
        
        if (state.activeRoom === roomName) {
          commit('SET_ACTIVE_ROOM', null)
        }
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Send a message
    async sendMessage({ commit, state, dispatch }, { roomName, text, roomId = null }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        const message = await room.messages.send({ text })
        
        
        // CRITICAL: Immediately add the sent message to state so it appears instantly in UI
        // This ensures user sees their own messages immediately, even if subscription hasn't fired yet
        // IMPORTANT: Always add the message, even if it doesn't have a serial yet
        // The serial will be assigned by Ably, and the subscription callback will handle duplicates
        if (message) {
          // Ensure message has necessary fields for display
          if (!message.clientId) {
            message.clientId = state.clientId
          }
          if (!message.timestamp) {
            message.timestamp = new Date().toISOString()
          }
          
                  commit('ADD_MESSAGE', {
                    roomName,
                    message: message
                  })
                }
        
        // Update Firebase with last message if roomId is provided
        if (roomId) {
          await dispatch('updateChatRoomLastMessage', {
            roomId,
            message: text,
            senderId: state.clientId
          })
        }
        
        // Immediately update local chat room state for real-time UI updates
        const chatRoom = state.chatRooms.find(r => r.id === roomId)
        if (chatRoom) {
          chatRoom.lastMessage = text
          chatRoom.lastMessageSender = state.clientId
          chatRoom.lastMessageAt = new Date()
        }
        
        return message
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Edit a message
    async editMessage({ commit, state }, { roomName, messageSerial, newText }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        const updatedMessage = await room.messages.update(messageSerial, { text: newText })
        commit('UPDATE_MESSAGE', { roomName, message: updatedMessage })
        
        return updatedMessage
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Delete a message
    async deleteMessage({ commit, state }, { roomName, messageSerial }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) {
          throw new Error('Room not found')
        }
        
        await room.messages.delete(messageSerial)
        commit('DELETE_MESSAGE', { roomName, messageSerial })
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    // Send typing indicator
    async sendTypingIndicator({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.typing.keystroke()
        
      } catch (error) {
        console.error('Error sending typing indicator:', error)
      }
    },
    
    // Stop typing indicator
    async stopTypingIndicator({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.typing.stop()
        
      } catch (error) {
        console.error('Error stopping typing indicator:', error)
      }
    },
    
    // Enter presence
    async enterPresence({ state }, { roomName, data = null }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.presence.enter(data)
        
      } catch (error) {
        console.error('Error entering presence:', error)
      }
    },
    
    // Leave presence
    async leavePresence({ state }, { roomName }) {
      try {
        const room = state.rooms.get(roomName)
        if (!room) return
        
        await room.presence.leave()
        
      } catch (error) {
        console.error('Error leaving presence:', error)
      }
    },
    
    // Ensure room exists when receiving a message from unknown room
    async ensureRoomExistsFromMessage({ commit, state, dispatch }, { roomName, message }) {
      try {
        const currentUserId = state.clientId
        if (!currentUserId) {
          return
        }
        
        // Check if room already exists in local state
        const existingRoom = state.chatRooms.find(r => r.roomName === roomName || r.id === roomName)
        if (existingRoom) {
          return existingRoom.id
        }
        
        // Parse room name to get participants
        const participants = parseRoomName(roomName)
        
        if (!participants || participants.length < 2) {
          console.error('Invalid room name format:', roomName)
          return null
        }
        
        // Check if current user is a participant
        if (!participants.includes(currentUserId)) {
          return null
        }
        
        // Query Firestore to see if room exists
        // Use participants query to ensure read permissions
        let querySnapshot = null
        try {
          // First try query by roomName (faster if we have read permissions)
          const q = query(
            collection(db, 'chatRooms'),
            where('roomName', '==', roomName)
          )
          querySnapshot = await getDocs(q)
        } catch (queryError) {
          // If query by roomName fails (permissions), try by participants
          const q = query(
            collection(db, 'chatRooms'),
            where('participants', 'array-contains', currentUserId)
          )
          querySnapshot = await getDocs(q)
          // Filter results by roomName manually
          const docs = querySnapshot.docs.filter(doc => {
            const data = doc.data()
            return data.roomName === roomName
          })
          // Create a fake querySnapshot with filtered docs
          querySnapshot = {
            empty: docs.length === 0,
            size: docs.length,
            docs: docs,
            forEach: (callback) => docs.forEach(callback)
          }
        }
        
        let roomId = null
        if (!querySnapshot.empty) {
          // Room exists in Firestore, get its data
          const roomDoc = querySnapshot.docs[0]
          roomId = roomDoc.id
          const roomData = roomDoc.data()
          const deletedFor = roomData.deletedFor || []
          
          // Check if room is deleted for this user
          if (deletedFor.includes(currentUserId)) {
            // Reactivate the room
            const roomRef = doc(db, 'chatRooms', roomId)
            const updatedDeletedFor = deletedFor.filter(id => id !== currentUserId)
            await updateDoc(roomRef, {
              deletedFor: updatedDeletedFor,
              lastMessage: message.text,
              lastMessageSender: message.clientId,
              lastMessageAt: serverTimestamp()
            })
            
            // Update room data with reactivated status
            const reactivatedRoomData = {
              id: roomId,
              ...roomData,
              deletedFor: updatedDeletedFor,
              lastMessage: message.text,
              lastMessageSender: message.clientId,
              lastMessageAt: new Date()
            }
            
            // Check if room already exists in local state (from previous session)
            const existingLocalRoom = state.chatRooms.find(r => r.id === roomId)
            if (existingLocalRoom) {
              // Update existing room instead of adding
              const roomIndex = state.chatRooms.findIndex(r => r.id === roomId)
              if (roomIndex !== -1) {
                state.chatRooms[roomIndex] = { ...state.chatRooms[roomIndex], ...reactivatedRoomData }
              }
            } else {
              // Add to local state if not exists
              commit('ADD_CHAT_ROOM', reactivatedRoomData)
            }
            
            // Record reactivation time - use the message's timestamp as the cutoff point
            // This ensures we keep the message that triggered the reactivation and all future messages
            const reactivationTime = message.timestamp ? new Date(message.timestamp).getTime() : new Date().getTime()
            if (!state.reactivatedAt) {
              state.reactivatedAt = new Map()
            }
            // Only set if not already set (keep earliest reactivation time)
            if (!state.reactivatedAt.has(roomName)) {
              state.reactivatedAt.set(roomName, reactivationTime)
            }
            
            // Use the stored reactivation time
            const storedReactivationTime = state.reactivatedAt.get(roomName) || reactivationTime
            // Use the message timestamp as cutoff - keep this message and all messages after it
            // Add a 1-second buffer to catch messages that arrived just before
            const cutoffTime = storedReactivationTime - 1000 // 1 second before the reactivation message
            if (state.messages.has(roomName)) {
              const messages = state.messages.get(roomName)
              const filteredMessages = messages.filter(msg => {
                const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
                // Keep the reactivation message and all messages after it
                // Also keep messages within 5 seconds before the reactivation message (to catch messages that arrived just before)
                return msgTime >= cutoffTime
              })
              
              if (filteredMessages.length < messages.length) {
                state.messages.set(roomName, filteredMessages)
              }
            }
            
            // Track that this room is being reactivated (to prevent history loading)
            // Store a flag to indicate this is a reactivated room
            if (!state.reactivatedRooms) {
              state.reactivatedRooms = new Set()
            }
            state.reactivatedRooms.add(roomName)
          } else {
            // Room exists and is not deleted, just add to local state if not already there
            commit('ADD_CHAT_ROOM', {
              id: roomId,
              ...roomData,
              participants: roomData.participants || [],
              participantNames: roomData.participantNames || [],
              participantRoles: roomData.participantRoles || []
            })
          }
        } else {
          // Room doesn't exist, create it
          // Get other participant's info
          const otherParticipantId = participants.find(p => p !== currentUserId)
          
          // Fetch user names from Firestore
          let currentUserName = currentUserId
          let otherUserName = otherParticipantId
          
          try {
            const currentUserDoc = await getDoc(doc(db, 'users', currentUserId))
            if (currentUserDoc.exists()) {
              const currentUserData = currentUserDoc.data()
              currentUserName = currentUserData.name || currentUserData.displayName || currentUserId
            }
            
            const otherUserDoc = await getDoc(doc(db, 'users', otherParticipantId))
            if (otherUserDoc.exists()) {
              const otherUserData = otherUserDoc.data()
              otherUserName = otherUserData.name || otherUserData.displayName || otherParticipantId
            }
          } catch (err) {
            // Continue with IDs as names if user names can't be fetched
          }
          
          // Create room in Firestore
          const roomData = {
            participants: participants,
            participantNames: participants.map(p => p === currentUserId ? currentUserName : otherUserName),
            participantRoles: ['user', 'user'], // Default roles
            roomName: roomName,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            lastMessage: message.text,
            lastMessageSender: message.clientId,
            deletedFor: []
          }
          
          const docRef = await addDoc(collection(db, 'chatRooms'), roomData)
          roomId = docRef.id
          
          // Add to local state
          commit('ADD_CHAT_ROOM', {
            id: roomId,
            ...roomData,
            createdAt: new Date(),
            lastMessageAt: new Date()
          })
          
          // Unread count will be calculated automatically in ADD_MESSAGE mutation
        }
        
        // Ensure we're subscribed to this room in Ably
        if (!state.rooms.has(roomName)) {
          const { chatClient } = getAblyClients()
          const ablyRoom = await chatClient.rooms.get(roomName)
          await ablyRoom.attach()
          state.rooms.set(roomName, ablyRoom)
          
          // Subscribe to messages (avoid duplicate subscriptions)
          ablyRoom.messages.subscribe((messageEvent) => {
            const msg = messageEvent.message
            commit('ADD_MESSAGE', {
              roomName,
              message: msg
            })
          })
          
          // Only load message history if room was NOT reactivated
          // Check if room was marked as reactivated in this session
          const isReactivatedRoom = state.reactivatedRooms && state.reactivatedRooms.has(roomName)
          
          if (!isReactivatedRoom) {
            try {
              const history = await ablyRoom.messages.history({ limit: 50 })
              
              const sortedHistory = history.items.sort((a, b) => {
                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
                return timeA - timeB
              })
              
              sortedHistory.forEach(msg => {
                commit('ADD_MESSAGE', { roomName, message: msg })
              })
            } catch (err) {
              console.warn('Error loading message history:', err)
            }
          }
        }
        return roomId
        
      } catch (error) {
        console.error('Error ensuring room exists from message:', error)
        return null
      }
    },
    
    // Close connection
    async closeConnection({ commit, state }) {
      try {
        // Unsubscribe from chat room listener if it exists
        if (state.chatRoomListenerUnsubscribe) {
          state.chatRoomListenerUnsubscribe()
          state.chatRoomListenerUnsubscribe = null
        }
        
        closeAblyConnection()
        commit('SET_CONNECTION_STATUS', {
          status: 'disconnected',
          isConnected: false
        })
        commit('SET_CLIENT_ID', null)
        
      } catch (error) {
        commit('SET_ERROR', error.message)
      }
    },
    
    // Persist lastViewedAt to Firebase
    async persistLastViewedAt({ state }, roomId) {
      try {
        if (!state.clientId) return
        
        const timestamp = state.lastViewedAt.get(roomId)
        if (!timestamp) return
        
        const roomRef = doc(db, 'chatRooms', roomId)
        await updateDoc(roomRef, {
          [`lastViewedAt.${state.clientId}`]: timestamp
        })
      } catch (error) {
        console.error('Error persisting lastViewedAt to Firebase:', error)
      }
    },
    
    // Recalculate unread counts for all rooms based on actual message counts
    recalculateUnreadCounts({ state, commit, dispatch }) {
      const currentTime = new Date().getTime()
      
      for (const room of state.chatRooms) {
        const roomName = room.roomName || room.id
        const roomId = room.id
        
        // Check if this is the active room
        const activeRoomId = state.chatRooms.find(r => state.activeRoom === (r.roomName || r.id))?.id
        if (roomId === activeRoomId) {
          // Active room has no unread messages
          commit('CLEAR_UNREAD', roomId)
          // Persist to Firebase (don't await to avoid blocking)
          dispatch('persistLastViewedAt', roomId)
          continue
        }
        
        // Get last viewed time for this room
        const lastViewed = state.lastViewedAt.get(roomId) || 0
        const roomMessages = state.messages.get(roomName) || []
        
        // Count messages that are:
        // 1. Not from current user
        // 2. After last viewed time
        const unreadCount = roomMessages.filter(msg => {
          const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0
          return msg.clientId !== state.clientId && msgTime > lastViewed
        }).length
        
        state.unreadCounts.set(roomId, unreadCount)
      }
      
      // Force reactivity by creating a new Map instance after all updates
      state.unreadCounts = new Map(state.unreadCounts)
    }
  },
  
  getters: {
    // Connection
    isConnected: state => state.isConnected,
    connectionStatus: state => state.connectionStatus,
    clientId: state => state.clientId,
    
    // Rooms
    activeRoom: state => state.activeRoom,
    chatRooms: state => state.chatRooms,
    getRoomById: (state) => (roomId) => state.chatRooms.find(room => room.id === roomId),
    
    // Messages
    getMessages: state => roomName => {
      if (!roomName) {
        return []
      }
      
      return state.messages.get(roomName) || []
    },
    
    // Presence
    getPresence: state => roomName => {
      return state.presence.get(roomName) || []
    },
    
    // Typing
    getTypingUsers: state => roomName => {
      return state.typing.get(roomName) || []
    },
    
    // Online users
    onlineUsers: state => Array.from(state.onlineUsers),
    
    // UI state
    loading: state => state.loading,
    error: state => state.error,
    
    // Helper getters
    getRoomById: state => roomId => {
      return state.chatRooms.find(room => room.id === roomId)
    },
    
    getUnreadCount: state => roomId => {
      // Get unread count from the unreadCounts Map
      const count = state.unreadCounts.get(roomId) || 0
      return count
    }
  }
}
