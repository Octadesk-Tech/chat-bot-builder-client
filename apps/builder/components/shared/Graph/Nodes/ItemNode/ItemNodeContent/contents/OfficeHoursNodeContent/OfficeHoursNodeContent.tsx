import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { Comparison, ConditionItem, ComparisonOperators, OfficeHoursItem } from 'models'
import React from 'react'
import { Container, SelectedCalendar } from './OfficeHours.style'

type Props = {
  item: OfficeHoursItem
}

export const OfficeHoursNodeContent = ({ item }: Props) => {
  const { typebot } = useTypebot();

  return (
    <Container>
      {item.content.values.map((value) => (
        <>
        {value === "@OFFICE_HOURS_TRUE" && "Durante o horário de expediente"}
        {value === "@OFFICE_HOURS_FALSE" && "Fora do horário de expediente"}
        </>
      ))}
    </Container>
  )
}