import axios from 'axios'

const Instance = axios.create({
    baseURL: 'https://my-agent.liara.run/',
    proxy: false
})

export const getUserAPI = (username) => 
    Instance.get('/users/?username='+ username)

export const getUsersAPI = () =>
    Instance.get('/users')

export const deleteUserAPI = (username) => 
    Instance.delete('/users/?username=' + username)

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