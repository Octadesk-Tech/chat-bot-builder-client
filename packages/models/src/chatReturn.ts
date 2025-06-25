export enum ReturnType {
  IS_RETURN = 'IS_RETURN',
  IS_NOT_RETURN = 'IS_NOT_RETURN'
}

export enum TimeTypeValue {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR'
}

export type TimeType = {
  value: TimeTypeValue
  label: string
}