import { ReturnOfServiceItem, ReturnType } from 'models'
import React from 'react'
import { Container, ExternalContainer } from './ReturnOfService.style'
import { Text } from '@chakra-ui/react'

type Props = {
  item: ReturnOfServiceItem
}

export const ReturnOfServiceContent = ({ item }: Props) => {
  const displayText = item.content.returnType === ReturnType.IS_RETURN ? 
    'Se for retorno, ir para:' : 'Se não for retorno, ir para:'

  return (
    <ExternalContainer>
      <Container>
          <Text>{displayText}</Text>
      </Container>
    </ExternalContainer>
  )

}
