import React, { useState, useEffect, useCallback } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import { AssignToTeamOptions } from 'models'
import { OptionType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: any) => void
  selectedUserGroup?: string
}

export const AssignToResponsibleSelect = ({
  onSelect,
  selectedUserGroup,
}: Props) => {
  const { octaAgents } = useTypebot()

  const [itemsToResponsibleAssign, setItemsToResponsibleAssign] = useState<
    Array<OptionType>
  >([])
  const [defaultSelected, setDefaultSelected] = useState<OptionType>()

  useEffect(() => {
    if (octaAgents) {
      const items = [
        {
          label: 'Responsável pelo contato',
          value: {
            assignType: '@AGENT',
            subType: 'RESPONSIBLE_CONTACT',
          },
          key: 'responsible-key',
          isTitle: false,
        },
      ]
      setItemsToResponsibleAssign(items)
    }
    return () => {
      setItemsToResponsibleAssign([])
    }
  }, [octaAgents])

  const handleOnChange = useCallback((selected: any): void => {
    console.log(selected)
    onSelect(selected)
  }, [])

  useEffect(() => {
    handleOnChange({
      label: 'Responsável pelo contato',
      value: {
        assignType: '@AGENT',
        subType: 'RESPONSIBLE_CONTACT',
      },
      key: 'responsible-key',
      isTitle: false,
    })
  }, [handleOnChange])

  return (
    <OctaSelect
      placeholder=""
      defaultSelected={defaultSelected}
      findable
      options={itemsToResponsibleAssign}
      onChange={handleOnChange}
    />
  )
}
