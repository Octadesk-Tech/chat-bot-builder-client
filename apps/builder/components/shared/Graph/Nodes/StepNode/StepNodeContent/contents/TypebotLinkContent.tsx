import { TypebotLinkStep } from 'models'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import {
  useTypebotExtras,
  useTypebotSelector,
} from 'contexts/TypebotContext'
import { byId } from 'utils'

type Props = {
  step: TypebotLinkStep
}

export const TypebotLinkContent = ({ step }: Props) => {
  const { linkedTypebots } = useTypebotExtras()
  const typebotId = useTypebotSelector((t) => t?.id)
  const typebotName = useTypebotSelector((t) => t?.name)
  const currentBlocks = useTypebotSelector((t) => t?.blocks)
  const isCurrentTypebot =
    !!typebotId &&
    (step.options.typebotId === typebotId ||
      step.options.typebotId === 'current')
  const linkedTypebot = isCurrentTypebot
    ? { blocks: currentBlocks, name: typebotName }
    : linkedTypebots?.find(byId(step.options.typebotId))
  const blockTitle = linkedTypebot?.blocks?.find(
    byId(step.options.blockId)
  )?.title
  if (!step.options.typebotId) return <Text color="gray.500">Configuração...</Text>
  return (
    <Text>
      Pular{' '}
      {blockTitle ? (
        <>
          para <Tag>{blockTitle}</Tag>
        </>
      ) : (
        <></>
      )}{' '}
      {!isCurrentTypebot ? (
        <>
          em <Tag colorScheme="blue">{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
