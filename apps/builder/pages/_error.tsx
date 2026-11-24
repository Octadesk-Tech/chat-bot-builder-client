import NextErrorComponent from 'next/error'

import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import * as Sentry from '@sentry/nextjs'
import { NextPageContext } from 'next'
import { useEffect, useState } from 'react'

const isInsideIframe = () => globalThis.self !== globalThis.top

const notifyParentOfBuilderError = () => {
  globalThis.parent.postMessage({ name: 'builderError' }, '*')
}

const redirectToAutomationStudio = () => {
  globalThis.location.replace(
    `${globalThis.location.origin}/automation-studio`
  )
}

const reloadEditor = () => {
  globalThis.location.reload()
}

const EmbeddedErrorPage = () => (
  <VStack h="100vh" justify="center" spacing="4" px="6" textAlign="center">
    <Heading size="md">Algo deu errado no editor</Heading>
    <Text color="gray.600">
      Recarregue o editor para voltar ao último estado salvo.
    </Text>
    <Button colorScheme="blue" onClick={reloadEditor}>
      Recarregar editor
    </Button>
  </VStack>
)

const MyError = ({
  statusCode,
  hasGetInitialPropsRun,
  err,
}: {
  statusCode: number
  hasGetInitialPropsRun: boolean
  err: Error
}) => {
  const [isEmbedded, setIsEmbedded] = useState<boolean>()

  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err)
  }

  useEffect(() => {
    const embedded = isInsideIframe()
    setIsEmbedded(embedded)

    if (!embedded) {
      redirectToAutomationStudio()
      return
    }

    notifyParentOfBuilderError()
  }, [])

  if (isEmbedded === undefined) return null

  if (isEmbedded) return <EmbeddedErrorPage />

  return <NextErrorComponent statusCode={statusCode} />
}

MyError.getInitialProps = async (context: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context)

  const { res, err, asPath } = context

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  errorInitialProps.hasGetInitialPropsRun = true

  if (res?.statusCode === 404) {
    return errorInitialProps
  }

  if (err) {
    Sentry.captureException(err)

    await Sentry.flush(2000)

    return errorInitialProps
  }

  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  )

  await Sentry.flush(2000)

  return errorInitialProps
}

export default MyError
