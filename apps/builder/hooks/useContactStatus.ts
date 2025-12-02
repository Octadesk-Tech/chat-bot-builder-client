import { useEffect, useState } from "react"
import { Persons } from "../services/octadesk/persons/persons"

export type BasicOption = {
  key: number
  value: string
  label: string
}

export const useContactStatus = () => {
  const [basicOptions, setBasicOptions] = useState<BasicOption[]>([])

  useEffect(() => {
    const loadContactStatus = async () => {
      try {
        const { getStatusContact } = Persons()
        const ContactStatus = await getStatusContact()

        setBasicOptions([
          { key: 0, value: ContactStatus.Lead, label: "Lead" },
          { key: 1, value: ContactStatus.Cliente, label: "Cliente" },
        ])
      } catch (error) {
        console.error("Erro ao carregar status de contato:", error)
      }
    }

    loadContactStatus()
  }, [])

  return basicOptions
}