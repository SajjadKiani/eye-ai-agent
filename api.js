import axios from 'axios'

const Instance = axios.create({
    baseURL: 'http://localhost:3000',
})

export const getUserAPI = (username) => 
    Instance.get('/users/?username='+ username)

export const getUsersAPI = () =>
    Instance.get('/users')

export const createUserAPI = (data) => {
    return Instance.post('/users', {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })
}

export const updateUserAPI = (id, data) => {
    return Instance.put(`/users/${id}`, {
        ...data,
        updatedAt: new Date().toISOString()
    })
}