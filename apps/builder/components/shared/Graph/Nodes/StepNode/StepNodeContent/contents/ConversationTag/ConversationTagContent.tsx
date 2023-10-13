import { ConversationTagStep } from 'models'
import React, { useEffect, useState } from 'react'
import { HStack, Stack, Tag, Text } from '@chakra-ui/react'

type Props = {
  step: ConversationTagStep
}

const ConversationTagContent = ({ step }: Props) => {
  const [selectedTags, setSelectedTags] = useState<any>();

  useEffect(() => {
    if (step?.options?.tags) {
      setSelectedTags(step?.options?.tags);
    }
    return () => {
      setSelectedTags(undefined)
    };
  }, [step]);

  return (
    <Stack>
      <Text>
        Tags selecionadas:
      </Text>
      <HStack spacing={4}>
        {
          selectedTags?.map((item: any) => (
            <Tag key={item._id} variant='solid'>
              {item.name || '...'}
            </Tag>
          ))
        }
      </HStack>
    </Stack>
  )
}

export default ConversationTagContent