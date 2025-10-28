import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaRegSquarePlus } from 'react-icons/fa6'

type Variable = {
  token: string
  name: string
}

type Props = {
  variables: Variable[]
  onVariableSelect: (variable: Variable) => void
  ariaLabel?: string
}

export const VariablesMenu = ({
  variables,
  onVariableSelect,
  ariaLabel = 'Adicionar variável',
}: Props) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FaRegSquarePlus size={16} />}
        variant="ghost"
        size="sm"
        aria-label={ariaLabel}
      />
      <MenuList>
        {variables?.map((variable) => (
          <MenuItem
            key={variable.token}
            onClick={() => onVariableSelect(variable)}
          >
            <Stack spacing={0}>
              <Text fontSize="sm" fontWeight="medium">
                {variable.token}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {variable.name}
              </Text>
            </Stack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
