import type { AppProps } from 'next/app'
import '../src/assets/main.css'
import '../src/i18n'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
