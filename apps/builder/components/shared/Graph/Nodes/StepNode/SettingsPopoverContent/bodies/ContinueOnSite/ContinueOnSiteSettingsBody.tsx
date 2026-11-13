import React from 'react'
import { Flex, FormLabel, Input, Spacer, Stack, Textarea } from '@chakra-ui/react'
import { ContinueOnSiteOptions } from 'models'
import { ContinueOnSiteBotSelect } from './ContinueOnSiteBotSelect'

// Limites da mensagem interativa cta_url do WhatsApp:
// header.text 60 (opcional), body.text 1024, footer.text 60 (opcional),
// action.parameters.display_text 20.
export const CONTINUE_ON_SITE_MAX_LENGTH = {
  title: 60,
  description: 1024,
  footer: 60,
  buttonText: 20,
}

type ContinueOnSiteSettingsBodyProps = {
  options: ContinueOnSiteOptions
  onOptionsChange: (options: ContinueOnSiteOptions) => void
}

type TextField = 'title' | 'description' | 'footer' | 'buttonText'

export const ContinueOnSiteSettingsBody = ({
  options,
  onOptionsChange,
}: ContinueOnSiteSettingsBodyProps) => {
  const handleTextChange =
    (field: TextField) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onOptionsChange({
        ...options,
        [field]: e.target.value,
      })
    }

  const handleBotChange = (fluxId: string) => {
    onOptionsChange({
      ...options,
      widgetFluxId: fluxId,
    })
  }

  const renderLabel = (htmlFor: string, label: string, field: TextField) => (
    <Flex>
      <FormLabel mb="0" htmlFor={htmlFor} fontWeight="bold" fontSize="sm">
        {label}
      </FormLabel>
      <Spacer />
      <FormLabel mb="0" htmlFor={htmlFor}>
        {options[field]?.length ?? 0}/{CONTINUE_ON_SITE_MAX_LENGTH[field]}
      </FormLabel>
    </Flex>
  )

  return (
    <Stack spacing={4}>
      <Stack>
        {renderLabel(
          'continue-on-site-title',
          'Texto do cabeçalho (opcional)',
          'title'
        )}
        <Input
          id="continue-on-site-title"
          placeholder="Insira o cabeçalho da mensagem..."
          value={options.title ?? ''}
          onChange={handleTextChange('title')}
          maxLength={CONTINUE_ON_SITE_MAX_LENGTH.title}
          size="md"
          focusBorderColor="blue.400"
        />
      </Stack>

      <Stack>
        {renderLabel(
          'continue-on-site-description',
          'Texto do corpo da mensagem',
          'description'
        )}
        <Textarea
          id="continue-on-site-description"
          placeholder="Insira o corpo da mensagem..."
          value={options.description ?? ''}
          onChange={handleTextChange('description')}
          maxLength={CONTINUE_ON_SITE_MAX_LENGTH.description}
          size="md"
          rows={4}
          resize="vertical"
          focusBorderColor="blue.400"
          isRequired
        />
      </Stack>

      <Stack>
        {renderLabel(
          'continue-on-site-footer',
          'Texto do rodapé (opcional)',
          'footer'
        )}
        <Input
          id="continue-on-site-footer"
          placeholder="Insira o texto do rodapé..."
          value={options.footer ?? ''}
          onChange={handleTextChange('footer')}
          maxLength={CONTINUE_ON_SITE_MAX_LENGTH.footer}
          size="md"
          focusBorderColor="blue.400"
        />
      </Stack>

      <Stack>
        {renderLabel(
          'continue-on-site-button-text',
          'Texto do botão',
          'buttonText'
        )}
        <Input
          id="continue-on-site-button-text"
          placeholder="Ex.: Continuar no site"
          value={options.buttonText ?? ''}
          onChange={handleTextChange('buttonText')}
          maxLength={CONTINUE_ON_SITE_MAX_LENGTH.buttonText}
          size="md"
          focusBorderColor="blue.400"
          isRequired
        />
      </Stack>

      <Stack>
        <FormLabel mb="0" fontWeight="bold" fontSize="sm">
          Bot do Chat no Site
        </FormLabel>
        <ContinueOnSiteBotSelect
          selectedFluxId={options.widgetFluxId}
          onSelect={handleBotChange}
        />
      </Stack>
    </Stack>
  )
}
