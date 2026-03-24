import NextErrorComponent from 'next/error'

import * as Sentry from '@sentry/nextjs'
import { NextPageContext } from 'next'
import { useEffect } from 'react'

const MyError = ({
  statusCode,
  hasGetInitialPropsRun,
  err,
}: {
  statusCode: number
  hasGetInitialPropsRun: boolean
  err: Error
}) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err)
  }

  useEffect(() => {
    globalThis.location.replace(
      `${globalThis.location.origin}/automation-studio`
    )
  }, [])

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
