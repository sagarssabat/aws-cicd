export interface StateApiRespone {
    states: State[]
}

export interface State {
    name: string
    state_id: number
    country_id: number
}

export interface CityApiRespone {
    cities: City[]
}

export interface City {
    name: string
    city_id: number
    state_id: number
}

export interface CountryApiRespone {
    countries: Country[]
}

export interface Country {
    name: string
    country_id: number
}

export interface StateCityQueryParams {
    country_id: number
    state_id?: number
}
