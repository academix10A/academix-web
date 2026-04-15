import localforage from 'localforage'

const TOKEN_KEY = 'academix_token'
const USER_KEY  = 'academix_user'

export const authStorage = {
    async getToken() {
        return await localforage.getItem(TOKEN_KEY)
    },

    async setToken(token) {
        return await localforage.setItem(TOKEN_KEY, token)
    },

    async removeToken() {
        return await localforage.removeItem(TOKEN_KEY)
    },

    async getUser() {
        return await localforage.getItem(USER_KEY)
    },

    async setUser(user) {
        return await localforage.setItem(USER_KEY, user)
    },

    async removeUser() {
        return await localforage.removeItem(USER_KEY)
    },

    async clearAll() {
        await localforage.removeItem(TOKEN_KEY)
        await localforage.removeItem(USER_KEY)
    },
}