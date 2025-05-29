import { get, post, put, destroy } from './helpers/ApiRequestsHelper'

const getAll = () => {
  return get('users/myrestaurants')
}

const getDetail = (id) => {
  return get(`restaurants/${id}`)
}

const getRestaurantCategories = () => {
  return get('restaurantCategories')
}

const create = (data) => {
  return post('restaurants', data)
}

const update = (id, data) => {
  return put(`restaurants/${id}`, data)
}

const remove = (id) => {
  return destroy(`restaurants/${id}`)
}

const getRestaurantSchedules = (id) => {
  return get(`/restaurants/${id}/schedules`)
}

/* SOLUTION */
const getRestaurantSchedule = async (restaurantId, scheduleId) => {
  return (await getRestaurantSchedules(restaurantId)).find(schedule => schedule.id === scheduleId)
}

const createSchedule = (restaurantId, data) => {
  return post(`/restaurants/${restaurantId}/schedules`, data)
}

const updateSchedule = (restaurantId, scheduleId, data) => {
  return put(`/restaurants/${restaurantId}/schedules/${scheduleId}`, data)
}

const removeSchedule = (restaurantId, scheduleId) => {
  return destroy(`/restaurants/${restaurantId}/schedules/${scheduleId}`)
}

export { getAll, getDetail, getRestaurantCategories, create, update, remove, getRestaurantSchedules, createSchedule, updateSchedule, removeSchedule, getRestaurantSchedule }
