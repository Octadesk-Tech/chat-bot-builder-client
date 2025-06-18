import { useState, useEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'
import useSWR from 'swr'
import Storage from '@octadesk-tech/storage'
import { getBaseClient } from 'services/octadesk/http'
import { Text } from '@chakra-ui/react'

type Props = {
  onSelect: (option: any) => void
}

export const fetch = async (): Promise<any[]> => {
  const authStorage = Storage.getItem('userToken') as any
  const client = await getBaseClient('forms')

  const resp = await client.get('?domain=1', {
    headers: {
      authorization: `Bearer ${authStorage}`,
    },
  })
  return resp.data
}

export const FormsSelect = ({ onSelect }: Props) => {
  const { data, error } = useSWR(`forms`, fetch, {
    dedupingInterval: 60000 * 60 * 24,
  })
  const [options, setOptions] = useState<Array<OptionType>>([])

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useEffect(() => {
    if (error) {
      console.error('Error fetching forms:', error)
      return
    }

    if (data) {
      const formattedOptions = data.map((item: any) => ({
        key: item.id,
        label: item.name,
        value: item.id,
      }))

      setOptions(formattedOptions)
    }
  }, [data, error])

  return (
    <>
      <Text fontWeight={700} fontSize={12}>
        Selecione o Formulário*
      </Text>
      <OctaSelect
        //@ts-ignore
        marginTop="4px"
        name="forms"
        placeholder="Selecione um formulário personalizado"
        findable
        options={options}
        onChange={handleOnChange}
      />
      <Text fontSize={12} style={{ marginTop: '4px' }} color={'gray.500'}>
        Selecione um formulário para ter acesso aos seus respectivos campos.
      </Text>
    </>
  )
}
