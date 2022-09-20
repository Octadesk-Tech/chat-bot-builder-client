import React, { useState, useEffect, useLayoutEffect } from 'react'
import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import { useTypebot } from 'contexts/TypebotContext'
import {
  AssignToTeamOptions
} from 'models'
import { OptionItemType } from 'components/octaComponents/OctaSelect/OctaSelect.type'

type Props = {
  onSelect: (option: AssignToTeamOptions) => void,
  selectedUserGroup: string
}

export const AutoAssignToSelect = ({ onSelect, selectedUserGroup }: Props) => {
  const { octaAgents } = useTypebot();

  const [itemsToAutoAssign, setItemsToAutoAssign] = useState<Array<OptionItemType>>([])
  const [defaultSelected, setDefaultSelected] = useState<OptionItemType>();

  useEffect(() => {
    if (octaAgents) {
      const items = octaAgents.map((agentGroup) => ({
        label: agentGroup.name,
        value: JSON.stringify({
          assignTo: agentGroup.id,
          assignType: agentGroup.operationType
        }),
        isTitle: agentGroup.isTitle,
      }))
      setItemsToAutoAssign(items);
    }
    return () => {
      setItemsToAutoAssign([])
    };
  }, [octaAgents]);

  const handleOnChange = (selected: any): void => {
    onSelect(selected)
  }

  useLayoutEffect(() => {
    if (octaAgents) {
      const defaults = octaAgents.filter((item) => item.id === selectedUserGroup)[0];
      setDefaultSelected({
        label: defaults.name,
        value: JSON.stringify({
          assignTo: defaults.id,
          assignType: defaults.operationType
        })
      })
    }
    return () => {
      setDefaultSelected(undefined)
    };
  }, [octaAgents, selectedUserGroup])

  return (
    <OctaSelect
      placeholder="Não atribuir (Visível a todos)"
      defaultSelected={defaultSelected}
      items={itemsToAutoAssign}
      onChange={handleOnChange}
    />
  )
}
