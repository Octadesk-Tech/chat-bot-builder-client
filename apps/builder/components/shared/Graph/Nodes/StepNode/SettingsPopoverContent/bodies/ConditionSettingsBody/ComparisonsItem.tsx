import { Stack, IconButton, Select, Flex } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { DropdownList } from 'components/shared/DropdownList'
import { Input } from 'components/shared/Textbox/Input'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { Comparison, Variable, ComparisonOperators } from 'models'
import { useTypebot } from 'contexts/TypebotContext'
import { useEffect, useState } from 'react'
import CustomFields from 'services/octadesk/customFields/customFields'
import { CustomFieldTypes } from 'enums/customFieldsEnum'
import { useContactStatus } from 'hooks/useContactStatus'

export const ComparisonItem = ({
  item,
  onItemChange,
  onRemoveItem,
  required
}: TableListItemProps<Comparison>) => {
  const { typebot, customVariables } = useTypebot()

  const myVariable = typebot?.variables?.find(
    (v: Variable) => v.token === item?.variableId || v.id === item?.variableId
  )
  const myComparisonOperator = item?.comparisonOperator

  const [needSecondaryValue, setNeedSecondaryValue] = useState<boolean>(
    !!item.secondaryValue
  )
  const [needValue, setNeedValue] = useState<boolean>(true)
  const [listOptions, setListOptions] = useState<Array<{ key: string | number, value: string, label: string }>>([])

  useEffect(() => {
    const loadListOptions = async () => {
      if (!myVariable?.token || myVariable.token === '#status-do-contato') {
        setListOptions([])
        return
      }

      const fieldId = myVariable.name?.replace('customField.', '') || myVariable.fieldId
      if (fieldId) {
        try {
          const fields = await CustomFields().getCustomFields()
          const matchingField = fields.find((f: any) => f.fieldId === fieldId)

          if (matchingField && Array.isArray(matchingField.listItem) && matchingField.listItem.length > 0) {
            const options = matchingField.listItem
              .sort((a: any, b: any) => a.order - b.order)
              .map((item: any) => ({
                key: item.order,
                value: item.text,
                label: item.text
              }))
            setListOptions(options)
          } else {
            setListOptions([])
          }
        } catch (error) {
          console.error('Error loading list options:', error)
          setListOptions([])
        }
      }
    }

    loadListOptions()
  }, [myVariable?.token, myVariable?.name, myVariable?.fieldId])

  const handleSelectVariable = (variable?: Variable) => {
    if (!variable) {
      return
    }

    const newVariableId = variable?.id || variable?.token

    const isSameVariable = (
      (newVariableId && newVariableId === item.variableId) ||
      (variable?.id && variable.id === item.variableId) ||
      (variable?.token && variable.token === item.variableId) ||
      (variable?.token && variable?.token === item.variableId) ||
      (variable?.variableId && variable.variableId === item.variableId)
    )

    if (isSameVariable) {
      return
    }

    onItemChange({
      ...item,
      variableId: newVariableId,
      value: '',
      secondaryValue: undefined,
    })
  }

  const handleSelectComparisonOperator = (
    comparisonOperator: ComparisonOperators,
  ) => {
    const indexOf =
      Object.values(ComparisonOperators).indexOf(comparisonOperator)
    const val = Object.keys(ComparisonOperators)[indexOf]

    if (val === item.comparisonOperator) return

    onItemChange({ ...item, comparisonOperator: val as ComparisonOperators })
  }
  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  const handleChangeSecondaryValue = (value: string) => {
    if (value === item.secondaryValue) return
    onItemChange({ ...item, secondaryValue: value })
  }

  const showCorrectInput = (value: ComparisonOperators | undefined) => {
    if (!value) return

    const indexOf = Object.keys(ComparisonOperators).indexOf(value)
    return Object.values(ComparisonOperators)[indexOf]
  }

  const resolveOperators = () => {
    function isStringArray() {
      return Number(myVariable?.type) === CustomFieldTypes.Text || Number(myVariable?.type) === CustomFieldTypes.MultiText
    }
    function isNumberArray() {
      return Number(myVariable?.type) === CustomFieldTypes.Numbers || Number(myVariable?.type) === CustomFieldTypes.Decimal || Number(myVariable?.type) === CustomFieldTypes.Date
    }
    const allTypesArray = [
      ComparisonOperators.EQUAL,
      ComparisonOperators.NOT_EQUAL,
      ComparisonOperators.EMPTY,
      ComparisonOperators.NOT_EMPTY,
    ]

    const stringArray = [
      ComparisonOperators.START_WITH,
      ComparisonOperators.NOT_START_WITH,
      ComparisonOperators.END_WITH,
      ComparisonOperators.NOT_END_WITH,
      ComparisonOperators.CONTAINS,
      ComparisonOperators.NOT_CONTAINS,
    ]

    const numberArray = [
      ComparisonOperators.GREATER,
      ComparisonOperators.GREATER_OR_EQUAL,
      ComparisonOperators.LESS,
      ComparisonOperators.LESS_OR_EQUAL,
      ComparisonOperators.BETWEEN,
      ComparisonOperators.NOT_BETWEEN,
    ]

    if (!myVariable || (myVariable?.type || '') === '') return allTypesArray
    if (['string', 'text', 'order'].includes(myVariable.type || '') || isStringArray())
      return [...allTypesArray, ...stringArray]
    if (['float', 'number', 'date'].includes(myVariable.type || '') || isNumberArray())
      return [...allTypesArray, ...numberArray]

    return allTypesArray
  }

  const handleDeleteClick = () => {
    onRemoveItem({ ...item })
  }

  useEffect(() => {
    const index = Object.keys(ComparisonOperators).indexOf(
      myComparisonOperator || ComparisonOperators.EQUAL
    )
    const myValue = Object.values(ComparisonOperators)[index]
    setNeedSecondaryValue(
      [ComparisonOperators.BETWEEN, ComparisonOperators.NOT_BETWEEN].includes(
        myValue
      )
    )
    setNeedValue(
      ![ComparisonOperators.EMPTY, ComparisonOperators.NOT_EMPTY].includes(
        myValue
      )
    )
  }, [myComparisonOperator])

  useEffect(() => {
    if (needValue) return
    onItemChange({ ...item, value: undefined })
  }, [needValue])

  useEffect(() => {
    if (needSecondaryValue) return
    onItemChange({ ...item, secondaryValue: undefined })
  }, [needSecondaryValue])

  const basicOptions = useContactStatus()

  const typeOfInputValue = () => {
    const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleChangeValue(e.target.value)
    }

    if (!needValue) return

    if (listOptions.length > 0) {
      return (
        <Select
          value={item.value || ''}
          onChange={onSelect}
          placeholder="selecione uma opção"
        >
          {item.value && !listOptions.some(opt => opt.value === item.value) && (
            <option key="saved-value" value={item.value}>
              {item.value} (valor guardado)
            </option>
          )}
          {listOptions.map((option: any) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )
    }

    if (myVariable?.token === '#status-do-contato') {

      return (
        <Select
          value={item.value || ''}
          onChange={onSelect}
          placeholder="selecione uma opção"
        >
          {basicOptions.map((option) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )
    }

    if (myVariable?.type === 'select') {
      return (
        <Select
          value={item.value || ''}
          onChange={onSelect}
          placeholder="selecione uma opção"
        >
          {customVariables.map((v) => (
            <option key={v?.id} value={v?.id}>
              {v?.name}
            </option>
          ))}
        </Select>
      )
    }

    if (myVariable?.type === 'boolean' || myVariable?.type === 'yesno') {
      return (
        <Select
          value={item.value || ''}
          onChange={onSelect}
          placeholder="selecione uma opção"
        >
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </Select>
      )
    }

    return (
      <Input
        defaultValue={item.value ?? ''}
        onChange={handleChangeValue}
        placeholder="Digite um valor..."
      />
    )
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={handleSelectVariable}
        placeholder="Pesquise sua variável"
        labelDefault="Se"
      />
      {!item.variableId && (
        <Flex color="red.400" fontSize="sm" mt={2}>
          {typeof required === 'object'
            ? required?.errorMsg
            : 'É obrigatório selecionar uma variável'}
        </Flex>
      )}
      <DropdownList<ComparisonOperators>
        currentItem={showCorrectInput(item.comparisonOperator)}
        onItemSelect={handleSelectComparisonOperator}
        items={resolveOperators()}
        placeholder="Selecione um operador"
      />
      {!item.comparisonOperator && (
        <Flex color="red.400" fontSize="sm" mt={2}>
          {typeof required === 'object'
            ? required?.errorMsg
            : 'É obrigatório selecionar um operador'}
        </Flex>
      )}
      {typeOfInputValue()}
      {needSecondaryValue && (
        <div>
          <span> E </span>
          <Input
            defaultValue={item.secondaryValue ?? ''}
            onChange={handleChangeSecondaryValue}
            placeholder="Digite um valor..."
          />
        </div>
      )}
      <IconButton
        aria-label="Delete item"
        icon={<TrashIcon />}
        size="xs"
        shadow="md"
        colorScheme="gray"
        onClick={handleDeleteClick}
      />
    </Stack>
  )
}
