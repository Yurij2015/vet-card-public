import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import '../src/assets/main.css'
import Head from 'next/head'
import i18n from '../src/i18n'

export default function MyApp({ Component, pageProps }: AppProps) {
  // Sync language during render to help with hydration
  // Run on both server and client to avoid mismatch
  if (pageProps.lang && i18n.language !== pageProps.lang) {
    i18n.changeLanguage(pageProps.lang)
  }

  useEffect(() => {
    if (pageProps.lang && i18n.language !== pageProps.lang) {
      i18n.changeLanguage(pageProps.lang)
    }
  }, [pageProps.lang])

  console.log('MyApp rendering with lang:', pageProps.lang)
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
