import { MenuList, MenuItem } from '@chakra-ui/react'
import { CopyIcon, TrashIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const BlockNodeContextMenu = ({
  blockIndex,
  blockId,
}: {
  blockIndex: number
  blockId: string
}) => {
  const { deleteBlockById, duplicateBlock } = useTypebot()

  const handleDeleteClick = () => deleteBlockById(blockId)

  const handleDuplicateClick = () => duplicateBlock(blockIndex)

  return (
    <MenuList>
      <MenuItem icon={<CopyIcon />} onClick={handleDuplicateClick}>
        Duplicar
      </MenuItem>
      <MenuItem icon={<TrashIcon />} onClick={handleDeleteClick}>
        Deletar
      </MenuItem>
    </MenuList>
  )
}
