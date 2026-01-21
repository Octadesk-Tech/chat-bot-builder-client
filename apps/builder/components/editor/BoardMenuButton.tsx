import {
  IconButton,
  IconButtonProps,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { CheckIcon } from 'assets/icons'
import { useUser } from 'contexts/UserContext'
import { RightPanel, useEditor } from 'contexts/EditorContext'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { EditorSettingsModal } from './EditorSettingsModal'

const isNotDefined = (value: unknown): value is null | undefined =>
  value === null || value === undefined

export const BoardMenuButton = (props: IconButtonProps) => {
  const { onClick, ['aria-label']: ariaLabelProp, ...iconButtonProps } = props
  const { query } = useRouter()

  const { user } = useUser()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { setRightPanel } = useEditor()

  const handleToDoListClick = async () => {
    setRightPanel(RightPanel.TODOLIST)
  }

  useEffect(() => {
    if (
      user &&
      isNotDefined(user.graphNavigation) &&
      isNotDefined(query.isFirstBot)
    )
      onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Tooltip label="Lista de pendências">
        <IconButton
          {...iconButtonProps}
          aria-label={ariaLabelProp ?? 'Lista de pendências'}
          onClick={(e) => {
            onClick?.(e)
            handleToDoListClick().then()
          }}
          bgColor="white"
          icon={<CheckIcon />}
          size="sm"
          shadow="lg"
        />
      </Tooltip>

      <EditorSettingsModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
