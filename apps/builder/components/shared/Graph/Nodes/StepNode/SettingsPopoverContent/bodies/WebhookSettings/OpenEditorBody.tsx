import { Tooltip, Modal, ModalBody, ModalContent, ModalOverlay, ModalCloseButton, IconButton, useDisclosure } from "@chakra-ui/react"
import { EditIcon } from 'assets/icons'
import { CodeEditor } from 'components/shared/CodeEditor'

import React from 'react'

type Props = {
  value?: string
  defaultValue?: string
  lang?: string
  isReadOnly?: boolean
  debounceTimeout?: number
  withVariableButton?: boolean
  height?: string
  maxHeight?: string
  minWidth?: string
  onChange?: (value: string) => void
}

export const OpenEditorBody = ({
  value,
  lang,
  onChange,
  ...props
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const btnRef = React.useRef(null)

  return (
    <>
    <Tooltip label="Abrir editor">
      <IconButton
        icon={<EditIcon marginLeft="5px" />}
        aria-label="Editor body"
        size="xs"
        onClick={onOpen}
        alignSelf={"flex-end"}
        width={"25px"}
      />
    </Tooltip>
      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior={"inside"}
        size={'xl'}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody margin={'15px'} top={"-10px"}>
          <CodeEditor
            value={value}
            lang="json"
            onChange={onChange}
            debounceTimeout={0}
          />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}