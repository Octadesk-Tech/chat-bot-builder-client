import { VariablesMenu } from '../Graph/Nodes/StepNode/SettingsPopoverContent/bodies/InterpretDataWithAI/VariablesMenu'
import { MdOutlineVpnKey } from 'react-icons/md'
import { useSelectTokens, type Secret } from 'hooks/selectToken'
import { config } from 'config/octadesk.config'

const TOKENS_EXTERNAL_SETTINGS_HREF = `${
  config.basePath || ''
}/chat-settings/general/api-activation`

const SelectTokenButton = ({
  onSelectToken,
}: {
  onSelectToken: (token: any) => void
}) => {
  const { tokens, isLoading } = useSelectTokens()

  const handleSelect = (item: Secret) => {
    onSelectToken({ ...item, token: `${item.name}` })
  }

  return (
    <VariablesMenu
      items={tokens}
      getLabel={(item) => item.name}
      onSelect={handleSelect}
      searchPlaceholder="Pesquisar token..."
      emptyMessage={`Nenhum token encontrado. Você pode usar tokens de integração para proteger suas credenciais de API. Crie tokens <a style="text-decoration: underline;" href="${TOKENS_EXTERNAL_SETTINGS_HREF}" target="_blank">aqui</a>`}
      ariaLabel="Selecionar token"
      tooltip={isLoading ? 'Carregando tokens…' : 'Selecionar token'}
      icon={<MdOutlineVpnKey size={16} />}
      isDisabled={isLoading}
    />
  )
}

export default SelectTokenButton
