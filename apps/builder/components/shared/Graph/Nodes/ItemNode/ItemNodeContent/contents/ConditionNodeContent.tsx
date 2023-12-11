import { Stack, Tag, Text, Flex, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  Comparison,
  ConditionItem,
  ComparisonOperators,
  LogicalOperator,
} from 'models'
import React from 'react'
import { byId, isNotDefined } from 'utils'

type Props = {
  item: ConditionItem
}

export const ConditionNodeContent = ({ item }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Flex px={2} py={2}>
      {item.content.comparisons.length === 0 ||
      comparisonIsEmpty(item.content.comparisons[0]) ? (
        <Text color={'gray.500'}>Adicionar uma regra...</Text>
      ) : (
        <Stack maxW="170px">
          {item.content.comparisons.map((comparison, idx) => {
            const variable = typebot?.variables.find(
              byId(comparison.variableId)
            )
            return (
              <Wrap key={comparison.id} spacing={1} noOfLines={0}>
                {idx > 0 && (
                  <Text>
                    {parseLogicalOperatorSymbol(item.content.logicalOperator) ??
                      ''}
                  </Text>
                )}
                {variable?.token && (
                  <Tag bgColor="orange.400" color="white">
                    {variable.token}
                  </Tag>
                )}
                {comparison.comparisonOperator && (
                  <Text>
                    {parseComparisonOperatorSymbol(
                      comparison.comparisonOperator
                    )}
                  </Text>
                )}
                {comparison?.value && (
                  <Tag bgColor={'gray.200'}>
                    <Text noOfLines={0}>{comparison.value}</Text>
                  </Tag>
                )}
              </Wrap>
            )
          })}
        </Stack>
      )}
    </Flex>
  )
}

const comparisonIsEmpty = (comparison: Comparison) =>
  isNotDefined(comparison.comparisonOperator) &&
  isNotDefined(comparison.value) &&
  isNotDefined(comparison.variableId)

const parseLogicalOperatorSymbol = (operator: LogicalOperator) => {
  const toCompare = Object.keys(LogicalOperator).indexOf(operator)
  return Object.values(LogicalOperator)[toCompare]
}

const parseComparisonOperatorSymbol = (operator: ComparisonOperators) => {
  const toCompare = Object.keys(ComparisonOperators).indexOf(operator)
  console.log('parseComparisonOperatorSymbol', { toCompare, operator })
  switch (Object.values(ComparisonOperators)[toCompare]) {
    case ComparisonOperators.CONTAINS:
      return 'contém'
    case ComparisonOperators.EQUAL:
      return '='
    case ComparisonOperators.GREATER:
      return '>'
    case ComparisonOperators.LESS:
      return '<'
    case ComparisonOperators.NOT_EQUAL:
      return '!='
  }
}
