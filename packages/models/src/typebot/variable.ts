export type Variable = {
  id?: string | undefined
  variableId: string | undefined
  domain: "PERSON" | "ORGANIZATION" | "CHAT"
  name: string
  token: string
  type: string | undefined
  value?: string | number
  fieldId: string
  example: string | undefined
}

export type VariableWithValue = Omit<Variable, 'value'> & {
  value: string
}
