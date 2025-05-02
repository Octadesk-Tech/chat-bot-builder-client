import {
  Popover,
  PopoverTrigger,
  Flex,
  Tooltip,
  IconButton,
  PopoverContent,
  IconButtonProps,
} from '@chakra-ui/react'
import { UserIcon } from 'assets/icons'
import { Variable } from 'models'
import React, { useEffect, useState } from 'react'
import { VariableSearchInput } from '../VariableSearchInput/VariableSearchInput'

type Props = {
  onSelectVariable: (
    variable: Pick<Variable, 'name' | 'id' | 'token'> | undefined
  ) => void
} & Omit<IconButtonProps, 'aria-label'>

export const VariablesButton = ({ onSelectVariable, ...props }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleOnClose = () => {
    if (!isCreating) setIsPopoverOpen(false)
  }

  useEffect(() => {
    if (isPopoverOpen && !isCreating) {
      setIsPopoverOpen(false)
    }
  }, [isCreating])

  return (
    <Popover
      isLazy
      placement="bottom-end"
      gutter={0}
      isOpen={isPopoverOpen}
      onOpen={() => setIsPopoverOpen(true)}
      onClose={handleOnClose}
      closeOnBlur={!isCreating}
    >
      <PopoverTrigger>
        <Flex>
          <Tooltip label="Insira uma variável">
            <IconButton
              aria-label={'Insert a variable'}
              icon={<UserIcon />}
              pos="relative"
              {...props}
            />
          </Tooltip>
        </Flex>
      </PopoverTrigger>
      <PopoverContent w="full">
        <VariableSearchInput
          onSelectVariable={onSelectVariable}
          placeholder="Pesquise sua variável"
          shadow="lg"
          menuPosition="absolute"
          onCreateModalOpenChange={setIsCreating}
        />
      </PopoverContent>
    </Popover>
  )
}
