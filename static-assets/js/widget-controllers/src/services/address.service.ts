import { CityApiRespone, StateApiRespone, StateCityQueryParams, CountryApiRespone } from '../interfaces/state-city'
import { getJsonData } from '../util'

export async function getStates(queryParams: StateCityQueryParams): Promise<StateApiRespone> {
  return getJsonData<StateApiRespone>("/api/getcountrystatecity", queryParams)
}

export async function getCities(queryParams: StateCityQueryParams): Promise<CityApiRespone> {
  return getJsonData<CityApiRespone>("/api/getcountrystatecity", queryParams)
}

export async function getCountries(): Promise<CountryApiRespone> {
  return getJsonData<CountryApiRespone>("/api/getcountrystatecity")
}