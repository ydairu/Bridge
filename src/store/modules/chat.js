import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    chats: [],
    messages: [],
    activeChat: null,
    loading: false,
    error: null
  },
  
  mutations: {
    SET_CHATS(state, chats) {
      state.chats = chats
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages
    },
    SET_ACTIVE_CHAT(state, chat) {
      state.activeChat = chat
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchChats({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', userId),
          orderBy('lastMessageAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const chats = []
        querySnapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() })
        })
        
        commit('SET_CHATS', chats)
        commit('SET_LOADING', false)
        return chats
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    subscribeToMessages({ commit }, chatId) {
      const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      )
      
      return onSnapshot(q, (snapshot) => {
        const messages = []
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() })
        })
        commit('SET_MESSAGES', messages)
      })
    },
    
    async sendMessage({ commit }, { chatId, senderId, text }) {
      try {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId,
          text,
          timestamp: serverTimestamp(),
          read: false
        })
        
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: text,
          lastMessageAt: serverTimestamp()
        })
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    async createChat({ commit }, { participants, jobId = null }) {
      try {
        const chatData = {
          participants,
          jobId,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          lastMessage: ''
        }
        
        const docRef = await addDoc(collection(db, 'chats'), chatData)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  },
  
  getters: {
    allChats: state => state.chats,
    messages: state => state.messages,
    activeChat: state => state.activeChat,
    loading: state => state.loading
  }
}

